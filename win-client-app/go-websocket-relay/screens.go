package main

import (
    "encoding/json"
    "log"

    "github.com/kbinani/screenshot"
    "github.com/gorilla/websocket"
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

// internalScreensHandler registers itself during init
func internalScreensHandler(server *Server) {
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

        server.mutex.Lock()
        toConn, ok := server.clients[msg.From]
        server.mutex.Unlock()

        if ok {
            raw, _ := json.Marshal(response)
            toConn.WriteMessage(websocket.TextMessage, raw)
        } else {
            log.Printf("[screens] Cannot respond to '%s': not connected", msg.From)
        }
    }

    log.Println("[screens] Internal handler registered.")
}

func init() {
    registerInternal("screens", internalScreensHandler)
}
