// main.go

package main

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

// RelayMessage defines the structure for our JSON messages, matching the clients.
type RelayMessage struct {
	MessageType string      `json:"type"`
	From        string      `json:"from"`
	To          string      `json:"to,omitempty"`
	Payload     interface{} `json:"data"` // interface{} can hold any JSON value
}

// Server holds the shared state, protected by a mutex for concurrent access.
type Server struct {
	clients map[string]*websocket.Conn
	mutex   sync.Mutex
}

// NewServer creates and returns a new Server instance.
func NewServer() *Server {
	return &Server{
		clients: make(map[string]*websocket.Conn),
	}
}

// upgrader is used to upgrade an HTTP connection to a WebSocket connection.
// We set CheckOrigin to allow connections from any origin (e.g., Neutralino's file://).
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

// handleWebSocket is the core handler for each new connection.
func (s *Server) handleWebSocket(w http.ResponseWriter, r *http.Request) {
	// Upgrade the HTTP connection to a WebSocket connection.
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Upgrade error:", err)
		return
	}

	// This variable will hold the ID of the client for this connection.
	var clientID string

	// --- Cleanup on disconnect ---
	// A defer statement ensures this code runs when the function exits,
	// which happens when the client disconnects.
	defer func() {
		// Lock the mutex to safely modify the shared map.
		s.mutex.Lock()
		// If the client had an ID, remove it from the map.
		if clientID != "" {
			delete(s.clients, clientID)
			log.Printf("Client '%s' disconnected. Cleaning up.", clientID)
		}
		s.mutex.Unlock()
		conn.Close()
	}()

	// --- Main message loop ---
	// Continuously read messages from the client.
	for {
		// Read a message. The loop will break if the client disconnects.
		messageType, p, err := conn.ReadMessage()
		if err != nil {
			break // Exit loop on error (usually means client disconnected).
		}

		var msg RelayMessage
		if err := json.Unmarshal(p, &msg); err != nil {
			log.Println("JSON unmarshal error:", err)
			continue // Skip malformed messages.
		}

		switch msg.MessageType {
		case "identify":
			s.mutex.Lock()
			clientID = msg.From
			s.clients[clientID] = conn
			log.Printf("Client '%s' connected and identified.", clientID)
			s.mutex.Unlock()

		default:
			if msg.To == "" {
				log.Printf("Missing 'to' field in '%s' message.", msg.MessageType)
				continue
			}
			log.Printf("Relaying '%s' message from '%s' to '%s'", msg.MessageType, msg.From, msg.To)

			s.mutex.Lock()
			// Find the recipient's connection.
			recipientConn, found := s.clients[msg.To]
			s.mutex.Unlock() // Unlock immediately after reading from the map.

			if found {
				// Forward the raw message bytes to the recipient.
				if err := recipientConn.WriteMessage(messageType, p); err != nil {
					log.Printf("Failed to send to '%s': %v", msg.To, err)
				}
			} else {
				log.Printf("Recipient '%s' not found.", msg.To)
			}
		}
	}
}

func main() {
	log.Println("Starting Go WebSocket Relay Server...")
	server := NewServer()

	// All requests to "/" will be handled by our WebSocket handler.
	http.HandleFunc("/", server.handleWebSocket)

	// Start the HTTP server on port 6522.
	log.Println("Server listening on :6522")
	if err := http.ListenAndServe(":6522", nil); err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}
