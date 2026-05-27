package main

import (
	"bytes"
	"fmt"
	"image"
	"image/png"
	"log"
	"os"
	"os/exec"
	"path/filepath"

	"github.com/kbinani/screenshot"
)

func tesseractPath() string {
	exePath, err := os.Executable()
	if err != nil {
		return "tesseract.exe"
	}
	return filepath.Join(filepath.Dir(exePath), "tesseract.exe")
}

func tessDataPath() string {
	exePath, err := os.Executable()
	if err != nil {
		return "tessdata"
	}
	return filepath.Join(filepath.Dir(exePath), "tessdata")
}

func previewPath() string {
	exePath, err := os.Executable()
	if err != nil {
		return "ocr_preview.png"
	}
	return filepath.Join(filepath.Dir(exePath), "ocr_preview.png")
}

// detectRedBorder finds the CSS red border rectangle inside the captured image.
// The capture may include dark pixels before the border starts, so we scan the
// entire image for the first row/column with ≥50% red pixels rather than
// assuming the border is at the very edge.
// Returns how many pixels to skip from each side (including the border pixel itself)
// so the caller can crop to the actual content area.
func detectRedBorder(img image.Image) (left, top, right, bottom int) {
	b := img.Bounds()
	w := b.Dx()
	h := b.Dy()

	isRed := func(x, y int) bool {
		c := img.At(b.Min.X+x, b.Min.Y+y)
		r, g, bl, _ := c.RGBA()
		return r > 0x8000 && g < 0x4000 && bl < 0x4000
	}

	redColPct := func(x int) int {
		if h == 0 {
			return 0
		}
		n := 0
		for y := 0; y < h; y++ {
			if isRed(x, y) {
				n++
			}
		}
		return n * 100 / h
	}
	redRowPct := func(y int) int {
		if w == 0 {
			return 0
		}
		n := 0
		for x := 0; x < w; x++ {
			if isRed(x, y) {
				n++
			}
		}
		return n * 100 / w
	}

	const threshold = 50 // ≥50% of pixels must be red to count as a border line

	leftBorder := -1
	for x := 0; x < w; x++ {
		if redColPct(x) >= threshold {
			leftBorder = x
			break
		}
	}
	topBorder := -1
	for y := 0; y < h; y++ {
		if redRowPct(y) >= threshold {
			topBorder = y
			break
		}
	}
	rightBorder := -1
	for x := w - 1; x >= 0; x-- {
		if redColPct(x) >= threshold {
			rightBorder = x
			break
		}
	}
	bottomBorder := -1
	for y := h - 1; y >= 0; y-- {
		if redRowPct(y) >= threshold {
			bottomBorder = y
			break
		}
	}

	// left/top: pixels to skip from that side (dark prefix + border pixel itself)
	// right/bottom: pixels to skip from that side
	if leftBorder >= 0 {
		left = leftBorder + 1
	}
	if topBorder >= 0 {
		top = topBorder + 1
	}
	if rightBorder >= 0 && rightBorder != leftBorder {
		right = (w - 1) - rightBorder + 1
	}
	if bottomBorder >= 0 && bottomBorder != topBorder {
		bottom = (h - 1) - bottomBorder + 1
	}
	return
}

func performOcr(x, y, width, height int) (text string, adjust map[string]int, err error) {
	bounds := image.Rect(x, y, x+width, y+height)
	img, err := screenshot.CaptureRect(bounds)
	if err != nil {
		return "", nil, fmt.Errorf("screen capture failed: %w", err)
	}

	// Detect and crop red border, returning offsets so JS can self-correct future captures
	left, top, right, bottom := detectRedBorder(img)
	adjust = map[string]int{"left": left, "top": top, "right": right, "bottom": bottom}
	var ocrImg image.Image = img
	if left+top+right+bottom > 0 {
		log.Printf("[ocr   ] Red border detected: left=%d top=%d right=%d bottom=%d — cropping", left, top, right, bottom)
		b := img.Bounds()
		ocrImg = img.SubImage(image.Rect(b.Min.X+left, b.Min.Y+top, b.Max.X-right, b.Max.Y-bottom))
	}

	var pngBuf bytes.Buffer
	if err := png.Encode(&pngBuf, ocrImg); err != nil {
		return "", adjust, fmt.Errorf("failed to encode PNG: %w", err)
	}
	pngBytes := pngBuf.Bytes()

	_ = os.WriteFile(previewPath(), pngBytes, 0644)

	tmpDir := os.TempDir()
	inputPath := filepath.Join(tmpDir, "entropia_ocr_input.png")
	outputBase := filepath.Join(tmpDir, "entropia_ocr_output")
	outputPath := outputBase + ".txt"

	if err := os.WriteFile(inputPath, pngBytes, 0644); err != nil {
		return "", adjust, fmt.Errorf("failed to write temp file: %w", err)
	}
	defer os.Remove(inputPath)
	defer os.Remove(outputPath)

	var stderr bytes.Buffer
	cmd := exec.Command(tesseractPath(), inputPath, outputBase, "--tessdata-dir", tessDataPath(), "-l", "eng")
	cmd.Stderr = &stderr
	if err := cmd.Run(); err != nil {
		return "", adjust, fmt.Errorf("tesseract failed: %w\nstderr: %s", err, stderr.String())
	}

	result, err := os.ReadFile(outputPath)
	if err != nil {
		return "", adjust, fmt.Errorf("failed to read OCR output: %w", err)
	}

	return string(result), adjust, nil
}

func internalOcrHandler(server *Server) {
	log.Println("[ocr   ] Initializing...")

	server.internalHandlers["ocr"] = func(msg RelayMessage) {
		if msg.MessageType != "ocr_request" {
			return
		}

		payloadMap, ok := msg.Payload.(map[string]interface{})
		if !ok {
			server.router.RouteMessage(RelayMessage{
				MessageType: "ocr_response",
				From:        "ocr",
				To:          msg.From,
				Payload:     map[string]interface{}{"error": "invalid payload"},
			})
			return
		}

		getInt := func(key string) (int, bool) {
			v, ok := payloadMap[key].(float64)
			return int(v), ok
		}

		x, okX := getInt("x")
		y, okY := getInt("y")
		w, okW := getInt("width")
		h, okH := getInt("height")
		if !okX || !okY || !okW || !okH {
			server.router.RouteMessage(RelayMessage{
				MessageType: "ocr_response",
				From:        "ocr",
				To:          msg.From,
				Payload:     map[string]interface{}{"error": "payload must include x, y, width, height"},
			})
			return
		}

		log.Printf("[ocr   ] Processing region (%d,%d) %dx%d", x, y, w, h)
		text, adjust, err := performOcr(x, y, w, h)

		var payload map[string]interface{}
		if err != nil {
			log.Printf("[ocr   ] Error: %v", err)
			payload = map[string]interface{}{"error": err.Error(), "adjust": adjust}
		} else {
			payload = map[string]interface{}{"text": text, "adjust": adjust}
		}

		server.router.RouteMessage(RelayMessage{
			MessageType: "ocr_response",
			From:        "ocr",
			To:          msg.From,
			Payload:     payload,
		})
	}
}

func init() {
	registerInternal("ocr", internalOcrHandler)
}
