//go:build ignore

package main

import (
	"bytes"
	"image"
	"image/color"
	"image/png"
	"log"
	"math"
	"os"
	"strconv"
	"strings"

	"github.com/kbinani/screenshot"
	"github.com/otiai10/gosseract/v2"
)

// CircleInfo represents a detected circle with extracted text
type CircleInfo struct {
	CenterX  float32 `json:"centerX"`
	CenterY  float32 `json:"centerY"`
	Radius   float32 `json:"radius"`
	TopText  string  `json:"topText,omitempty"`  // Text above circle (e.g., "CALYPSO")
	BottomText string `json:"bottomText,omitempty"` // Text below circle (e.g., "Lon: 71546\nLat: 68246")
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
	for _, c := range circles {
		drawCircle(result, int(c.CenterX), int(c.CenterY), int(c.Radius), red)
		// Draw center point
		drawCross(result, int(c.CenterX), int(c.CenterY), 5, red)
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

// cropImage extracts a rectangular region from an image
func cropImage(img *image.RGBA, x, y, width, height int) *image.RGBA {
	bounds := img.Bounds()

	// Clamp coordinates to image bounds
	if x < bounds.Min.X {
		x = bounds.Min.X
	}
	if y < bounds.Min.Y {
		y = bounds.Min.Y
	}
	if x+width > bounds.Max.X {
		width = bounds.Max.X - x
	}
	if y+height > bounds.Max.Y {
		height = bounds.Max.Y - y
	}

	cropped := image.NewRGBA(image.Rect(0, 0, width, height))
	for dy := 0; dy < height; dy++ {
		for dx := 0; dx < width; dx++ {
			cropped.Set(dx, dy, img.At(x+dx, y+dy))
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

// extractTextFromRegion uses OCR to extract text from an image region
func extractTextFromRegion(img *image.RGBA, x, y, width, height int) (string, error) {
	cropped := cropImage(img, x, y, width, height)

	imgBytes, err := imageToBytes(cropped)
	if err != nil {
		return "", err
	}

	client := gosseract.NewClient()
	defer client.Close()

	// Configure for better accuracy on game text
	client.SetWhitelist("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789: \n")

	if err := client.SetImageFromBytes(imgBytes); err != nil {
		return "", err
	}

	text, err := client.Text()
	if err != nil {
		return "", err
	}

	return strings.TrimSpace(text), nil
}

// extractMinimapText extracts text around a detected circle (minimap)
func extractMinimapText(img *image.RGBA, circle CircleInfo) (topText, bottomText string) {
	cx := int(circle.CenterX)
	cy := int(circle.CenterY)
	r := int(circle.Radius)

	// Top text region: above the circle (for "CALYPSO")
	topX := cx - r - 20
	topY := cy - r - 30
	topWidth := r*2 + 40
	topHeight := 25

	// Bottom-left text region: below and to the left of circle (for "Lon:" and "Lat:")
	bottomX := cx - r - 30
	bottomY := cy + r + 5
	bottomWidth := 100
	bottomHeight := 40

	var err error
	topText, err = extractTextFromRegion(img, topX, topY, topWidth, topHeight)
	if err != nil {
		log.Printf("[ocr] Failed to extract top text: %v", err)
	}

	bottomText, err = extractTextFromRegion(img, bottomX, bottomY, bottomWidth, bottomHeight)
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

	log.Println("Testing circle detection with debug images and OCR...")
	circles := DetectCirclesWithDebug(displayIndex, 50, 1.0)
	log.Printf("Found %d circles:", len(circles))
	for i, c := range circles {
		log.Printf("  [%d] Center: (%.1f, %.1f), Radius: %.1f", i, c.CenterX, c.CenterY, c.Radius)
		if c.TopText != "" {
			log.Printf("       Top text: %q", c.TopText)
		}
		if c.BottomText != "" {
			lon, lat := parseCoordinates(c.BottomText)
			log.Printf("       Bottom text: %q", c.BottomText)
			if lon != 0 || lat != 0 {
				log.Printf("       Parsed coords: Lon=%d, Lat=%d", lon, lat)
			}
		}
	}
}
