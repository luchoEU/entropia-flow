package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"sync"
	"syscall"
	"unsafe"
)

const (
	appName        = "EntropiaFlowClient"
	configFilename = "config.json"
)

// AppConfig defines the structure of our entire application's configuration.
type AppConfig struct {
	WebSocketPort  int    `json:"webSocketPort"`
	LogWatcherPath string `json:"logWatcherPath"`
}

// ConfigService manages loading, saving, and accessing the AppConfig.
type ConfigService struct {
	mutex      sync.RWMutex
	config     AppConfig
	configPath string
}

// NewConfigService creates and initializes the configuration service.
func NewConfigService() (*ConfigService, error) {
	configDir, err := os.UserConfigDir()
	if err != nil {
		return nil, err
	}
	appConfigDir := filepath.Join(configDir, appName)
	configPath := filepath.Join(appConfigDir, configFilename)

	cs := &ConfigService{
		configPath: configPath,
	}

	if err := cs.Load(); err != nil {
		return nil, err
	}

	return cs, nil
}

// Load reads the config from disk or creates a default if it doesn't exist.
func (cs *ConfigService) Load() error {
	// Acquire a full write lock because we might need to create the file.
	cs.mutex.Lock()
	defer cs.mutex.Unlock()

	data, err := os.ReadFile(cs.configPath)
	if err != nil {
		if os.IsNotExist(err) {
			log.Println("[config] Config file not found. Creating a default one.")
			// Call the internal/unlocked version of createDefaultConfig
			return cs.createDefaultConfigInternal()
		}
		return err // Other read error
	}

	log.Printf("[config] Reading config file: %s", cs.configPath)
	return json.Unmarshal(data, &cs.config)
}

// Save is the public method for saving. It handles locking.
func (cs *ConfigService) Save() error {
	cs.mutex.Lock() // Use a full Write Lock as we are writing state to disk.
	defer cs.mutex.Unlock()
	return cs.saveInternal()
}

// saveInternal performs the save action assuming a lock is already held.
func (cs *ConfigService) saveInternal() error {
	data, err := json.MarshalIndent(cs.config, "", "  ")
	if err != nil {
		return err
	}
	if err := os.MkdirAll(filepath.Dir(cs.configPath), 0755); err != nil {
		return err
	}
	log.Printf("[config] Saving config file: %s", cs.configPath)
	return os.WriteFile(cs.configPath, data, 0644)
}

var (
	modShell32           = syscall.NewLazyDLL("shell32.dll")
	procSHGetFolderPathW = modShell32.NewProc("SHGetFolderPathW")
)

const (
	CSIDL_PERSONAL = 0x0005 // My Documents
	S_OK           = 0
)

func getMyDocumentsFolder() (string, error) {
	var path [syscall.MAX_PATH]uint16
	// HWND=0, hToken=0, dwFlags=0
	ret, _, _ := procSHGetFolderPathW.Call(
		0,
		uintptr(CSIDL_PERSONAL),
		0,
		0,
		uintptr(unsafe.Pointer(&path[0])),
	)

	if ret != S_OK {
		return "", fmt.Errorf("SHGetFolderPathW failed with code %d", ret)
	}

	return syscall.UTF16ToString(path[:]), nil
}

// It assumes a lock is already held by the caller (Load).
func (cs *ConfigService) createDefaultConfigInternal() error {
	documentsPath, err := getMyDocumentsFolder()
	if err != nil {
		fmt.Println("Error getting My Documents folder:", err)
		return err
	}

	defaultLogPath := filepath.Join(documentsPath, "Entropia Universe", "chat.log")

	cs.config = AppConfig{
		WebSocketPort:  6522,
		LogWatcherPath: defaultLogPath,
	}

	// Call the internal, unlocked save method.
	return cs.saveInternal()
}

// Get remains the same, correctly using a Read Lock.
func (cs *ConfigService) Get() AppConfig {
	cs.mutex.RLock()
	defer cs.mutex.RUnlock()
	return cs.config
}

func (cs *ConfigService) SetLogWatcherPath(path string) error {
	cs.mutex.Lock()
	defer cs.mutex.Unlock() // Use defer for safety

	cs.config.LogWatcherPath = path

	// Call the internal, unlocked save method.
	return cs.saveInternal()
}
