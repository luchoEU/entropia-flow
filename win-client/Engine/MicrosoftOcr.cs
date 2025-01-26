/*using System.Drawing.Imaging;
using System.IO;
using Windows.Globalization;
using Windows.Graphics.Imaging;
using Windows.Media.Ocr;
using Windows.Storage.Streams;*/

//	<TargetFramework>net8.0-windows10.0.26100.0</TargetFramework> <!-- 10.0.26100.0 required by Windows.Media.Ocr -->

namespace EntropiaFlowClient.Engine
{
    internal static class MicrosoftOcr
    {
        /*public static async Task<string> Execute(Bitmap image)
        {
            string filePath = @"D:\tmp\scanflow.png";
            image.Save(filePath, ImageFormat.Png);

            using var png = new Bitmap(filePath);
            return await PerformOcr(png);
        }

        private static async Task<string> PerformOcr(Bitmap bitmap)
        {
            // Load the image
            SoftwareBitmap softwareBitmap = await ConvertBitmapToSoftwareBitmap(bitmap);

            // Create OCR engine
            var ocrEngine = OcrEngine.TryCreateFromLanguage(new Language("en-US"));

            // Perform OCR
            var ocrResult = await ocrEngine.RecognizeAsync(softwareBitmap);

            // Return the recognized text
            return ocrResult.Text;
        }

        private static async Task<SoftwareBitmap> ConvertBitmapToSoftwareBitmap(Bitmap bitmap)
        {
            using var memoryStream = new MemoryStream();
            bitmap.Save(memoryStream, ImageFormat.Png);
            memoryStream.Seek(0, SeekOrigin.Begin);

            var randomAccessStream = new InMemoryRandomAccessStream();
            using var outputStream = randomAccessStream.GetOutputStreamAt(0);
            memoryStream.CopyTo(outputStream.AsStreamForWrite());
            randomAccessStream.Seek(0);

            var decoder = await BitmapDecoder.CreateAsync(randomAccessStream); // Class not registerd
            return await decoder.GetSoftwareBitmapAsync();
        }*/
    }
}
