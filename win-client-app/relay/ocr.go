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

func performOcr(x, y, width, height int) (string, error) {
	bounds := image.Rect(x, y, x+width, y+height)
	img, err := screenshot.CaptureRect(bounds)
	if err != nil {
		return "", fmt.Errorf("screen capture failed: %w", err)
	}

	tmpDir := os.TempDir()
	inputPath := filepath.Join(tmpDir, "entropia_ocr_input.png")
	outputBase := filepath.Join(tmpDir, "entropia_ocr_output")
	outputPath := outputBase + ".txt"

	f, err := os.Create(inputPath)
	if err != nil {
		return "", fmt.Errorf("failed to create temp file: %w", err)
	}
	if err := png.Encode(f, img); err != nil {
		f.Close()
		return "", fmt.Errorf("failed to encode PNG: %w", err)
	}
	f.Close()
	defer os.Remove(inputPath)
	defer os.Remove(outputPath)

	var stderr bytes.Buffer
	cmd := exec.Command(tesseractPath(), inputPath, outputBase, "--tessdata-dir", tessDataPath(), "-l", "eng")
	cmd.Stderr = &stderr
	if err := cmd.Run(); err != nil {
		return "", fmt.Errorf("tesseract failed: %w\nstderr: %s", err, stderr.String())
	}

	result, err := os.ReadFile(outputPath)
	if err != nil {
		return "", fmt.Errorf("failed to read OCR output: %w", err)
	}

	return string(result), nil
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
		text, err := performOcr(x, y, w, h)

		var payload map[string]interface{}
		if err != nil {
			log.Printf("[ocr   ] Error: %v", err)
			payload = map[string]interface{}{"error": err.Error()}
		} else {
			payload = map[string]interface{}{"text": text}
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
