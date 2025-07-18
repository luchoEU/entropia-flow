package main

import (
	"log"

	"github.com/kbinani/screenshot"
)

// RelayMessage must be accessible here — you already have it in main.go.
type ScreenInfo struct {
	X      int `json:"x"`
	Y      int `json:"y"`
	Width  int `json:"width"`
	Height int `json:"height"`
}

func getAllScreens() []ScreenInfo {
	n := screenshot.NumActiveDisplays()
	var screens []ScreenInfo
	for i := 0; i < n; i++ {
		bounds := screenshot.GetDisplayBounds(i)
		screens = append(screens, ScreenInfo{
			X:      bounds.Min.X,
			Y:      bounds.Min.Y,
			Width:  bounds.Dx(),
			Height: bounds.Dy(),
		})
	}
	return screens
}

func internalScreensHandler(server *Server) {
	log.Println("[screen] Initializing...")

	server.internalHandlers["screens"] = func(msg RelayMessage) {
		if msg.MessageType != "get_screens" {
			return
		}

		screens := getAllScreens()

		response := RelayMessage{
			MessageType: "screens_response",
			From:        "screens",
			To:          msg.From,
			Payload:     screens,
		}

		server.router.RouteMessage(response)
	}
}

func init() {
	registerInternal("screens", internalScreensHandler)
}
