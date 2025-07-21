package main

import (
	"flag"
	"io"
	"log"
	"os"
	"path/filepath"

	"gopkg.in/natefinch/lumberjack.v2"
)

func getLogger() *lumberjack.Logger {
	exePath, err := os.Executable()
	if err != nil {
		panic(err)
	}
	exeDir := filepath.Dir(exePath)
	logPath := filepath.Join(exeDir, "EntropiaFlowClient-relay.log")

	return &lumberjack.Logger{
		Filename:   logPath,
		MaxSize:    5,  // MB
		MaxBackups: 0,
		MaxAge:     30, // days
		Compress:   false,
	}
}

func main() {
	portPtr := flag.Int("port", 0, "The port for the WebSocket relay server to listen on")
	flag.Parse()
	port := *portPtr // Dereference the pointer to get the actual port value

	logFile := getLogger()
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
