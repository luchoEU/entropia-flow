using System.IO;
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

        private string m_LastMessage;
        private void GameWindow_StreamMessageReceived(object? sender, WebSocketChat.StreamMessageEventArgs e)
        {
            //if (e.Data.Equals(m_LastMessage))
            //    return;

            Dispatcher.Invoke(() => webView2.CoreWebView2?.ExecuteScriptAsync($"render({e.Data})"));
        }

        private void WebBrowser_CoreWebView2InitializationCompleted(object? sender, Microsoft.Web.WebView2.Core.CoreWebView2InitializationCompletedEventArgs e)
        {
            if (e.IsSuccess)
            {
                webView2.CoreWebView2.AddHostObjectToScript("mouse", new MouseScriptInterface(this));
                webView2.CoreWebView2.AddHostObjectToScript("resize", new ResizeScriptInterface(this));
                var file = Path.Combine(Directory.GetCurrentDirectory(), "GameWindow", "StreamView.html");
                webView2.CoreWebView2.Navigate($"file://{file}");
            }
            else
            {
                throw e.InitializationException;
            }
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
