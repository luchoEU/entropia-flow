using System.Text.Json;
using WebSocketSharp;
using WebSocketSharp.Server;

namespace EntropiaFlowLogReader
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

        protected override void OnMessage(MessageEventArgs e)
        {
            //e.Data
        }

        public void Send(object data)
        {
            string jsonString = JsonSerializer.Serialize(data);
            Sessions.Broadcast(jsonString);
        }
    }
}
