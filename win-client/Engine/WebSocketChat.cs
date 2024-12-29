using System.Net;
using System.Net.Sockets;
using System.Text.Json;
using System.Text.Json.Serialization;
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
            //_webSocket.KeepClean = false; // Avoids cleaning up connections aggressively, this doesn't work correctly to receive the messages, it only receives the message number starting with 0
        }

        public string ListeningUri => $"ws://{GetLocalIPAddress()}:{_webSocket.Port}";
        public bool IsListening => _webSocket.IsListening;

        private static string GetLocalIPAddress()
        {
            var host = Dns.GetHostEntry(Dns.GetHostName());
            foreach (var ip in host.AddressList)
            {
                if (ip.AddressFamily == AddressFamily.InterNetwork)
                {
                    return ip.ToString();
                }
            }
            throw new Exception("No network adapters with an IPv4 address in the system!");
        }

        public void Start()
        {
            _webSocket.AddWebSocketService("/", () => this);
            _webSocket.Start();
            Console.WriteLine($"WebSocket server listening on {ListeningUri}");
        }

        public void Stop()
        {
            _webSocket.Stop();
        }

        public class Message
        {
            [JsonPropertyName("type")]
            public required string Type { get; set; }

            [JsonPropertyName("data")]
            public required object Data { get; set; }
        }

        protected override void OnMessage(MessageEventArgs e)
        {
            if (!Context.WebSocket.IsAlive)
            {
                Console.WriteLine("Connection is not alive.");
                return;
            }

            Message? msg;
            try
            {
                msg = JsonSerializer.Deserialize<Message>(e.Data);
            }
            catch (JsonException)
            {
                Console.WriteLine($"Websocket message received with invalid format: {e.Data}");
                return;
            }
            switch (msg?.Type)
            {
                case "version":
                    Send("version", "0.0.0"); // reply with client version
                    break;
                case "stream":
                    StreamMessageReceived?.Invoke(this, new StreamMessageEventArgs(msg.Data.ToString()!));
                    break;
            }
        }

        protected override void OnError(ErrorEventArgs e)
        {
            base.OnError(e);
            Console.WriteLine("WebSocket error: " + e.Message);
            Console.WriteLine(e.Exception.StackTrace);
        }

        protected override void OnClose(CloseEventArgs e)
        {
            base.OnClose(e);
            Console.WriteLine($"WebSocket closed: {e.Code} {e.Reason}");
            SocketClosed?.Invoke(this, e);
        }

        public event EventHandler<StreamMessageEventArgs>? StreamMessageReceived;
        public event EventHandler<EventArgs>? SocketClosed;

        public class StreamMessageEventArgs(string data) : EventArgs
        {
            public string Data { get; private set; } = data;
        }

        public void Send(string type, object data)
        {
            if (Sessions == null) return;

            var msg = new Message() { Type = type, Data = data };
            string jsonString = JsonSerializer.Serialize(msg);
            Sessions.Broadcast(jsonString);
        }
    }
}
