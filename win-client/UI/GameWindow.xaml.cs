﻿using System.Configuration;
using System.IO;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Text.Json;
using System.Windows;
using System.Windows.Media;
using Point = System.Drawing.Point;
using Color = System.Windows.Media.Color;
using ColorConverter = System.Windows.Media.ColorConverter;

namespace EntropiaFlowClient
{
    /// <summary>
    /// Interaction logic for GameWindow.xaml
    /// </summary>
    public partial class GameWindow : Window
    {
        private string _layoutId;
        private double _scale = 1;
        private bool _minimized = false;
        private bool _waiting = false;
        internal bool ClicksDisabled = false;

        public GameWindow(): this("entropiaflow.default") { }
        public GameWindow(string layoutId)
        {
            InitializeComponent();
            Topmost = true;
            _layoutId = layoutId;

            webView2.CoreWebView2InitializationCompleted += WebBrowser_CoreWebView2InitializationCompleted;
            webView2.EnsureCoreWebView2Async();

            App.Current.StreamMessageReceived += GameWindow_StreamMessageReceived;
            App.Current.WaitingForConnnection += GameWindow_WaitingForConnnection;
        }

        private static string? WAITING_LAYOUT_ID;
        private void GameWindow_StreamMessageReceived(object? sender, WebSocketChat.StreamMessageEventArgs e)
        {
            // use dispatch to avoid System.InvalidOperationException: The calling thread cannot access this object because a different thread owns it.
            Dispatcher.Invoke(async () =>
            {
                _waiting = false;
                await ExecuteScriptAsync($"receive({e.Data})");
                await Render();
            });
        }

        private async void GameWindow_WaitingForConnnection(object? sender, EventArgs e)
        {
            // use dispatch to avoid System.InvalidOperationException: The calling thread cannot access this object because a different thread owns it.
            Dispatcher.Invoke(async () =>
            {
                await RenderWaiting();
            });
        }

        private async Task Render(bool renderMinimized = false)
        {
            var layoutId = _waiting ? WAITING_LAYOUT_ID : _layoutId;

            object? stateObj = null;
            if (!_minimized)
                stateObj = new { layoutId, scale = _scale };
            else if (renderMinimized)
                stateObj = new { layoutId, minimized = true };

            if (stateObj != null)
            {
                var state = JsonSerializer.Serialize(stateObj);
                await ExecuteScriptAsync($"render({state})");
            }
        }

        private static readonly object Images = new
        {
            logo = ReadResourceToUrl("flow128.png"),
            copy = ReadResourceToUrl("copy.png")
        };

        private async Task RenderWaiting()
        {
            _minimized = false;
            _waiting = true;

            WAITING_LAYOUT_ID ??= await ExecuteScriptAsync<string>("WAITING_LAYOUT_ID");

            var data = JsonSerializer.Serialize(new { uri = App.Current.ListeningUri, img = Images });
            await ExecuteScriptAsync($"receive({{ data: {data} }})");
            await Render();
        }

        internal double Scale
        {
            get { return _scale; }
            set
            {
                var newScale = value;
                var screen = Screen.FromPoint(new Point((int)Left, (int)Top));
                if (screen != null)
                {
                    // make it fit in the screen
                    Rectangle r = screen.WorkingArea;
                    newScale = Math.Min(newScale, (r.Width - Left) / (Width / _scale));
                    newScale = Math.Min(newScale, (r.Height - Top) / (Height / _scale));
                }

                _scale = newScale;
                Render();
            }
        }

        internal async Task SwitchMinimized()
        {
            _minimized = !_minimized;
            await Render(true);
        }

        internal async Task NextLayout()
        {
            if (_waiting)
                return;
            _layoutId = await ExecuteScriptAsync<string>($"nextLayout('{_layoutId}')") ?? _layoutId;
            await Render();
            Scale = Scale;
        }

        private async Task<T?> ExecuteScriptAsync<T>(string script)
        {
            if (webView2.CoreWebView2 == null)
                return default;
            
            var result = await webView2.CoreWebView2.ExecuteScriptAsync(script);
            return JsonSerializer.Deserialize<T>(result);
        }
        private async Task ExecuteScriptAsync(string script)
        {
            if (webView2.CoreWebView2 == null)
                return;
            await webView2.CoreWebView2.ExecuteScriptAsync(script);
        }

        private static string ReadResourceToString(string name)
        {
            using Stream stream = Assembly.GetExecutingAssembly().GetManifestResourceStream("EntropiaFlowClient.GameWindow." + name) ?? throw new Exception(name + " not found");
            using StreamReader reader = new(stream);
            return reader.ReadToEnd();
        }

        private static string ReadResourceToUrl(string name)
        {
            using Stream stream = Assembly.GetExecutingAssembly().GetManifestResourceStream("EntropiaFlowClient.Resources." + name) ?? throw new Exception(name + " not found");
            using MemoryStream ms = new();
            stream.CopyTo(ms);
            byte[] imageBytes = ms.ToArray();
            string base64String = Convert.ToBase64String(imageBytes);
            return $"data:image/png;base64,{base64String}";
        }

        private static string SaveResourceToFile(string name, bool isImage)
        {
            string outputPath = Path.Combine(Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location)!, name);
            string resourceFolder = isImage ? "Resources" : "GameWindow";
            using Stream resourceStream = Assembly.GetExecutingAssembly().GetManifestResourceStream($"EntropiaFlowClient.{resourceFolder}.{name}") ?? throw new Exception(name + " not found");
            using FileStream fileStream = new(outputPath, FileMode.Create, FileAccess.Write);
            resourceStream.CopyTo(fileStream);
            return outputPath;
        }

        private async void WebBrowser_CoreWebView2InitializationCompleted(object? sender, Microsoft.Web.WebView2.Core.CoreWebView2InitializationCompletedEventArgs e)
        {
            if (e.IsSuccess)
            {
                webView2.CoreWebView2.AddHostObjectToScript("mouse", new MouseScriptInterface(this));
                webView2.CoreWebView2.AddHostObjectToScript("resize", new ResizeScriptInterface(this));
                webView2.CoreWebView2.AddHostObjectToScript("lifecycle", new LifecycleScriptInterface(this));
                webView2.CoreWebView2.AddHostObjectToScript("layout", new LayoutScriptInterface(this));
                webView2.CoreWebView2.AddHostObjectToScript("clipboard", new ClipboardScriptInterface(this));

                var images = new string[] { "flow128.png", "resize.png", "right.png" };
#if DEBUG
                // Save to files to be able to debug in browser
                string htmlPath = SaveResourceToFile("StreamView.html", false);
                foreach (var jsName in new string[] { "Mouse.js", "Render.js", "EntropiaFlowStream.js" })
                    SaveResourceToFile(jsName, false);
                foreach (var imgName in images)
                    SaveResourceToFile(imgName, true);
                webView2.CoreWebView2.Navigate(htmlPath);
#else
                string contentHtml = ReadResourceToString("StreamView.html");
                foreach (var imgName in images)
                    contentHtml = contentHtml.Replace($"src=\"{imgName}\"", $"src=\"{ReadResourceToUrl(imgName)}\"");

                foreach (var jsName in new string[] { "Mouse.js", "Render.js" })
                    contentHtml = contentHtml.Replace($"<script src=\"{jsName}\"></script>", $"<script>//{jsName}\n{ReadResourceToString(jsName)}</script>");

                webView2.CoreWebView2.NavigationCompleted += (sender, args) =>
                {
                    Dispatcher.Invoke(async () =>
                    {
                        string javascriptCode = ReadResourceToString("EntropiaFlowStream.js");
                        await webView2.CoreWebView2.ExecuteScriptAsync(javascriptCode);
                    });
                };
                webView2.CoreWebView2.NavigateToString(contentHtml);
#endif
            }
            else
            {
                throw e.InitializationException;
            }
        }

        private void Window_Loaded(object sender, RoutedEventArgs e)
        {
            string? left = ConfigurationManager.AppSettings["WindowLeft"];
            string? top = ConfigurationManager.AppSettings["WindowTop"];

            if (!string.IsNullOrEmpty(left) && !string.IsNullOrEmpty(top))
            {
                Left = Convert.ToDouble(left);
                Top = Convert.ToDouble(top);
            }
        }

        private void Window_Closing(object sender, System.ComponentModel.CancelEventArgs e)
        {
            Configuration config = ConfigurationManager.OpenExeConfiguration(ConfigurationUserLevel.None);
            config.AppSettings.Settings["WindowLeft"].Value = Left.ToString();
            config.AppSettings.Settings["WindowTop"].Value = Top.ToString();
            config.Save(ConfigurationSaveMode.Modified);
        }

        private void SetLocation(int left, int top)
        {
            var windowBounds = new Rectangle(left, top, (int)Width, (int)Height);

            // Find the screen with the largest intersection area
            var bestScreen = Screen.AllScreens
                .Select(screen => {
                    var intersection = Rectangle.Intersect(windowBounds, screen.WorkingArea);
                    return new
                    {
                        Screen = screen,
                        Intersection = intersection,
                        IntersectionArea = intersection.Width * intersection.Height
                    };
                })
                .OrderByDescending(x => x.IntersectionArea)
                .FirstOrDefault(x => x.IntersectionArea > 0);

            if (bestScreen != null)
            {
                // If a screen with intersection exists, adjust window position to fit within that screen
                Rectangle r = bestScreen.Screen.WorkingArea;
                Left = Math.Max(r.X, Math.Min(windowBounds.X, r.Right - windowBounds.Width));
                Top = Math.Max(r.Y, Math.Min(windowBounds.Y, r.Bottom - windowBounds.Height));
            }
            else if (Screen.PrimaryScreen != null)
            {
                // No intersection found, center the window on the primary screen
                Rectangle r = Screen.PrimaryScreen.WorkingArea;
                Left = r.X + Math.Max(0, (r.Width - windowBounds.Width) / 2);
                Top = r.Y + Math.Max(0, (r.Height - windowBounds.Height) / 2);
            }
        }

        [ClassInterface(ClassInterfaceType.AutoDual)]
        [ComVisible(true)]
        public class MouseScriptInterface(GameWindow w)
        {
            private bool _isDragging;
            private bool _isResize;
            private Point _relativePoint;

            public void OnMouseDown(int button, string id)
            {
                if (button == 0) // left
                {
                    _isDragging = true;
                    var pt = System.Windows.Forms.Cursor.Position;
                    _isResize = id == "entropia-flow-client-resize";
                    _relativePoint = new Point(pt.X - (int)w.Left, pt.Y - (int)w.Top);
                    if (_isResize)
                    {
                        _relativePoint = new Point((int)(_relativePoint.X / w.Scale), (int)(_relativePoint.Y / w.Scale));
                    }
                }
                w.ClicksDisabled = false;
            }

            private const int MIN_SIZE = 30;
            public void OnMouseMove()
            {
                if (_isDragging)
                {
                    Point pt = System.Windows.Forms.Cursor.Position;
                    if (_isResize)
                    {
                        Point newRelativePoint = new(pt.X - (int)w.Left, pt.Y - (int)w.Top);
                        double scaleX = (double)Math.Max(MIN_SIZE, newRelativePoint.X) / _relativePoint.X;
                        double scaleY = (double)Math.Max(MIN_SIZE, newRelativePoint.Y) / _relativePoint.Y;
                        w.Scale = Math.Max(scaleX, scaleY);
                    }
                    else
                    {
                        w.SetLocation(pt.X - _relativePoint.X, pt.Y - _relativePoint.Y);
                    }

                    w.ClicksDisabled = true;
                }
            }

            public void OnMouseUp(int button)
            {
                _isDragging = false;
            }
        }

        [ClassInterface(ClassInterfaceType.AutoDual)]
        [ComVisible(true)]
        public class ResizeScriptInterface(Window w)
        {
            public void OnRendered(int width, int height)
            {
                w.Width = Math.Max(20, width);
                w.Height = Math.Max(20, height);
            }
        }

        [ClassInterface(ClassInterfaceType.AutoDual)]
        [ComVisible(true)]
        public class LifecycleScriptInterface(GameWindow w)
        {
            public void OnLoaded()
            {
                w.RenderWaiting();
                w.loadingTextBlock.Visibility = Visibility.Collapsed;

                // 01 alpha so it is transparent but receives mouse events
                w.mainGrid.Background = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#01FFFFFF"));
            }
        }

        [ClassInterface(ClassInterfaceType.AutoDual)]
        [ComVisible(true)]
        public class LayoutScriptInterface(GameWindow w)
        {
            public void MinimizeCliked()
            {
                w.SwitchMinimized();
            }

            public void MenuClicked()
            {
                w.NextLayout();
                //new GameWindow("entropiaflow.menu").Show();
            }
        }

        [ClassInterface(ClassInterfaceType.AutoDual)]
        [ComVisible(true)]
        public class ClipboardScriptInterface(GameWindow w)
        {
            public bool Copy(string text)
            {
                if (w.ClicksDisabled)
                    return false;
                System.Windows.Clipboard.SetText(text);
                return true;
            }
        }
    }
}
