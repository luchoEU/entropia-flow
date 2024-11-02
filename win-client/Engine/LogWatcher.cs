using System.IO;
using Path = System.IO.Path;

namespace EntropiaFlowClient
{
    public class LogWatcher : IDisposable
    {
        private const string FILE_NAME = "C:/Users/Cristian/OneDrive/Documentos/Entropia Universe/chat.log";
        private FileSystemWatcher? _watcher;
        private long _lastPosition;

        public void Start()
        {
            var file = new FileInfo(FILE_NAME);
            _lastPosition = file.Exists ? file.Length : 0;

            if (file.Directory != null)
            {
                _watcher = new(file.Directory.FullName)
                {
                    Filter = Path.GetFileName(file.FullName)
                };
                _watcher.Changed += OnFileChanged;
                _watcher.EnableRaisingEvents = true;
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
