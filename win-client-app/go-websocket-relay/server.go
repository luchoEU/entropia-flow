package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

// RelayMessage defines the structure for our JSON messages.
type RelayMessage struct {
	MessageType string      `json:"type"`
	From        string      `json:"from"`
	To          string      `json:"to,omitempty"`
	Payload     interface{} `json:"data"`
}

// Router handles the logic of forwarding messages.
type Router struct {
	server *Server
}

// NewRouter creates a new router associated with a server.
func NewRouter(s *Server) *Router {
	return &Router{server: s}
}

// Route directs a raw message from a client to its intended recipient.
func (r *Router) Route(msg RelayMessage, rawMessage []byte, messageType int) {
	if msg.To == "" {
		log.Printf("[server] Missing 'to' field in '%s' message from '%s'. Discarding.", msg.MessageType, msg.From)
		return
	}
	log.Printf("[server] Routing message '%s' from '%s' to '%s'", msg.MessageType, msg.From, msg.To)

	r.server.mutex.Lock()
	recipientConn, isClient := r.server.clients[msg.To]
	r.server.mutex.Unlock()

	if isClient {
		if err := recipientConn.WriteMessage(messageType, rawMessage); err != nil {
			log.Printf("[server] Failed to send to client '%s': %v", msg.To, err)
		}
		return
	}

	if handler, isInternal := r.server.internalHandlers[msg.To]; isInternal {
		go handler(msg)
		return
	}

	log.Printf("[server] Recipient '%s' not found.", msg.To)
}

func (r *Router) RouteMessage(msg RelayMessage) {
	jsonData, err := json.Marshal(msg)
	if err != nil {
		log.Printf("[server] Error marshalling internal message for '%s': %v", msg.To, err)
		return
	}
	r.Route(msg, jsonData, websocket.TextMessage)
}

// Server holds the shared state for the application.
type Server struct {
	clients          map[string]*websocket.Conn
	internalHandlers map[string]func(RelayMessage)
	router           *Router
	configService    *ConfigService
	mutex            sync.Mutex
}

// NewServer creates and returns a new Server instance.
func NewServer(cs *ConfigService) *Server {
	s := &Server{
		clients:          make(map[string]*websocket.Conn),
		internalHandlers: make(map[string]func(RelayMessage)),
		configService:    cs,
	}
	s.router = NewRouter(s)
	return s
}

// upgrader is used to upgrade an HTTP connection to a WebSocket connection.
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all connections
	},
}

// handleWebSocket manages the lifecycle of a single WebSocket connection.
func (s *Server) handleWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("[server] Upgrade error:", err)
		return
	}
	var clientID string
	defer func() {
		s.mutex.Lock()
		if clientID != "" {
			delete(s.clients, clientID)
			log.Printf("[server] Client '%s' disconnected. Cleaning up.", clientID)
		}
		s.mutex.Unlock()

		// Broadcast disconnect to all other clients
		for otherID := range s.clients {
			s.router.RouteMessage(RelayMessage{
				MessageType: "disconnect",
				From:        clientID,
				To:          otherID,
				Payload:     nil,
			})
		}
	}()
	for {
		messageType, p, err := conn.ReadMessage()
		if err != nil {
			break
		}
		var msg RelayMessage
		if err := json.Unmarshal(p, &msg); err != nil {
			log.Println("[server] JSON unmarshal error:", err)
			continue
		}
		switch msg.MessageType {
		case "identify":
			s.mutex.Lock()
			if oldConn, exists := s.clients[msg.From]; exists && oldConn != conn {
				log.Printf("[server] Client ID '%s' already in use. Disconnecting old client.", msg.From)
				oldConn.Close()
			}
			clientID = msg.From
			s.clients[clientID] = conn
			log.Printf("[server] Client '%s' connected and identified.", clientID)
			s.mutex.Unlock()
		default:
			s.router.Route(msg, p, messageType)
		}
	}
}

// internalRegistrars holds functions that set up internal services.
var internalRegistrars = make(map[string]func(*Server))

// registerInternal allows services like the logwatcher to register themselves.
func registerInternal(name string, registrar func(*Server)) {
	internalRegistrars[name] = registrar
}

// Start registers handlers and begins listening for connections.
// This function will block until the server fatally errors.
func (s *Server) Start() error {
	// Register all the "internal" services that have been defined.
	for name, fn := range internalRegistrars {
		log.Printf("[server] Registering internal node: %s", name)
		fn(s)
	}

	// Set the main WebSocket handler.
	http.HandleFunc("/", s.handleWebSocket)

	// Get the port from our loaded configuration.
	port := s.configService.Get().WebSocketPort
	listenAddr := fmt.Sprintf(":%d", port)

	log.Printf("[server] Server listening on %s", listenAddr)
	return http.ListenAndServe(listenAddr, nil)
}
