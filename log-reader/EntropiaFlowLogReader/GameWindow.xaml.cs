using System.Windows;
using System.Windows.Input;
using Point = System.Drawing.Point;

namespace EntropiaFlowLogReader
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

            string htmlContent = @"
                <html>
                  <head>
                    <style>
                      body {
                        background-color: lightblue;
                        color: black;
                        overflow: hidden;
                      }
                    </style>
                  </head>
                  <body>
                    <h1>Hello, HTML</h1>
                    <p id='t'>none</p>
                    <script>
                      document.attachEvent('oncontextmenu', function(event)
                        {
                          event.returnValue = false;
                        });
                      document.attachEvent('onmousedown', function(event)
                        {
                          event.returnValue = false;
                          document.getElementById('t').innerHTML = 'down';
                          if (event.button === 1) // left
                          {
                            window.external.OnMouseDown();
                          }
                        });
                      document.attachEvent('onmousemove', function(event)
                        {
                          event.returnValue = false;
                          document.getElementById('t').innerHTML = 'move';
                          window.external.OnMouseMove();
                        });
                      document.attachEvent('onmouseup', function(event)
                        {
                          event.returnValue = false;
                          document.getElementById('t').innerHTML = 'up'
                          if (event.button === 1) // left
                          {
                            window.external.OnMouseUp();
                          }
                        });
                    </script>
                  </body>
                </html>";
            webBrowser.ObjectForScripting = new ScriptInterface(this);
            webBrowser.NavigateToString(htmlContent);
        }

        public class ScriptInterface
        {
            private bool isDragging;
            private Point startPoint;
            private Window window;
            public ScriptInterface(Window w)
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
}
