using System.IO;
using System.Reflection;
using Tesseract;

namespace EntropiaFlowClient.Engine
{
    internal class TesseractOcr
    {
        private static string? _tessData;
        private static string TessData
        {
            get
            {
                if (_tessData == null)
                {
                    _tessData = Path.Combine(Path.GetTempPath(), "tessdata");
                    Directory.CreateDirectory(_tessData);
                    string outputPath = Path.Combine(_tessData, "eng.traineddata");
                    if (!File.Exists(outputPath))
                    {
                        using Stream resourceStream = Assembly.GetExecutingAssembly().GetManifestResourceStream("EntropiaFlowClient.Engine.eng.traineddata")!;
                        using FileStream fileStream = new(outputPath, FileMode.Create, FileAccess.Write);
                        resourceStream.CopyTo(fileStream);
                    }
                }
                return _tessData;
            }
        }

        public static Task<string> Execute(Bitmap bitmap)
        {
            using var engine = new TesseractEngine(TessData, "eng", EngineMode.Default);
            using var img = ConvertBitmapToPix(bitmap);
            using var page = engine.Process(img);
            return Task.FromResult(page.GetText());
        }

        private static Pix ConvertBitmapToPix(Bitmap bitmap)
        {
            // Use Tesseract's Bitmap to Pix converter
            using var stream = new MemoryStream();
            bitmap.Save(stream, System.Drawing.Imaging.ImageFormat.Png);
            stream.Position = 0;
            return Pix.LoadFromMemory(stream.ToArray());
        }
    }
}
