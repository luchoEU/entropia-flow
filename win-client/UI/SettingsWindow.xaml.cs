using System.Windows;

namespace EntropiaFlowClient.UI
{
    /// <summary>
    /// Interaction logic for SettingsWindow.xaml
    /// </summary>
    public partial class SettingsWindow : Window
    {
        private string? _uri;
        public SettingsWindow()
        {
            InitializeComponent();
        }

        public void SetListening(bool isListening, string uri)
        {
            var not = isListening ? "" : "NOT ";
            ListeningTextBlock.Text = $"{not}Listening to {uri}";
            _uri = uri;
        }

        private void CopyButton_Click(object sender, RoutedEventArgs e)
        {
            if (_uri != null)
                System.Windows.Clipboard.SetText(_uri);
        }
    }
}
