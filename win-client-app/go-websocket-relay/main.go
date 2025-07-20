package main

import (
	"flag"
	"io"
	"log"
	"os"

	"gopkg.in/natefinch/lumberjack.v2"
)

func main() {
	portPtr := flag.Int("port", 0, "The port for the WebSocket relay server to listen on")
	flag.Parse()
	port := *portPtr // Dereference the pointer to get the actual port value

	logFile := &lumberjack.Logger{
		Filename:   "EntropiaFlowClient-relay.log", // Log file name
		MaxSize:    5,           // Max size in MB before rotation
		MaxBackups: 0,           // Max number of old log files to keep
		MaxAge:     30,          // Max age in days to keep a log file
		Compress:   false,       // Compress the old log files
	}
	multiWriter := io.MultiWriter(os.Stdout, logFile)
	log.SetOutput(multiWriter)

	log.Println("[main  ] Starting Go WebSocket Relay Server...")

	configService, err := NewConfigService()
	if err != nil {
		log.Fatal("FATAL: Could not initialize configuration: ", err)
	}

	server := NewServer(configService)
	if err := server.Start(port); err != nil {
		log.Fatal("FATAL: Server failed to start: ", err)
	}
}
