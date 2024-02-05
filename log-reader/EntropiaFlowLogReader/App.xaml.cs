using System.Text.Json;
using System;
using WebSocketSharp;
using WebSocketSharp.Server;
using Application = System.Windows.Application;

namespace EntropiaFlowLogReader
{
    /// <summary>
    /// Interaction logic for App.xaml
    /// </summary>
    public partial class App : Application
    {
        private readonly NotifyIcon _notifyIcon;
        private readonly WebSocketServer _webSocket;
        private WebSocketChat _webSocketServer;
        private readonly LogWatcher _watcher;

        private const int WEB_SOCKET_PORT = 6521;

        public App()
        {
            _notifyIcon = new();
            _webSocket = new(WEB_SOCKET_PORT);
            _watcher = new();
        }

        protected override void OnStartup(System.Windows.StartupEventArgs e)
        {
            InitializeNotifyIcon();
            InitializeWebSocket();
            InitializeLogReader();
            base.OnStartup(e);
        }

        #region Notify Icon

        private void InitializeNotifyIcon()
        {
            _notifyIcon.Icon = new Icon("Resources/flow128w.ico");
            _notifyIcon.Text = "Entropia Flow Log Reader";
            _notifyIcon.Click += NotifyIcon_Click;

            _notifyIcon.ContextMenuStrip = new ContextMenuStrip();
            _notifyIcon.ContextMenuStrip.Items.Add("Exit", null, OnExitClicked);
            _notifyIcon.Visible = true;
        }

        private void OnExitClicked(object? sender, EventArgs e)
        {
            ((MainWindow)MainWindow).CloseWindow();
        }

        protected override void OnExit(System.Windows.ExitEventArgs e)
        {
            _notifyIcon.Dispose();
            base.OnExit(e);
        }

        private void NotifyIcon_Click(object? sender, EventArgs e)
        {
            MainWindow.WindowState = System.Windows.WindowState.Normal;
            MainWindow.Show();
        }

        #endregion

        #region Web Socket

        private void InitializeWebSocket()
        {
            _webSocketServer = new WebSocketChat();
            _webSocket.AddWebSocketService("/", () => _webSocketServer);
            _webSocket.Start();
            Console.WriteLine($"WebSocket server listening on port {WEB_SOCKET_PORT}");
            //_webSocket.Stop();
        }

        public class WebSocketChat : WebSocketBehavior
        {
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

        #endregion

        #region Log Reader

        private void InitializeLogReader()
        {
            _watcher.NewLine += Watcher_NewLine;
            _watcher.Start();
        }

        private void Watcher_NewLine(object? sender, LogWatcher.LogDataEventArgs e)
        {
            _webSocketServer.Send(e.Data);
        }

        #endregion
    }
}
