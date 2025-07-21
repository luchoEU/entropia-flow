// logwatcher.go
package main

import (
	"bufio"
	"fmt"
	"io"
	"log"
	"os"
	"strings"
	"sync"

	"github.com/fsnotify/fsnotify"
)

// LogWatcher is a stateful service that can be started and stopped via messages.
// It relies on the ConfigService for its path configuration.
type LogWatcher struct {
	server       *Server
	mutex        sync.Mutex
	watcher      *fsnotify.Watcher
	done         chan struct{}
	lastPosition int64
	lastErrorMsg string
}

// registerLogWatcher creates the LogWatcher instance and registers its message handler.
func registerLogWatcher(s *Server) {
	log.Println("[logwch] Initializing...")
	lw := &LogWatcher{
		server: s,
	}
	s.internalHandlers["logwatcher"] = lw.HandleMessage
	lw.start()
}

// HandleMessage is the central dispatcher for all commands sent to the "logwatcher" service.
func (lw *LogWatcher) HandleMessage(msg RelayMessage) {
	log.Printf("[logwch] Received command: '%s' from '%s'", msg.MessageType, msg.From)
	switch msg.MessageType {
	case "get-status":
		lw.sendStatusUpdate(msg.From)
	case "set-path":
		lw.handleSetPath(msg)
	case "start":
		lw.start()
	case "stop":
		lw.stop()
	default:
		log.Printf("[logwch] Unknown command '%s'", msg.MessageType)
	}
}

// handleSetPath validates a new path, stops any active watcher, and saves the new config.
func (lw *LogWatcher) handleSetPath(msg RelayMessage) {
	payloadMap, ok := msg.Payload.(map[string]interface{})
	if !ok {
		log.Printf("[logwch] Invalid payload format for set-path.")
		lw.lastErrorMsg = "Invalid payload format."
		lw.sendStatusUpdate("")
		return
	}
	newPath, ok := payloadMap["filePath"].(string)
	if !ok {
		log.Printf("[logwch] 'filePath' missing or not a string in set-path payload.")
		lw.lastErrorMsg = "'filePath' missing or not a string."
		lw.sendStatusUpdate("")
		return
	}
	newPath = strings.TrimSpace(newPath)

	if _, err := os.Stat(newPath); os.IsNotExist(err) {
		errorMsg := fmt.Sprintf("Validation failed. File does not exist at path: %s", newPath)
		log.Println("[logwch]", errorMsg)
		lw.lastErrorMsg = errorMsg
		lw.sendStatusUpdate("")
		return
	}

	// Stop the watcher before changing the path to prevent watching a stale file.
	// We use a private stop method to avoid sending a premature status update.
	lw._stop(false) // Don't log "command received" message.

	err := lw.server.configService.SetLogWatcherPath(newPath)
	if err != nil {
		log.Printf("[logwch] CRITICAL: Failed to save new configuration! %v", err)
	} else {
		log.Printf("[logwch] Configuration updated and saved. New path is: %s", newPath)
	}

	lw.start()

	// Send a single, definitive status update after all changes are made.
	lw.sendStatusUpdate("")
}

// start uses the path from the ConfigService to begin watching.
func (lw *LogWatcher) start() {
	lw.mutex.Lock()
	defer lw.mutex.Unlock()

	// Clear any previous error when attempting a new start.
	lw.lastErrorMsg = ""

	if lw.watcher != nil {
		log.Println("[logwch] Received start command, but watcher is already running.")
		lw.sendStatusUpdate("")
		return
	}

	filePath := lw.server.configService.Get().LogWatcherPath
	if filePath == "" {
		log.Println("[logwch] Cannot start, file path is not configured.")
		lw.lastErrorMsg = "File path is not configured."
		lw.sendStatusUpdate("")
		return
	}

	fileInfo, err := os.Stat(filePath)
	if err != nil {
		lw.lastErrorMsg = "Log file not found or inaccessible."
		log.Printf("[logwch] Cannot start watcher: %s (%v)", lw.lastErrorMsg, err)
		lw.sendStatusUpdate("")
		return
	}

	watcher, err := fsnotify.NewWatcher()
	if err != nil {
		log.Printf("[logwch] Failed to create new fsnotify watcher: %v", err)
		lw.lastErrorMsg = "Failed to create watcher."
		lw.sendStatusUpdate("")
		return
	}
	if err := watcher.Add(filePath); err != nil {
		log.Printf("[logwch] Failed to add file to watcher: %v", err)
		watcher.Close()
		lw.lastErrorMsg = "Failed to add file to watcher."
		lw.sendStatusUpdate("")
		return
	}

	lw.watcher = watcher
	lw.lastPosition = fileInfo.Size()
	lw.done = make(chan struct{})

	// Start the watch loop in a goroutine, passing the file path to it.
	go lw.watchLoop(filePath)

	log.Printf("[logwch] Started watching file: %s", filePath)
	lw.sendStatusUpdate("")
}

// stop is the public handler for the "stop" command.
func (lw *LogWatcher) stop() {
	wasRunning := lw.watcher != nil
	lw._stop(true) // Use the private stop method and log the command receipt.
	if wasRunning {
		log.Println("[logwch] Stopped watching.")
	}
	lw.sendStatusUpdate("")
}

// _stop is a private method that contains the core logic for stopping the watcher.
// It does not send a status update, allowing the caller to do so.
func (lw *LogWatcher) _stop(logCommand bool) {
	lw.mutex.Lock()
	defer lw.mutex.Unlock()

	if lw.watcher == nil {
		if logCommand {
			log.Println("[logwch] Received stop command, but watcher was not running.")
		}
		return
	}

	close(lw.done)
	lw.watcher = nil
	lw.done = nil
	// Clear any errors on a clean stop.
	lw.lastErrorMsg = ""
}

// sendStatusUpdate constructs and sends a status message to the client.
func (lw *LogWatcher) sendStatusUpdate(targetID string) {
	filePath := lw.server.configService.Get().LogWatcherPath
	var statusString string

	// Determine status string with user-friendly text and error checking.
	if lw.lastErrorMsg != "" {
		statusString = "Error"
	} else if lw.watcher != nil {
		statusString = "Started"
	} else if filePath == "" {
		statusString = "Not configured"
	} else {
		statusString = "Stopped"
	}

	// The payload includes the status, path, and any specific error message.
	statusPayload := map[string]interface{}{
		"status":   statusString,
		"filePath": filePath,
		"error":    lw.lastErrorMsg, // Will be an empty string if there's no error.
	}

	to := "entropia-flow-client"
	if targetID != "" {
		to = targetID
	}

	msg := RelayMessage{
		MessageType: "logwatcher_status",
		From:        "logwatcher",
		To:          to,
		Payload:     statusPayload,
	}
	lw.server.router.RouteMessage(msg)

	log.Printf("[logwch] Sent status update to '%s': %s, Path: '%s'", to, statusString, filePath)
}

// watchLoop is the main event loop for an active watching session.
func (lw *LogWatcher) watchLoop(filePath string) {
	defer func() {
		if r := recover(); r != nil {
			log.Println("[logwch] Recovered from panic in watchLoop", r)
		}
		if lw.watcher != nil {
			lw.watcher.Close()
		}
	}()
	for {
		select {
		case event, ok := <-lw.watcher.Events:
			if !ok {
				return // Channel was closed
			}
			if event.Op&fsnotify.Write == fsnotify.Write {
				lw.processNewLines(filePath)
			}
		case err, ok := <-lw.watcher.Errors:
			if !ok {
				return // Channel was closed
			}
			log.Println("[logwch] Internal error:", err)
		case <-lw.done:
			// The stop() method closed the channel.
			return
		}
	}
}

// processNewLines reads new content from the file and dispatches it.
func (lw *LogWatcher) processNewLines(filePath string) {
	file, err := os.OpenFile(filePath, os.O_RDONLY, 0)
	if err != nil {
		log.Printf("[logwch] Error opening log file: %v", err)
		return
	}
	defer file.Close()

	if _, err := file.Seek(lw.lastPosition, io.SeekStart); err != nil {
		log.Printf("[logwch] Error seeking in log file: %v", err)
		return
	}

	var newLines []string
	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := scanner.Text()
		if line != "" {
			newLines = append(newLines, line)
		}
	}

	if err := scanner.Err(); err != nil {
		log.Printf("[logwch] Error scanning log file: %v", err)
	}

	// If we found any new lines, join them with \n and send as a single message.
	if len(newLines) > 0 {
		allNewLines := strings.Join(newLines, "\n")
		lw.sendToExtension(allNewLines)
	}

	// Update the position to the end of what was just read.
	newPosition, err := file.Seek(0, io.SeekCurrent)
	if err == nil {
		lw.lastPosition = newPosition
	} else {
		log.Printf("[logwch] Error getting current position after reading: %v", err)
	}
}

// sendToExtension constructs the message and uses the router to send it.
func (lw *LogWatcher) sendToExtension(lineText string) {
	msg := RelayMessage{
		MessageType: "log",
		From:        "logwatcher",
		To:          "chrome-extension",
		Payload:     lineText,
	}
	lw.server.router.RouteMessage(msg)
}

func init() {
	registerInternal("logwatcher", registerLogWatcher)
}
