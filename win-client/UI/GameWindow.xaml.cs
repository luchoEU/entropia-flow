using System.Configuration;
using System.IO;
using System.Reflection;
using System.Runtime.CompilerServices;
using System.Runtime.InteropServices;
using System.Windows;
using Point = System.Drawing.Point;

namespace EntropiaFlowClient
{
    /// <summary>
    /// Interaction logic for GameWindow.xaml
    /// </summary>
    public partial class GameWindow : Window
    {        
        public GameWindow()
        {
            InitializeComponent();
            Topmost = true;

            webView2.CoreWebView2InitializationCompleted += WebBrowser_CoreWebView2InitializationCompleted;
            webView2.EnsureCoreWebView2Async();

            ((App)System.Windows.Application.Current).StreamMessageReceived += GameWindow_StreamMessageReceived;
        }

        private void GameWindow_StreamMessageReceived(object? sender, WebSocketChat.StreamMessageEventArgs e)
        {
            Dispatcher.Invoke(() => webView2.CoreWebView2?.ExecuteScriptAsync($"render({e.Data})"));
        }

        private static string ReadResource(string name)
        {
            using Stream stream = Assembly.GetExecutingAssembly().GetManifestResourceStream("EntropiaFlowClient.GameWindow." + name) ?? throw new Exception(name + " not found");
            using StreamReader reader = new(stream);
            return reader.ReadToEnd();
        }

        private void WebBrowser_CoreWebView2InitializationCompleted(object? sender, Microsoft.Web.WebView2.Core.CoreWebView2InitializationCompletedEventArgs e)
        {
            if (e.IsSuccess)
            {
                webView2.CoreWebView2.AddHostObjectToScript("mouse", new MouseScriptInterface(this));
                webView2.CoreWebView2.AddHostObjectToScript("resize", new ResizeScriptInterface(this));
                string contentHtml = ReadResource("StreamView.html")
                                .Replace("<script src=\"Mouse.js\"></script>", $"<script>{ReadResource("Mouse.js")}</script>")
                                .Replace("<script src=\"Render.js\"></script>", $"<script>{ReadResource("Render.js")}</script>");
                webView2.CoreWebView2.NavigateToString(contentHtml);
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

        [ClassInterface(ClassInterfaceType.AutoDual)]
        [ComVisible(true)]
        public class MouseScriptInterface
        {
            private bool isDragging;
            private Point startPoint;
            private Window window;
            public MouseScriptInterface(Window w)
            {
                window = w;
            }

            public void OnMouseDown()
            {
                isDragging = true;
                startPoint = System.Windows.Forms.Cursor.Position;
            }

            public void OnMouseMove()
            {
                if (isDragging)
                {
                    Point currentPoint = System.Windows.Forms.Cursor.Position;
                    double offsetX = currentPoint.X - startPoint.X;
                    double offsetY = currentPoint.Y - startPoint.Y;

                    window.Left += offsetX;
                    window.Top += offsetY;

                    startPoint = currentPoint;
                }
            }

            public void OnMouseUp()
            {
                isDragging = false;
            }
        }
    }

    [ClassInterface(ClassInterfaceType.AutoDual)]
    [ComVisible(true)]
    public class ResizeScriptInterface
    {
        private Window window;
        public ResizeScriptInterface(Window w)
        {
            window = w;
        }

        public void OnRendered(int width, int height)
        {
            window.Width = Math.Max(20, width);
            window.Height = Math.Max(20, height);
        }
    }
}
