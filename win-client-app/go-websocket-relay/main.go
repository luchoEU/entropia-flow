package main

import (
	"io"
	"log"
	"os"

	"gopkg.in/natefinch/lumberjack.v2"
)

func main() {
	// 1. Set up lumberjack logger
	logFile := &lumberjack.Logger{
		Filename:   "EntropiaFlowClient-relay.log", // Log file name
		MaxSize:    5,           // Max size in MB before rotation
		MaxBackups: 0,           // Max number of old log files to keep
		MaxAge:     30,          // Max age in days to keep a log file
		Compress:   false,       // Compress the old log files
	}

	// 2. Create a multi-writer that directs log output to both the file and standard out.
	multiWriter := io.MultiWriter(os.Stdout, logFile)

	// 3. Set the logger's output to our new multi-writer.
	log.SetOutput(multiWriter)

	log.Println("[main  ] Starting Go WebSocket Relay Server...")

	// Initialize the configuration service
	configService, err := NewConfigService()
	if err != nil {
		log.Fatal("FATAL: Could not initialize configuration: ", err)
	}

	// Create the main server instance, passing it the config
	server := NewServer(configService)

	// Start the server (this will block until an error occurs)
	if err := server.Start(); err != nil {
		log.Fatal("FATAL: Server failed to start: ", err)
	}
}
