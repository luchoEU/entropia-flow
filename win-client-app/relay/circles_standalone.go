//go:build ignore

package main

import (
	"bytes"
	"context"
	"image"
	"image/color"
	"image/png"
	"log"
	"math"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/danlock/gogosseract"
	"github.com/kbinani/screenshot"
)

// CircleInfo represents a detected circle with extracted text
type CircleInfo struct {
	CenterX    float32 `json:"centerX"`
	CenterY    float32 `json:"centerY"`
	Radius     float32 `json:"radius"`
	TopText    string  `json:"topText,omitempty"`    // Text above circle (e.g., "CALYPSO")
	BottomText string  `json:"bottomText,omitempty"` // Text below circle (e.g., "Lon: 71546\nLat: 68246")
}

// MinimapInfo contains the extracted minimap data
type MinimapInfo struct {
	Circle    CircleInfo `json:"circle"`
	Planet    string     `json:"planet"`    // e.g., "CALYPSO"
	Longitude int        `json:"longitude"` // e.g., 71546
	Latitude  int        `json:"latitude"`  // e.g., 68246
}

// rgbToHsv converts RGB values to HSV (H: 0-180, S: 0-255, V: 0-255 to match OpenCV)
func rgbToHsv(r, g, b uint8) (h, s, v uint8) {
	rf := float64(r) / 255.0
	gf := float64(g) / 255.0
	bf := float64(b) / 255.0

	max := math.Max(rf, math.Max(gf, bf))
	min := math.Min(rf, math.Min(gf, bf))
	delta := max - min

	v = uint8(max * 255)

	if max == 0 {
		s = 0
	} else {
		s = uint8((delta / max) * 255)
	}

	var hf float64
	if delta == 0 {
		hf = 0
	} else if max == rf {
		hf = 60 * math.Mod((gf-bf)/delta, 6)
	} else if max == gf {
		hf = 60 * ((bf-rf)/delta + 2)
	} else {
		hf = 60 * ((rf-gf)/delta + 4)
	}
	if hf < 0 {
		hf += 360
	}
	h = uint8(hf / 2)

	return h, s, v
}

func inRange(h, s, v, hMin, sMin, vMin, hMax, sMax, vMax uint8) bool {
	return h >= hMin && h <= hMax && s >= sMin && s <= sMax && v >= vMin && v <= vMax
}

func createBinaryMask(img *image.RGBA, hMin, sMin, vMin, hMax, sMax, vMax uint8) [][]uint8 {
	bounds := img.Bounds()
	width := bounds.Dx()
	height := bounds.Dy()

	mask := make([][]uint8, height)
	for y := 0; y < height; y++ {
		mask[y] = make([]uint8, width)
		for x := 0; x < width; x++ {
			idx := (y-bounds.Min.Y)*img.Stride + (x-bounds.Min.X)*4
			r, g, b := img.Pix[idx], img.Pix[idx+1], img.Pix[idx+2]
			h, s, v := rgbToHsv(r, g, b)
			if inRange(h, s, v, hMin, sMin, vMin, hMax, sMax, vMax) {
				mask[y][x] = 255
			}
		}
	}
	return mask
}

func gaussianBlur(mask [][]uint8) [][]uint8 {
	height := len(mask)
	if height == 0 {
		return mask
	}
	width := len(mask[0])

	kernel := [][]float64{
		{1, 4, 7, 4, 1},
		{4, 16, 26, 16, 4},
		{7, 26, 41, 26, 7},
		{4, 16, 26, 16, 4},
		{1, 4, 7, 4, 1},
	}
	kernelSum := 273.0

	result := make([][]uint8, height)
	for y := 0; y < height; y++ {
		result[y] = make([]uint8, width)
		for x := 0; x < width; x++ {
			if y < 2 || y >= height-2 || x < 2 || x >= width-2 {
				result[y][x] = mask[y][x]
				continue
			}
			var sum float64
			for ky := 0; ky < 5; ky++ {
				for kx := 0; kx < 5; kx++ {
					sum += float64(mask[y+ky-2][x+kx-2]) * kernel[ky][kx]
				}
			}
			result[y][x] = uint8(sum / kernelSum)
		}
	}
	return result
}

func sobelGradient(mask [][]uint8) ([][]float64, [][]float64) {
	height := len(mask)
	width := len(mask[0])

	magnitude := make([][]float64, height)
	direction := make([][]float64, height)

	for y := 0; y < height; y++ {
		magnitude[y] = make([]float64, width)
		direction[y] = make([]float64, width)
	}

	for y := 1; y < height-1; y++ {
		for x := 1; x < width-1; x++ {
			gx := -float64(mask[y-1][x-1]) + float64(mask[y-1][x+1]) +
				-2*float64(mask[y][x-1]) + 2*float64(mask[y][x+1]) +
				-float64(mask[y+1][x-1]) + float64(mask[y+1][x+1])

			gy := -float64(mask[y-1][x-1]) + -2*float64(mask[y-1][x]) + -float64(mask[y-1][x+1]) +
				float64(mask[y+1][x-1]) + 2*float64(mask[y+1][x]) + float64(mask[y+1][x+1])

			magnitude[y][x] = math.Sqrt(gx*gx + gy*gy)
			direction[y][x] = math.Atan2(gy, gx)
		}
	}
	return magnitude, direction
}

func houghCircles(mask [][]uint8, minRadius, maxRadius, minDist int, param2 float64) []CircleInfo {
	height := len(mask)
	width := len(mask[0])

	magnitude, direction := sobelGradient(mask)

	accumulator := make([][]int, height)
	for y := 0; y < height; y++ {
		accumulator[y] = make([]int, width)
	}

	edgeThreshold := 50.0

	for y := 1; y < height-1; y++ {
		for x := 1; x < width-1; x++ {
			if magnitude[y][x] < edgeThreshold {
				continue
			}

			for r := minRadius; r <= maxRadius; r++ {
				cx := int(float64(x) + float64(r)*math.Cos(direction[y][x]))
				cy := int(float64(y) + float64(r)*math.Sin(direction[y][x]))
				if cx >= 0 && cx < width && cy >= 0 && cy < height {
					accumulator[cy][cx]++
				}

				cx = int(float64(x) - float64(r)*math.Cos(direction[y][x]))
				cy = int(float64(y) - float64(r)*math.Sin(direction[y][x]))
				if cx >= 0 && cx < width && cy >= 0 && cy < height {
					accumulator[cy][cx]++
				}
			}
		}
	}

	var candidates []CircleInfo
	threshold := int(param2)

	for y := minRadius; y < height-minRadius; y++ {
		for x := minRadius; x < width-minRadius; x++ {
			if accumulator[y][x] < threshold {
				continue
			}

			isMax := true
			for dy := -3; dy <= 3 && isMax; dy++ {
				for dx := -3; dx <= 3 && isMax; dx++ {
					if dy == 0 && dx == 0 {
						continue
					}
					ny, nx := y+dy, x+dx
					if ny >= 0 && ny < height && nx >= 0 && nx < width {
						if accumulator[ny][nx] > accumulator[y][x] {
							isMax = false
						}
					}
				}
			}

			if isMax {
				bestRadius := estimateRadius(mask, x, y, minRadius, maxRadius, magnitude, edgeThreshold)
				if bestRadius > 0 {
					candidates = append(candidates, CircleInfo{
						CenterX: float32(x),
						CenterY: float32(y),
						Radius:  float32(bestRadius),
					})
				}
			}
		}
	}

	var result []CircleInfo
	for _, c := range candidates {
		tooClose := false
		for _, existing := range result {
			dx := c.CenterX - existing.CenterX
			dy := c.CenterY - existing.CenterY
			if math.Sqrt(float64(dx*dx+dy*dy)) < float64(minDist) {
				tooClose = true
				break
			}
		}
		if !tooClose {
			result = append(result, c)
		}
	}

	return result
}

func estimateRadius(mask [][]uint8, cx, cy, minR, maxR int, magnitude [][]float64, edgeThreshold float64) int {
	height := len(mask)
	width := len(mask[0])

	bestRadius := 0
	bestScore := 0

	for r := minR; r <= maxR; r++ {
		score := 0
		samples := 0

		for angle := 0.0; angle < 2*math.Pi; angle += math.Pi / 18 {
			x := int(float64(cx) + float64(r)*math.Cos(angle))
			y := int(float64(cy) + float64(r)*math.Sin(angle))

			if x >= 0 && x < width && y >= 0 && y < height {
				samples++
				if magnitude[y][x] >= edgeThreshold {
					score++
				}
			}
		}

		if samples > 0 && score > bestScore && float64(score)/float64(samples) > 0.5 {
			bestScore = score
			bestRadius = r
		}
	}

	return bestRadius
}

// saveMaskAsImage saves a 2D mask array as a grayscale PNG
func saveMaskAsImage(mask [][]uint8, filename string) error {
	height := len(mask)
	width := len(mask[0])

	img := image.NewGray(image.Rect(0, 0, width, height))
	for y := 0; y < height; y++ {
		for x := 0; x < width; x++ {
			img.SetGray(x, y, color.Gray{Y: mask[y][x]})
		}
	}

	f, err := os.Create(filename)
	if err != nil {
		return err
	}
	defer f.Close()

	return png.Encode(f, img)
}

// loadImageFromPNG loads an image from a PNG file
func loadImageFromPNG(filename string) (*image.RGBA, error) {
	f, err := os.Open(filename)
	if err != nil {
		return nil, err
	}
	defer f.Close()
	img, err := png.Decode(f)
	if err != nil {
		return nil, err
	}
	rgba, ok := img.(*image.RGBA)
	if !ok {
		// Convert to RGBA
		bounds := img.Bounds()
		rgba = image.NewRGBA(bounds)
		for y := bounds.Min.Y; y < bounds.Max.Y; y++ {
			for x := bounds.Min.X; x < bounds.Max.X; x++ {
				rgba.Set(x, y, img.At(x, y))
			}
		}
	}
	return rgba, nil
}

// saveImageWithCircles saves the original image with detected circles drawn on it
func saveImageWithCircles(img *image.RGBA, circles []CircleInfo, filename string) error {
	// Create a copy of the image
	bounds := img.Bounds()
	result := image.NewRGBA(bounds)
	for y := bounds.Min.Y; y < bounds.Max.Y; y++ {
		for x := bounds.Min.X; x < bounds.Max.X; x++ {
			result.Set(x, y, img.At(x, y))
		}
	}

	// Draw circles in red
	red := color.RGBA{R: 255, G: 0, B: 0, A: 255}
	white := color.RGBA{R: 255, G: 255, B: 255, A: 255}
	cyan := color.RGBA{R: 0, G: 255, B: 255, A: 255}
	green := color.RGBA{R: 0, G: 255, B: 0, A: 255}

	for i, c := range circles {
		drawCircle(result, int(c.CenterX), int(c.CenterY), int(c.Radius), red)
		// Draw center point
		drawCross(result, int(c.CenterX), int(c.CenterY), 5, red)

		// Draw circle number in white
		drawText(result, int(c.CenterX)-5, int(c.CenterY)-int(c.Radius)-10, strconv.Itoa(i+1), white)

		// Bottom OCR ROI (cyan with corner ticks)
		bRect := bottomOCRRect(c)
		drawRectOutline(result, bRect, cyan)

		// Top OCR ROI (green with corner ticks)
		tRect := topOCRRect(c)
		drawRectOutline(result, tRect, green)
	}

	f, err := os.Create(filename)
	if err != nil {
		return err
	}
	defer f.Close()

	return png.Encode(f, result)
}

// drawCircle draws a circle outline on an image
func drawCircle(img *image.RGBA, cx, cy, radius int, col color.RGBA) {
	for angle := 0.0; angle < 2*math.Pi; angle += 0.01 {
		x := int(float64(cx) + float64(radius)*math.Cos(angle))
		y := int(float64(cy) + float64(radius)*math.Sin(angle))
		if x >= 0 && x < img.Bounds().Dx() && y >= 0 && y < img.Bounds().Dy() {
			img.SetRGBA(x, y, col)
		}
	}
}

// drawCross draws a small cross at the specified point
func drawCross(img *image.RGBA, cx, cy, size int, col color.RGBA) {
	for i := -size; i <= size; i++ {
		if cx+i >= 0 && cx+i < img.Bounds().Dx() {
			img.SetRGBA(cx+i, cy, col)
		}
		if cy+i >= 0 && cy+i < img.Bounds().Dy() {
			img.SetRGBA(cx, cy+i, col)
		}
	}
}

// drawText draws simple text using a basic 5x7 font pattern
func drawText(img *image.RGBA, x, y int, text string, col color.RGBA) {
	// Simple 5x7 font patterns for digits 0-9
	fontPatterns := map[rune][]string{
		'0': {"11111", "10001", "10011", "10101", "11001", "10001", "11111"},
		'1': {"00100", "01100", "00100", "00100", "00100", "00100", "01110"},
		'2': {"11111", "00001", "00001", "11111", "10000", "10000", "11111"},
		'3': {"11111", "00001", "00001", "11111", "00001", "00001", "11111"},
		'4': {"10001", "10001", "10001", "11111", "00001", "00001", "00001"},
		'5': {"11111", "10000", "10000", "11111", "00001", "00001", "11111"},
		'6': {"11111", "10000", "10000", "11111", "10001", "10001", "11111"},
		'7': {"11111", "00001", "00010", "00100", "01000", "01000", "01000"},
		'8': {"11111", "10001", "10001", "11111", "10001", "10001", "11111"},
		'9': {"11111", "10001", "10001", "11111", "00001", "00001", "11111"},
	}

	charWidth := 6 // 5 pixels + 1 space
	charHeight := 7

	for i, char := range text {
		pattern, exists := fontPatterns[char]
		if !exists {
			continue
		}

		charX := x + i*charWidth
		for row := 0; row < charHeight; row++ {
			for colIdx := 0; colIdx < 5; colIdx++ {
				if row < len(pattern) && colIdx < len(pattern[row]) && pattern[row][colIdx] == '1' {
					px, py := charX+colIdx, y+row
					if px >= 0 && px < img.Bounds().Dx() && py >= 0 && py < img.Bounds().Dy() {
						img.SetRGBA(px, py, col)
					}
				}
			}
		}
	}
}

// draw rectangle outline on image with corner ticks for better visibility
func drawRectOutline(img *image.RGBA, rect image.Rectangle, col color.RGBA) {
	// Clip to image bounds
	minX := max(rect.Min.X, img.Bounds().Min.X)
	minY := max(rect.Min.Y, img.Bounds().Min.Y)
	maxX := min(rect.Max.X, img.Bounds().Max.X)
	maxY := min(rect.Max.Y, img.Bounds().Max.Y)

	// Top and bottom borders
	for x := minX; x <= maxX; x++ {
		if minY >= img.Bounds().Min.Y && minY < img.Bounds().Max.Y {
			img.SetRGBA(x, minY, col)
		}
		if maxY-1 >= img.Bounds().Min.Y && maxY-1 < img.Bounds().Max.Y {
			img.SetRGBA(x, maxY-1, col)
		}
	}
	// Left and right borders
	for y := minY; y <= maxY; y++ {
		if minX >= img.Bounds().Min.X && minX < img.Bounds().Max.X {
			img.SetRGBA(minX, y, col)
		}
		if maxX-1 >= img.Bounds().Min.X && maxX-1 < img.Bounds().Max.X {
			img.SetRGBA(maxX-1, y, col)
		}
	}

	// Add corner ticks (ticker-style) for better visibility
	tickLength := 8
	// Top-left corner
	for i := 0; i <= tickLength; i++ {
		if minX+i >= img.Bounds().Min.X && minX+i < img.Bounds().Max.X && minY >= img.Bounds().Min.Y && minY < img.Bounds().Max.Y {
			img.SetRGBA(minX+i, minY, col)
		}
		if minY+i >= img.Bounds().Min.Y && minY+i < img.Bounds().Max.Y && minX >= img.Bounds().Min.X && minX < img.Bounds().Max.X {
			img.SetRGBA(minX, minY+i, col)
		}
	}
	// Top-right corner
	for i := 0; i <= tickLength; i++ {
		if maxX-i >= img.Bounds().Min.X && maxX-i < img.Bounds().Max.X && minY >= img.Bounds().Min.Y && minY < img.Bounds().Max.Y {
			img.SetRGBA(maxX-i, minY, col)
		}
		if minY+i >= img.Bounds().Min.Y && minY+i < img.Bounds().Max.Y && maxX-1 >= img.Bounds().Min.X && maxX-1 < img.Bounds().Max.X {
			img.SetRGBA(maxX-1, minY+i, col)
		}
	}
	// Bottom-left corner
	for i := 0; i <= tickLength; i++ {
		if minX+i >= img.Bounds().Min.X && minX+i < img.Bounds().Max.X && maxY-1 >= img.Bounds().Min.Y && maxY-1 < img.Bounds().Max.Y {
			img.SetRGBA(minX+i, maxY-1, col)
		}
		if maxY-i >= img.Bounds().Min.Y && maxY-i < img.Bounds().Max.Y && minX >= img.Bounds().Min.X && minX < img.Bounds().Max.X {
			img.SetRGBA(minX, maxY-i, col)
		}
	}
	// Bottom-right corner
	for i := 0; i <= tickLength; i++ {
		if maxX-i >= img.Bounds().Min.X && maxX-i < img.Bounds().Max.X && maxY-1 >= img.Bounds().Min.Y && maxY-1 < img.Bounds().Max.Y {
			img.SetRGBA(maxX-i, maxY-1, col)
		}
		if maxY-i >= img.Bounds().Min.Y && maxY-i < img.Bounds().Max.Y && maxX-1 >= img.Bounds().Min.X && maxX-1 < img.Bounds().Max.X {
			img.SetRGBA(maxX-1, maxY-i, col)
		}
	}
}

// cropImage extracts a rectangular region from an image
func cropImage(img *image.RGBA, rect image.Rectangle) *image.RGBA {
	cropped := image.NewRGBA(image.Rect(0, 0, rect.Dx(), rect.Dy()))
	for dy := 0; dy < rect.Dy(); dy++ {
		for dx := 0; dx < rect.Dx(); dx++ {
			cropped.Set(dx, dy, img.At(rect.Min.X+dx, rect.Min.Y+dy))
		}
	}
	return cropped
}

// imageToBytes converts an image to PNG bytes
func imageToBytes(img image.Image) ([]byte, error) {
	var buf bytes.Buffer
	if err := png.Encode(&buf, img); err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}

// saveImageAsPNG saves an image as PNG file
func saveImageAsPNG(img image.Image, filename string) error {
	f, err := os.Create(filename)
	if err != nil {
		return err
	}
	defer f.Close()
	return png.Encode(f, img)
}

// OCR ROI rectangles based on a detected circle
func bottomOCRRect(c CircleInfo) image.Rectangle {
	cx := int(c.CenterX)
	cy := int(c.CenterY)
	r := int(c.Radius)
	// Increased crop size - wider and taller to capture full Lon/Lat text
	bottomX := cx - r + r/8
	bottomY := cy + r + 3
	bottomWidth := r - r/4
	bottomHeight := r * 4 / 10
	return image.Rect(bottomX, bottomY, bottomX+bottomWidth, bottomY+bottomHeight)
}

func topOCRRect(c CircleInfo) image.Rectangle {
	cx := int(c.CenterX)
	cy := int(c.CenterY)
	r := int(c.Radius)
	// Increased crop size to capture planet names
	topX := cx
	topY := cy - r - r/2 + 3
	topWidth := r + r/3
	topHeight := r / 5
	return image.Rect(topX, topY, topX+topWidth, topY+topHeight)
}

// extractTextFromRegion uses OCR to extract text from an image region
func extractTextFromRegion(img *image.RGBA, rect image.Rectangle) (string, error) {
	cropped := cropImage(img, rect)

	// Convert cropped image to PNG bytes
	imageBytes, err := imageToBytes(cropped)
	if err != nil {
		log.Printf("[ocr] Failed to convert image to bytes: %v", err)
		return "OCR_CONVERT_FAILED", nil
	}

	ctx := context.Background()

	// Try to download English traineddata if not available
	trainingDataPath := "eng.traineddata"
	if _, err := os.Stat(trainingDataPath); os.IsNotExist(err) {
		log.Printf("[ocr] Downloading English traineddata for Tesseract...")
		// For now, use a simple fallback since auto-download requires setup
		return "OCR_NO_TRAINDATA", nil
	}

	// Open training data file
	trainingDataFile, err := os.Open(trainingDataPath)
	if err != nil {
		log.Printf("[ocr] Failed to open traineddata: %v", err)
		return "OCR_NO_TRAINDATA", nil
	}
	defer trainingDataFile.Close()

	// Create gogosseract instance
	cfg := gogosseract.Config{
		Language:     "eng",
		TrainingData: trainingDataFile,
	}

	tess, err := gogosseract.New(ctx, cfg)
	if err != nil {
		log.Printf("[ocr] Failed to initialize gogosseract: %v", err)
		return "OCR_INIT_FAILED", nil
	}
	defer tess.Close(ctx)

	// Load image from bytes using bytes.Reader
	if err := tess.LoadImage(ctx, bytes.NewReader(imageBytes), gogosseract.LoadImageOptions{}); err != nil {
		log.Printf("[ocr] Failed to load image: %v", err)
		return "OCR_LOAD_FAILED", nil
	}

	// Extract text
	text, err := tess.GetText(ctx, nil)
	if err != nil {
		log.Printf("[ocr] Failed to extract text: %v", err)
		return "OCR_EXTRACT_FAILED", nil
	}

	return strings.TrimSpace(text), nil
}

func clampRect(rect image.Rectangle, bounds image.Rectangle) image.Rectangle {
	// Clamp coordinates to image bounds
	if rect.Min.X < bounds.Min.X {
		rect.Min.X = bounds.Min.X
	}
	if rect.Min.Y < bounds.Min.Y {
		rect.Min.Y = bounds.Min.Y
	}
	if rect.Max.X > bounds.Max.X {
		rect.Max.X = bounds.Max.X
	}
	if rect.Max.Y > bounds.Max.Y {
		rect.Max.Y = bounds.Max.Y
	}
	if rect.Dx() < 10 {
		rect.Max.X = rect.Min.X + 10 // minimum width for OCR
	}
	if rect.Dy() < 5 {
		rect.Max.Y = rect.Min.Y + 5 // minimum height for OCR
	}
	return rect
}

// extractMinimapText extracts text around a detected circle (minimap)
func extractMinimapText(img *image.RGBA, circle CircleInfo) (topText, bottomText string) {
	bounds := img.Bounds()

	// Top text region: above the circle (for "CALYPSO")
	tRect := topOCRRect(circle)
	tRect = clampRect(tRect, bounds)

	// Bottom-left text region: below and to the left of circle (for "Lon:" and "Lat:")
	bRect := bottomOCRRect(circle)
	bRect = clampRect(bRect, bounds)

	var err error
	topText, err = extractTextFromRegion(img, tRect)
	if err != nil {
		log.Printf("[ocr] Failed to extract top text: %v", err)
	}

	bottomText, err = extractTextFromRegion(img, bRect)
	if err != nil {
		log.Printf("[ocr] Failed to extract bottom text: %v", err)
	}

	return topText, bottomText
}

// parseCoordinates extracts Lon and Lat values from text like "Lon: 71546\nLat: 68246"
func parseCoordinates(text string) (lon, lat int) {
	lines := strings.Split(text, "\n")
	for _, line := range lines {
		line = strings.TrimSpace(line)
		if strings.HasPrefix(line, "Lon") {
			parts := strings.Split(line, ":")
			if len(parts) >= 2 {
				val := strings.TrimSpace(parts[1])
				if n, err := strconv.Atoi(val); err == nil {
					lon = n
				}
			}
		} else if strings.HasPrefix(line, "Lat") {
			parts := strings.Split(line, ":")
			if len(parts) >= 2 {
				val := strings.TrimSpace(parts[1])
				if n, err := strconv.Atoi(val); err == nil {
					lat = n
				}
			}
		}
	}
	return lon, lat
}

// DetectCirclesWithDebug performs circle detection and saves debug images
func DetectCirclesWithDebug(displayIndex, minRadius int, screenScalingFactor float64) []CircleInfo {
	bounds := screenshot.GetDisplayBounds(displayIndex)
	img, err := screenshot.CaptureRect(bounds)
	if err != nil {
		log.Printf("[circles] Failed to capture screenshot: %v", err)
		return nil
	}

	// Save original screenshot
	if err := saveImageWithCircles(img, nil, "debug_1_screenshot.png"); err != nil {
		log.Printf("[circles] Failed to save screenshot: %v", err)
	} else {
		log.Println("[circles] Saved: debug_1_screenshot.png")
	}

	/*img, err := loadImageFromPNG("debug_1_screenshot.png")
	if err != nil {
		log.Printf("[circles] Failed to load screenshot: %v", err)
		return nil
	}*/

	// Create binary mask
	mask := createBinaryMask(img, 0, 0, 145, 180, 30, 255)

	// Save mask
	if err := saveMaskAsImage(mask, "debug_2_mask.png"); err != nil {
		log.Printf("[circles] Failed to save mask: %v", err)
	} else {
		log.Println("[circles] Saved: debug_2_mask.png")
	}

	// Apply blur
	blurred := gaussianBlur(mask)

	// Save blurred mask
	if err := saveMaskAsImage(blurred, "debug_3_blurred.png"); err != nil {
		log.Printf("[circles] Failed to save blurred mask: %v", err)
	} else {
		log.Println("[circles] Saved: debug_3_blurred.png")
	}

	// Detect circles
	scaledMinRadius := int(float64(minRadius) * screenScalingFactor)
	scaledMaxRadius := int(200.0 * screenScalingFactor)
	minDist := len(blurred) / 4

	circles := houghCircles(blurred, scaledMinRadius, scaledMaxRadius, minDist, 50.0)

	// Filter circles within bounds
	var result []CircleInfo
	imgWidth := float32(len(blurred[0]))
	imgHeight := float32(len(blurred))

	for _, c := range circles {
		if c.CenterX-c.Radius > 0 && c.CenterY-c.Radius > 0 &&
			c.CenterX+c.Radius < imgWidth && c.CenterY+c.Radius < imgHeight {
			// Extract text around the circle using OCR
			topText, bottomText := extractMinimapText(img, c)
			c.TopText = topText
			c.BottomText = bottomText
			result = append(result, c)
		}
	}

	// Save result with circles drawn
	if err := saveImageWithCircles(img, result, "debug_4_result.png"); err != nil {
		log.Printf("[circles] Failed to save result: %v", err)
	} else {
		log.Println("[circles] Saved: debug_4_result.png")
	}

	log.Printf("[circles] Detected %d circles (from %d candidates)", len(result), len(circles))
	return result
}

func main() {
	displayIndex := 0
	if len(os.Args) > 1 {
		if n, err := strconv.Atoi(os.Args[1]); err == nil {
			displayIndex = n
		}
	}

	n := screenshot.NumActiveDisplays()
	log.Printf("Found %d displays, capturing display %d", n, displayIndex)

	log.Println("Detecting the correct circle with coordinates...")
	circles := DetectCirclesWithDebug(displayIndex, 80, 1.0)

	// Find the correct circle with coordinates
	var correctCircle CircleInfo
	for _, c := range circles {
		lon, lat := parseCoordinates(c.BottomText)
		if lon != 0 || lat != 0 {
			correctCircle = c
			break
		}
	}

	if correctCircle.Radius == 0 {
		log.Println("No circle with coordinates found")
		return
	}

	log.Printf("Using circle at (%.1f, %.1f), Radius: %.1f", correctCircle.CenterX, correctCircle.CenterY, correctCircle.Radius)

	// Infinite loop to capture and OCR
	for {
		bounds := screenshot.GetDisplayBounds(displayIndex)
		img, err := screenshot.CaptureRect(bounds)
		if err != nil {
			log.Printf("Failed to capture: %v", err)
			time.Sleep(time.Second)
			continue
		}

		topText, bottomText := extractMinimapText(img, correctCircle)
		lon, lat := parseCoordinates(bottomText)
		log.Printf("Planet: %s, Lon: %d, Lat: %d", topText, lon, lat)

		time.Sleep(time.Second)
	}
}
