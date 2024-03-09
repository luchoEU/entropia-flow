﻿using System.Text.Json;
using WebSocketSharp;
using WebSocketSharp.Server;

namespace EntropiaFlowClient
{
    public class WebSocketChat : WebSocketBehavior
    {
        private readonly WebSocketServer _webSocket;

        private const int WEB_SOCKET_PORT = 6521;

        public WebSocketChat()
        {
            _webSocket = new(WEB_SOCKET_PORT);
        }

        public void Start()
        {
            _webSocket.AddWebSocketService("/", () => this);
            _webSocket.Start();
            Console.WriteLine($"WebSocket server listening on port {WEB_SOCKET_PORT}");
        }

        public void Stop()
        {
            _webSocket.Stop();
        }

        public class Message
        {
            public string type { get; set; }
            public object data { get; set; }
        }

        protected override void OnMessage(MessageEventArgs e)
        {
            var msg = JsonSerializer.Deserialize<Message>(e.Data);
            if (msg.type == "stream")
                StreamMessageReceived?.Invoke(this, new StreamMessageEventArgs(msg.data.ToString()));
        }

        public event EventHandler<StreamMessageEventArgs> StreamMessageReceived;

        public class StreamMessageEventArgs(string data) : EventArgs
        {
            public string Data { get; private set; } = data;
        }

        public void Send(string type, object data)
        {
            if (Sessions == null) return;

            var msg = new Message() { type = type, data = data };
            string jsonString = JsonSerializer.Serialize(msg);
            Sessions.Broadcast(jsonString);
        }
    }
}