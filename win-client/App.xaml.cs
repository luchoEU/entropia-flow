using EntropiaFlowClient.UI;
using System.IO;
using System.Reflection;
using static EntropiaFlowClient.WebSocketChat;
using Application = System.Windows.Application;

namespace EntropiaFlowClient
{
    /// <summary>
    /// Interaction logic for App.xaml
    /// </summary>
    public partial class App : Application
    {
        private readonly NotifyIcon _notifyIcon;
        private readonly LogWatcher _watcher;
        private WebSocketChat _webSocketServer;
        private SettingsWindow? _settingsWindow;

        public App()
        {
            _notifyIcon = new();
            _webSocketServer = new();
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
            using (Stream? iconStream = Assembly.GetExecutingAssembly().GetManifestResourceStream("EntropiaFlowClient.Resources.flow128w.ico"))
            {
                if (iconStream != null)
                    _notifyIcon.Icon = new Icon(iconStream);
            }
            _notifyIcon.Text = "Entropia Flow Log Reader";
            _notifyIcon.Click += NotifyIcon_Click;

            _notifyIcon.ContextMenuStrip = new ContextMenuStrip();
            _notifyIcon.ContextMenuStrip.Items.Add("Settings", null, OnSettingsClicked);
            _notifyIcon.ContextMenuStrip.Items.Add("Exit", null, OnExitClicked);
            _notifyIcon.Visible = true;
        }

        private void OnExitClicked(object? sender, EventArgs e)
        {
            //((MainWindow)MainWindow).CloseWindow();
            MainWindow.Close();
            _settingsWindow?.Close();
        }

        private void OnSettingsClicked(object? sender, EventArgs e)
        {
            if (_settingsWindow == null)
                _settingsWindow = new SettingsWindow();
            else
                _settingsWindow.WindowState = System.Windows.WindowState.Normal;
            _settingsWindow.SetListening(_webSocketServer.IsListening, _webSocketServer.ListeningUri);
            _settingsWindow.Show();
        }

        protected override void OnExit(System.Windows.ExitEventArgs e)
        {
            _notifyIcon.Dispose();
            base.OnExit(e);
        }

        private void NotifyIcon_Click(object? sender, EventArgs e)
        {
            if (e is MouseEventArgs me && me.Button == MouseButtons.Left)
                OnSettingsClicked(sender, e);
        }

        #endregion

        #region Web Socket

        private void InitializeWebSocket()
        {
            _webSocketServer.StreamMessageReceived += _webSocketServer_StreamMessageReceived;
            _webSocketServer.SocketClosed += _webSocketServer_SocketClosed;
            _webSocketServer.Start();
        }

        private void _webSocketServer_StreamMessageReceived(object? sender, StreamMessageEventArgs e)
        {
            StreamMessageReceived?.Invoke(this, e);
        }

        private void _webSocketServer_SocketClosed(object? sender, EventArgs e)
        {
            _webSocketServer.Stop();
            _webSocketServer = new();
            InitializeWebSocket();
        }

        public event EventHandler<StreamMessageEventArgs>? StreamMessageReceived;

        #endregion

        #region Log Reader

        private void InitializeLogReader()
        {
            _watcher.NewLine += Watcher_NewLine;
            _watcher.Start();
        }

        private void Watcher_NewLine(object? sender, LogWatcher.LogDataEventArgs e)
        {
            _webSocketServer.Send("log", e.Line);
        }

        #endregion
    }
}
