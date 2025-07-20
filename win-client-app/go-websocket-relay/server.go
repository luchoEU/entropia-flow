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
	log.Printf("[router] Routing message '%s' from '%s' to '%s'", msg.MessageType, msg.From, msg.To)

	// Special handling for broadcasting to all clients.
	if msg.To == "*ALL" {
		r.server.mutex.Lock()
		defer r.server.mutex.Unlock()
		for id, conn := range r.server.clients {
			msg.To = id
			jsonMessage, err := json.Marshal(msg)
			if err != nil {
				log.Printf("[router] Error marshalling message for '%s': %v", id, err)
				continue
			}
			if err := conn.WriteMessage(messageType, jsonMessage); err != nil {
				log.Printf("[router] Failed to broadcast to '%s': %v", id, err)
			}
		}
		return
	}

	r.server.mutex.Lock()
	recipientConn, isClient := r.server.clients[msg.To]
	r.server.mutex.Unlock()

	if isClient {
		if err := recipientConn.WriteMessage(messageType, rawMessage); err != nil {
			log.Printf("[router] Failed to send to '%s': %v", msg.To, err)
		}
		return
	}

	if handler, isInternal := r.server.internalHandlers[msg.To]; isInternal {
		go handler(msg)
		return
	}

	log.Printf("[router] Recipient '%s' not found.", msg.To)
}

// RouteMessage marshals a RelayMessage struct and sends it via the main Route method.
func (r *Router) RouteMessage(msg RelayMessage) {
	jsonData, err := json.Marshal(msg)
	if err != nil {
		log.Printf("[router] Error marshalling internal message for '%s': %v", msg.To, err)
		return
	}
	// We always send internal messages as Text messages.
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
		conn.Close() // Ensure the connection is closed.
		s.mutex.Lock()
		if clientID != "" {
			delete(s.clients, clientID)
			log.Printf("[server] Client '%s' disconnected. Cleaning up.", clientID)
		}
		s.mutex.Unlock()
		s.sendStatusUpdate("*ALL")
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
			s.sendStatusUpdate("*ALL")
		default:
			s.router.Route(msg, p, messageType)
		}
	}
}

// handleServerNodeMessage is the dispatcher for commands sent to the "server-node" itself.
func (s *Server) handleServerNodeMessage(msg RelayMessage) {
	log.Printf("[s-node] Received command: '%s' from '%s'", msg.MessageType, msg.From)
	switch msg.MessageType {
	case "get-status":
		s.sendStatusUpdate(msg.From)
	case "set-port":
		s.handleSetPort(msg)
	default:
		log.Printf("[s-node] Unknown command '%s'", msg.MessageType)
	}
}

// handleSetPort updates the configuration with a new port.
func (s *Server) handleSetPort(msg RelayMessage) {
	payloadMap, ok := msg.Payload.(map[string]interface{})
	if !ok {
		log.Printf("[s-node] Invalid payload format for set-port.")
		return
	}
	// JSON decodes numbers into float64, so we must handle that type.
	portFloat, ok := payloadMap["port"].(float64)
	if !ok || portFloat < 1 || portFloat > 65535 {
		log.Printf("[s-node] 'port' missing or invalid in set-port payload.")
		return
	}
	newPort := int(portFloat)

	err := s.configService.SetWebSocketPort(newPort)
	if err != nil {
		log.Printf("[s-node] CRITICAL: Failed to save new port configuration! %v", err)
		return
	}

	log.Printf("[s-node] Port updated to %d in config. A RESTART is required for this change to take effect.", newPort)

	// Send a confirmation message back to the client.
	s.router.RouteMessage(RelayMessage{
		MessageType: "port-set-ack",
		From:        "server-node",
		To:          msg.From,
		Payload: map[string]interface{}{
			"newPort": newPort,
			"message": "Port configuration saved. Please restart the application for the change to take effect.",
		},
	})
}

// sendStatusUpdate gathers server status and sends it to the specified target.
func (s *Server) sendStatusUpdate(targetID string) {
	s.mutex.Lock()
	// Create a list of connected client IDs.
	var clientIDs []string
	for id := range s.clients {
		clientIDs = append(clientIDs, id)
	}
	s.mutex.Unlock()

	// Get the port from the authoritative source.
	currentPort := s.configService.Get().WebSocketPort

	statusPayload := map[string]interface{}{
		"status":           "Running",
		"port":             currentPort,
		"connectedClients": clientIDs,
	}

	s.router.RouteMessage(RelayMessage{
		MessageType: "server-status",
		From:        "server-node",
		To:          targetID,
		Payload:     statusPayload,
	})
	log.Printf("[s-node] Sent status update to '%s'", targetID)
}

func registerServerNode(s *Server) {
	log.Println("[s-node] Initializing...")
	s.internalHandlers["server-node"] = s.handleServerNodeMessage
}

// internalRegistrars holds functions that set up internal services.
var internalRegistrars = make(map[string]func(*Server))

// registerInternal allows services to register themselves.
func registerInternal(name string, registrar func(*Server)) {
	internalRegistrars[name] = registrar
}

// Start registers handlers and begins listening for connections.
func (s *Server) Start(argPort int) error {
	// Register the server's own handler.
	registerServerNode(s)

	for name, fn := range internalRegistrars {
		log.Printf("[server] Registering internal node: %s", name)
		fn(s)
	}

	http.HandleFunc("/", s.handleWebSocket)

	port := argPort
	if (port == 0) {
		port = s.configService.Get().WebSocketPort
	}
	listenAddr := fmt.Sprintf(":%d", port)

	log.Printf("[server] Server listening on %s", listenAddr)
	return http.ListenAndServe(listenAddr, nil)
}
