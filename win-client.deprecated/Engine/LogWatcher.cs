using System.IO;
using Path = System.IO.Path;

namespace EntropiaFlowClient
{
    public class LogWatcher : IDisposable
    {
        private const string FILE_NAME = @"Entropia Universe\chat.log";
        private FileSystemWatcher? _watcher;
        private long _lastPosition;

        public void Start()
        {
            string documentsPath = Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments);
            string chatFilePath = Path.Combine(documentsPath, FILE_NAME);

            var file = new FileInfo(chatFilePath);
            if (file.Exists && file.Directory != null)
            {
                _lastPosition = file.Length;
                _watcher = new(file.Directory.FullName)
                {
                    Filter = Path.GetFileName(file.FullName)
                };
                _watcher.Changed += OnFileChanged;
                _watcher.EnableRaisingEvents = true;
            }
            else
            {
                Console.WriteLine($"Chat File not found: {chatFilePath}");
            }
        }

        public void Stop()
        {
            _watcher?.Dispose();
        }

        public void Dispose()
        {
            GC.SuppressFinalize(this);
            Stop();
        }

        private void OnFileChanged(object sender, FileSystemEventArgs e)
        {
            using FileStream fileStream = new(e.FullPath, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
            using StreamReader streamReader = new(fileStream);
            fileStream.Seek(0, SeekOrigin.End);
            fileStream.Position = _lastPosition;

            string? line;
            while ((line = streamReader.ReadLine()) != null)
                NewLine?.Invoke(this, new LogDataEventArgs(line));

            _lastPosition = fileStream.Position;
        }

        public event EventHandler<LogDataEventArgs>? NewLine;

        public class LogDataEventArgs(string line) : EventArgs
        {
            public string Line { get; private set; } = line;
        }
    }
}
