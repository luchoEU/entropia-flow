using System.Globalization;
using System.IO;
using System.Text.RegularExpressions;
using Path = System.IO.Path;

namespace EntropiaFlowClient
{
    public class LogWatcher : IDisposable
    {
        private const string FILE_NAME = "C:/Users/Cristian/OneDrive/Documentos/Entropia Universe/chat.log";
        private FileSystemWatcher _watcher;
        private long _lastPosition;

        private static readonly Regex _regex = new(@"(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) \[(.*?)\] \[(.*?)\] (.*)");
        private static readonly Regex _youRegex = new("You received (.*) x \\((.*)\\) Value: (.*) PED");
        private static readonly Regex _itemRegex = new("(.*) received a (.*)");
        private static readonly Regex _sharedRegex = new("(.*) received (.*) \\((.*)\\)");
        private static readonly string _dateFormat = "yyyy-MM-dd HH:mm:ss";

        public void Start()
        {
            //var userHomeDir = Environment.GetFolderPath(Environment.SpecialFolder.UserProfile);
            var file = new FileInfo(FILE_NAME);
            _lastPosition = file.Exists ? file.Length : 0;

            _watcher = new(file.Directory.FullName);
            _watcher.Filter = Path.GetFileName(file.FullName);
            _watcher.Changed += OnFileChanged;
            _watcher.EnableRaisingEvents = true;
        }

        public void Stop()
        {
            _watcher.Dispose();
        }

        public void Dispose()
        {
            Stop();
        }

        private void OnFileChanged(object sender, FileSystemEventArgs e)
        {
            using (FileStream fileStream = new(e.FullPath, FileMode.Open, FileAccess.Read, FileShare.ReadWrite))
            using (StreamReader streamReader = new(fileStream))
            {
                fileStream.Seek(0, SeekOrigin.End);
                fileStream.Position = _lastPosition;

                string line;
                while ((line = streamReader.ReadLine()) != null)
                {
                    var match = _regex.Match(line.Trim());
                    if (match.Success)
                    {
                        string time = match.Groups[1].Value;
                        string channel = match.Groups[2].Value;
                        string avatar = match.Groups[3].Value;
                        string message = match.Groups[4].Value;
                        DateTime.TryParseExact(time, _dateFormat, CultureInfo.InvariantCulture, DateTimeStyles.None, out DateTime parsedTime);
                        var d = ReadLine(channel, message);
                        if (d != null)
                        {
                            d.time = parsedTime;
                            NewLine.Invoke(this, new LogDataEventArgs(d));
                        }
                    }
                }

                _lastPosition = fileStream.Position;
            }
        }

        public event EventHandler<LogDataEventArgs> NewLine;

        public class LogDataEventArgs(LogData data) : EventArgs
        {
            public LogData Data { get; private set; } = data;
        }

        public class LogData
        {
            public string type { get; set; }
            public DateTime time { get; set; }
        }

        public class SystemLogData: LogData
        {
            public SystemLogData()
            {
                type = "system";
            }

            public string material { get; set; }
            public int amount { get; set; }
            public float value { get; set; }
        }

        public class TeamItemLogData: LogData
        {
            public TeamItemLogData()
            {
                type = "team-item";
            }

            public string player { get; set; }
            public string item { get; set; }
        }

        public class TeamSharedLogData: LogData
        {
            public TeamSharedLogData()
            {
                type = "team-shared";
            }

            public string player { get; set; }
            public string material { get; set; }
            public int amount { get; set; }
        }

        private LogData? ReadLine(string channel, string message)
        {
            switch (channel)
            {
                case "System":
                    var youMatch = _youRegex.Match(message);
                    if (youMatch.Success)
                    {
                        return new SystemLogData
                        {
                            material = youMatch.Groups[1].Value,
                            amount = int.Parse(youMatch.Groups[2].Value),
                            value = float.Parse(youMatch.Groups[3].Value)
                        };
                        //d = OnNewLoot(material, amount, value);
                        //if (!d.TeamMode)
                        //    d = OnNewShared(d, "You", material, amount);
                    }
                    break;

                case "Team":
                    var itemMatch = _itemRegex.Match(message);
                    if (itemMatch.Success)
                    {
                        return new TeamItemLogData
                        {
                            player = itemMatch.Groups[1].Value,
                            item = itemMatch.Groups[2].Value
                        };
                        //d = OnNewItem(d, player, item);                     
                    }
                    else
                    {
                        var sharedMatch = _sharedRegex.Match(message);
                        if (sharedMatch.Success)
                        {
                            return new TeamSharedLogData
                            {
                                player = sharedMatch.Groups[1].Value,
                                material = sharedMatch.Groups[2].Value,
                                amount = int.Parse(sharedMatch.Groups[3].Value)
                            };
                            //d = OnNewShared(d, player, material, amount);
                        }
                    }
                    break;
            }

            /*if (match)
            {
                d = d with { Start = d.Start ?? time, End = time };
            }

            return SortData(FixData(d));*/
            return null;
        }


            /*private static readonly Data EMPTY_DATA = new Data(null, null, true, new List<string>(), new List<Entry>(), new List<Entry>());


            public class Data
            {
                public DateTime? Start { get; }
                public DateTime? End { get; }
                public bool TeamMode { get; set; }
                public List<string> Players { get; }
                public List<Entry> Shared { get; }
                public List<Entry> Items { get; }

                public Data(DateTime? start, DateTime? end, bool teamMode, List<string> players, List<Entry> shared, List<Entry> items)
                {
                    Start = start;
                    End = end;
                    TeamMode = teamMode;
                    Players = players;
                    Shared = shared;
                    Items = items;
                }

                private List<float> Total => Shared.Aggregate(Enumerable.Repeat(0F, Players.Count).ToList(),
                    (acc, entry) => acc.Zip(entry.ValuesTT, (x, y) => x + y).ToList());

                public List<string> TotalPED => Total.Select(it => Math.Round(it * 100) / 100F).Select(f => f.ToString("0.00")).ToList();

                public string TotalSumPED => Total.Sum().ToString("0.00");

                public List<string> Percentage
                {
                    get
                    {
                        float sum = Total.Sum();
                        if (sum == 0F)
                            return new List<string>();

                        return Total.Select(it => Math.Round((it / sum) * 100) + "%").ToList();
                    }
                }

                public string Time
                {
                    get
                    {
                        if (Start == null)
                            return null;

                        Duration dur = Duration.Between(Start, End);
                        string elapsed = $"{dur.ToHours()}:{dur.ToMinutesPart()}:{dur.ToSecondsPart()}";
                        return $"{Start.Format(datePattern)} - {elapsed}";
                    }
                }
            }

            public class Entry
            {
                public string Name { get; }
                public List<string> Values { get; }
                public int LootAmount { get; }
                public float LootValue { get; }

                public Entry(string name, List<string> values, int lootAmount = 0, float lootValue = 0F)
                {
                    Name = name;
                    Values = values;
                    LootAmount = lootAmount;
                    LootValue = lootValue;
                }

                private float TTValue => LootAmount == 0 ? 0F : LootValue / LootAmount;

                public string TT => LootAmount == 0 ? "" : TTValue.ToString("0.00");

                public List<float> ValuesTT => Values.Select(it => string.IsNullOrEmpty(it) ? 0F : int.Parse(it) * TTValue).ToList();
            }

            private Data data = EMPTY_DATA;

            public Data GetData() => data;

            public bool HasData() => data.Start != null;

            public void ClearData()
            {
                data = EMPTY_DATA;
            }

            public void SwitchTeamMode()
            {
                data.TeamMode = !data.TeamMode;
            }       

            private static string To2Dec(float value) => (Math.Round(value * 100) / 100F).ToString("0.00");

            private static (Data, int) GetPlayerIndex(Data data, string player)
            {
                int index = data.Players.IndexOf(player);
                if (index != -1)
                {
                    return (data, index);
                }

                var newPlayers = data.Players.Concat(new[] { player }).ToList();
                var newShared = data.Shared.Select(entry => entry with { Values = entry.Values.Concat(new[] { "" }).ToList() }).ToList();
                var newItems = data.Items.Select(entry => entry with { Values = entry.Values.Concat(new[] { "" }).ToList() }).ToList();

                var newData = data with { Players = newPlayers, Shared = newShared, Items = newItems };

                return (newData, data.Players.Count);
            }

            private static string AddValue(string value, int amount)
            {
                int v = value.IsEmpty() ? 0 : int.Parse(value);
                return (v + amount).ToString();
            }

            private static List<string> AddValue(List<string> values, int index, int amount)
            {
                return values.Select((s, i) => i == index ? AddValue(s, amount) : s).ToList();
            }

            private static List<Entry> AddNew(List<Entry> entries, int index, int playerCount, string name, int amount)
            {
                if (entries.Any(entry => entry.Name == name))
                {
                    return entries.Select(entry => entry.Name == name ? entry with { Values = AddValue(entry.Values, index, amount) } : entry).ToList();
                }
                else
                {
                    return entries.Concat(new[] { new Entry(name, AddValue(Enumerable.Repeat("", playerCount).ToList(), index, amount)) }).ToList();
                }
            }

            private static Data OnNewLoot(Data data, string material, string amount, string value)
            {
                return data with
                {
                    Shared = data.Shared.Any(entry => entry.Name == material) ?
                        data.Shared.Select(entry =>
                            entry.Name == material ?
                                entry with { LootAmount = entry.LootAmount + int.Parse(amount), LootValue = entry.LootValue + float.Parse(value) } :
                                entry).ToList() :
                        data.Shared.Concat(new[] { new Entry(material, Enumerable.Repeat("", data.Players.Count).ToList(), int.Parse(amount), float.Parse(value)) }).ToList()
                };
            }*/
        }
}
