using System.Windows;

namespace EntropiaFlowClient
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {
        public MainWindow()
        {
            InitializeComponent();
            Closing += MainWindow_Closing;
        }

        private void MainWindow_Closing(object? sender, System.ComponentModel.CancelEventArgs e)
        {
            e.Cancel = true;
            Hide();
        }

        public void CloseWindow()
        {
            Closing -= MainWindow_Closing;
            Close();
        }

        private void OnButtonClick(object sender, RoutedEventArgs e)
        {
            var w = new GameWindow();
            w.Show();
        }
    }
}
