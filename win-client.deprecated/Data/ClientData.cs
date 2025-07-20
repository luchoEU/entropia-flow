using System.Configuration;
using System.Diagnostics;
using System.IO;
using System.Text.Json;

namespace EntropiaFlowClient.Data
{
    internal class ClientData
    {
        public ClientData()
        {
            Load();
        }

        public record WindowData
        {
            public string? Layout { get; set; }
            public double Scale { get; set; }
            public double Left { get; set; }
            public double Top { get; set; }
        }

        private Dictionary<int, WindowData> _windows = [];
        public int WindowsCount => _windows.Count;

        public WindowData? GetWindowData(int windowId) => _windows.TryGetValue(windowId, out var data) ? data : null;

        internal void AddWindow(int windowId, string layoutId, double scale)
        {
            _windows[windowId] = new WindowData
            {
                Layout = layoutId,
                Scale = scale
            };
            DataChanged();
        }

        internal void RemoveWindow(int windowId)
        {
            _windows.Remove(windowId);
            DataChanged();
        }

        internal void SetWindowLayout(int windowId, string layoutId)
        {
            _windows[windowId].Layout = layoutId;
            DataChanged();
        }
        internal void SetWindowScale(int windowId, double scale)
        {
            _windows[windowId].Scale = scale;
            DataChanged();
        }
        internal void SetWindowLocation(int windowId, double left, double top)
        {
            _windows[windowId].Left = left;
            _windows[windowId].Top = top;
            DataChanged();
        }

        private void DataChanged() => Save();

        private static readonly JsonSerializerOptions _sJsonOptions = new() { WriteIndented = true };
        private void Save()
        {
            string json = JsonSerializer.Serialize(_windows.Values, _sJsonOptions);

            // Valid values should be in App.config
            Configuration config = ConfigurationManager.OpenExeConfiguration(ConfigurationUserLevel.None);
            config.AppSettings.Settings["Windows"].Value = json;
            config.Save(ConfigurationSaveMode.Modified);
        }

        private void Load()
        {
            string? windowsJson = ConfigurationManager.AppSettings["Windows"];
            if (string.IsNullOrEmpty(windowsJson))
                return;

            try
            {
                var windowsData = JsonSerializer.Deserialize<WindowData[]>(windowsJson);
                if (windowsData != null)
                {
                    int id = 1;
                    _windows = windowsData.ToDictionary(x => id++, x => x);
                }
            }
            catch (Exception e)
            {
                Console.WriteLine($"Error loading Client Data: {e.Message}");
            }
        }

        internal static void OpenConfigLocation()
        {
            string configFilePath = ConfigurationManager.OpenExeConfiguration(ConfigurationUserLevel.None).FilePath;

            Console.WriteLine("User config file path: " + configFilePath);
            if (File.Exists(configFilePath))
            {
                // Open File Explorer at the config file location
                Process.Start("explorer.exe", "/select,\"" + configFilePath + "\"");
            }
            else
            {
                Console.WriteLine("User config file not found.");
            }
        }
    }
}
