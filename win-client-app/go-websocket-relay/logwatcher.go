// logwatcher.go
package main

import (
	"bufio"
	"io"
	"log"
	"os"
	"path/filepath"
	"strings"
	"sync"

	"github.com/fsnotify/fsnotify"
)

const requiredLogFilename = "chat.log"

// LogWatcher is a stateful service that can be started and stopped via messages.
// It relies on the ConfigService for its path configuration.
type LogWatcher struct {
	server       *Server
	mutex        sync.Mutex
	watcher      *fsnotify.Watcher
	done         chan struct{}
	lastPosition int64
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
	case "get-config":
		lw.handleGetConfig(msg.From)
	case "set-config":
		lw.handleSetConfig(msg)
	case "start":
		lw.start()
	case "stop":
		lw.stop()
	default:
		log.Printf("[logwch] Unknown command '%s'", msg.MessageType)
	}
}

// handleGetConfig sends the current configuration back to the requester.
// It gets the path directly from the ConfigService.
func (lw *LogWatcher) handleGetConfig(requesterID string) {
	currentPath := lw.server.configService.Get().LogWatcherPath

	// The payload can be a simple map for flexibility.
	configPayload := map[string]string{"filePath": currentPath}

	responseMsg := RelayMessage{
		MessageType: "logwatcher-config",
		From:        "logwatcher",
		To:          requesterID,
		Payload:     configPayload,
	}
	lw.server.router.RouteMessage(responseMsg)
	log.Printf("[logwch] Sent config to '%s': Path=%s", requesterID, currentPath)
}

// handleSetConfig validates a new path and tells the ConfigService to save it.
func (lw *LogWatcher) handleSetConfig(msg RelayMessage) {
	payloadMap, ok := msg.Payload.(map[string]interface{})
	if !ok {
		log.Printf("[logwch] Invalid payload format for set-config.")
		return
	}
	newPath, ok := payloadMap["filePath"].(string)
	if !ok {
		log.Printf("[logwch] 'filePath' missing or not a string in set-config payload.")
		return
	}
	newPath = strings.TrimSpace(newPath)

	// --- Validation ---
	if filepath.Base(newPath) != requiredLogFilename {
		log.Printf("[logwch] Validation failed. Path must end with '%s'. Path received: %s", requiredLogFilename, newPath)
		return
	}
	if _, err := os.Stat(newPath); os.IsNotExist(err) {
		log.Printf("[logwch] Validation failed. File does not exist at path: %s", newPath)
		return
	}

	// --- Delegate to ConfigService ---
	err := lw.server.configService.SetLogWatcherPath(newPath)
	if err != nil {
		log.Printf("[logwch] CRITICAL: Failed to save new configuration! %v", err)
	} else {
		log.Printf("[logwch] Configuration updated and saved. New path is: %s", newPath)
	}

	// Send the (potentially updated) config back to the client for confirmation.
	lw.handleGetConfig(msg.From)
}

// start uses the path from the ConfigService to begin watching.
func (lw *LogWatcher) start() {
	lw.mutex.Lock()
	defer lw.mutex.Unlock()

	if lw.watcher != nil {
		log.Println("[logwch] Received start command, but watcher is already running.")
		return
	}

	// Get the currently configured path from the single source of truth.
	filePath := lw.server.configService.Get().LogWatcherPath
	if filePath == "" {
		log.Println("[logwch] Cannot start, file path is not configured.")
		return
	}

	fileInfo, err := os.Stat(filePath)
	if err != nil {
		log.Printf("[logwch] Cannot start watcher, file not found or inaccessible: %s (%v)", filePath, err)
		return
	}

	watcher, err := fsnotify.NewWatcher()
	if err != nil {
		log.Printf("[logwch] Failed to create new fsnotify watcher: %v", err)
		return
	}
	if err := watcher.Add(filePath); err != nil {
		log.Printf("[logwch] Failed to add file to watcher: %v", err)
		watcher.Close()
		return
	}

	lw.watcher = watcher
	lw.lastPosition = fileInfo.Size()
	lw.done = make(chan struct{})

	// Start the watch loop in a goroutine, passing the file path to it.
	go lw.watchLoop(filePath)

	log.Printf("[logwch] Started watching file: %s", filePath)
}

// stop terminates the currently active watch loop.
func (lw *LogWatcher) stop() {
	lw.mutex.Lock()
	defer lw.mutex.Unlock()

	if lw.watcher == nil {
		log.Println("[logwch] Received stop command, but watcher was not running.")
		return
	}

	close(lw.done) // Signal the watchLoop to exit.
	lw.watcher = nil
	lw.done = nil
	log.Println("[logwch] Stopped watching.")
}

// watchLoop is the main event loop for an active watching session.
func (lw *LogWatcher) watchLoop(filePath string) {
	defer lw.watcher.Close()
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
