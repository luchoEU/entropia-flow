// src/main.rs

use axum::{
    extract::{
        ws::{Message, WebSocket, WebSocketUpgrade},
        State,
    },
    response::Response,
    routing::get,
    Router,
};
use futures::{
    sink::SinkExt,
    stream::{SplitSink, StreamExt},
};
use serde::{Deserialize, Serialize};
use std::{collections::HashMap, net::SocketAddr, sync::Arc};
use tokio::sync::Mutex;
use tracing::info;

// --- SHARED STATE & MESSAGE STRUCTURES ---

#[derive(Clone)]
struct AppState {
    clients: Arc<Mutex<HashMap<String, SplitSink<WebSocket, Message>>>>,
}

#[derive(Serialize, Deserialize, Debug)]
struct RelayMessage {
    #[serde(rename = "type")]
    message_type: String,
    from: String,
    to: Option<String>,
    payload: serde_json::Value,
}


// --- MAIN APPLICATION ENTRY POINT ---

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .with_env_filter("info")
        .init();

    let state = AppState {
        clients: Arc::new(Mutex::new(HashMap::new())),
    };

    let app = Router::new()
        .route("/relay", get(websocket_handler))
        .with_state(state);
    
    // The address to listen on. 0.0.0.0 means listen on all available network interfaces.
    let addr = SocketAddr::from(([0, 0, 0, 0], 6522));
    info!("WebSocket relay server listening on {}", addr);
    
    // *** THIS IS THE CORRECTED LINE ***
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}


// --- WEBSOCKET HANDLING LOGIC ---

async fn websocket_handler(
    ws: WebSocketUpgrade,
    State(state): State<AppState>,
) -> Response {
    ws.on_upgrade(|socket| handle_socket(socket, state))
}

async fn handle_socket(socket: WebSocket, state: AppState) {
    // We only need the receiver to be mutable now.
    let (sender, mut receiver) = socket.split();
    let mut client_id: Option<String> = None;

    // Step 1: Wait for the client to identify itself
    if let Some(Ok(Message::Text(text))) = receiver.next().await {
        if let Ok(msg) = serde_json::from_str::<RelayMessage>(&text) {
            if msg.message_type == "identify" {
                let id = msg.from;
                info!("Client '{}' connected and identified.", id);
                client_id = Some(id.clone());
                let mut clients = state.clients.lock().await;
                clients.insert(id, sender);
            } else {
                info!("First message from client was not 'identify'. Closing connection.");
                return;
            }
        }
    } else {
        info!("Client disconnected before identifying.");
        return;
    }

    // Step 2: Main message relay loop
    if let Some(id) = client_id.clone() {
        while let Some(Ok(msg)) = receiver.next().await {
            if let Message::Text(text) = msg {
                if let Ok(relay_msg) = serde_json::from_str::<RelayMessage>(&text) {
                    if relay_msg.message_type == "message" {
                        if let Some(recipient_id) = relay_msg.to {
                            info!("Relaying message from '{}' to '{}'", id, recipient_id);
                            
                            let mut clients = state.clients.lock().await;
                            if let Some(recipient_sink) = clients.get_mut(&recipient_id) {
                                if recipient_sink.send(Message::Text(text)).await.is_err() {
                                    info!("Failed to send to '{}'. They may have disconnected.", recipient_id);
                                }
                            } else {
                                info!("Recipient '{}' not found.", recipient_id);
                            }
                        }
                    }
                }
            }
        }
    }

    // Step 3: Cleanup on disconnect
    if let Some(id) = client_id {
        info!("Client '{}' disconnected. Cleaning up.", id);
        let mut clients = state.clients.lock().await;
        clients.remove(&id);
    }
}
