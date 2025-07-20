using EntropiaFlowClient.Data;
using EntropiaFlowClient.UI;
using Helpers;
using System.IO;
using System.Reflection;
using System.Windows;
using static EntropiaFlowClient.Data.ClientData;
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
        private readonly ClientData _clientData;
        private readonly LogWatcher _watcher;
        private WebSocketChat _webSocketServer;
        private SettingsWindow? _settingsWindow;
        private ToolStripItem? _overlayItem;

        public App()
        {
            _notifyIcon = new();
            _clientData = new();
            _webSocketServer = new();
            _watcher = new();
        }

        public static new App Current => (App)Application.Current;

        protected override void OnStartup(System.Windows.StartupEventArgs e)
        {
            InitializeNotifyIcon();
            InitializeWebSocket();
            InitializeLogReader();
            RestoreWindows();
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
            _notifyIcon.Text = "Entropia Flow Client";
            _notifyIcon.Click += NotifyIcon_Click;

            _notifyIcon.ContextMenuStrip = new ContextMenuStrip();
            _overlayItem = _notifyIcon.ContextMenuStrip.Items.Add("Hide Overlay", null, OnOverlayClicked);
            _notifyIcon.ContextMenuStrip.Items.Add("Settings", null, OnSettingsClicked);
            _notifyIcon.ContextMenuStrip.Items.Add("Exit", null, OnExitClicked);
            _notifyIcon.Visible = true;
        }

        private void OnOverlayClicked(object? sender, EventArgs e)
        {
            if (MainWindow.IsVisible)
            {
                MainWindow.Hide();
                _overlayItem!.Text = "Show Overlay";
            }
            else
            {
                MainWindow.Show();
                _overlayItem!.Text = "Hide Overlay";
            }
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
            WaitingForConnnection?.Invoke(this, EventArgs.Empty);
        }

        public string ListeningUri => _webSocketServer.ListeningUri;

        public void Dispatch(string action)
        {
            _webSocketServer.Send("dispatch", action);
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
        public event EventHandler<EventArgs>? WaitingForConnnection;

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

        #region Client Data

        private void RestoreWindows()
        {
            for (int n = _clientData.WindowsCount; n > 1; n--)
                _ = new GameWindow();
        }

        public void OnGameWindowCreated(GameWindow gameWindow, int windowId, string layoutId, double scale)
        {
            if (_clientData.GetWindowData(windowId) == null)
                _clientData.AddWindow(windowId, layoutId, scale);
            gameWindow.Loaded += GameWindow_Loaded;
        }

        private void GameWindow_Loaded(object sender, RoutedEventArgs e)
        {
            GameWindow gameWindow = (GameWindow)sender!;
            gameWindow.Loaded -= GameWindow_Loaded;

            WindowData? windowData = _clientData.GetWindowData(gameWindow.WindowId);
            if (windowData != null)
            {
                gameWindow.Scale = windowData.Scale;
                gameWindow.SetLayout(windowData.Layout!).WaitForResult();
                gameWindow.Left = windowData.Left;
                gameWindow.Top = windowData.Top;
            }

            gameWindow.LayoutChanged += GameWindow_LayoutChanged;
            gameWindow.ScaleChanged += GameWindow_ScaleChanged;
            gameWindow.LocationChanged += GameWindow_LocationChanged;
            gameWindow.Closing += GameWindow_Closing;
        }

        private void GameWindow_Closing(object? sender, System.ComponentModel.CancelEventArgs e)
        {
            GameWindow gameWindow = (GameWindow)sender!;
            gameWindow.Closing -= GameWindow_Closing;

            if (_clientData.WindowsCount > 1) // preserve the last window data
                _clientData.RemoveWindow(gameWindow.WindowId);

            gameWindow.LayoutChanged -= GameWindow_LayoutChanged;
            gameWindow.ScaleChanged -= GameWindow_ScaleChanged;
            gameWindow.LocationChanged -= GameWindow_LocationChanged;
        }

        private void GameWindow_LayoutChanged(object? sender, GameWindow.LayoutChangedEventArgs e) => _clientData.SetWindowLayout(e.WindowId, e.LayoutId);
        private void GameWindow_ScaleChanged(object? sender, GameWindow.ScaleChangedEventArgs e) => _clientData.SetWindowScale(e.WindowId, e.Scale);
        private void GameWindow_LocationChanged(object? sender, EventArgs e)
        {
            GameWindow gameWindow = (GameWindow)sender!;
            _clientData.SetWindowLocation(gameWindow.WindowId, gameWindow.Left, gameWindow.Top);
        }

        #endregion
    }
}
