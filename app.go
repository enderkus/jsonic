package main

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}

// FormatJSON formats the given JSON string
func (a *App) FormatJSON(jsonStr string) (string, error) {
	var obj interface{}
	if err := json.Unmarshal([]byte(jsonStr), &obj); err != nil {
		return "", fmt.Errorf("invalid JSON: %v", err)
	}

	formatted, err := json.MarshalIndent(obj, "", "  ")
	if err != nil {
		return "", fmt.Errorf("formatting error: %v", err)
	}

	return string(formatted), nil
}

// MinifyJSON minifies the given JSON string
func (a *App) MinifyJSON(jsonStr string) (string, error) {
	var obj interface{}
	if err := json.Unmarshal([]byte(jsonStr), &obj); err != nil {
		return "", fmt.Errorf("invalid JSON: %v", err)
	}

	minified, err := json.Marshal(obj)
	if err != nil {
		return "", fmt.Errorf("minifying error: %v", err)
	}

	return string(minified), nil
}

// ValidateJSON validates the given JSON string
func (a *App) ValidateJSON(jsonStr string) bool {
	var obj interface{}
	return json.Unmarshal([]byte(jsonStr), &obj) == nil
}

// SaveJSONToFile saves JSON string to a file
func (a *App) SaveJSONToFile(jsonStr, filename string) error {
	// Create directory if it doesn't exist
	dir := filepath.Dir(filename)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return fmt.Errorf("failed to create directory: %v", err)
	}

	// Validate JSON before saving
	if !a.ValidateJSON(jsonStr) {
		return fmt.Errorf("invalid JSON format")
	}

	// Write to file
	return os.WriteFile(filename, []byte(jsonStr), 0644)
}

// LoadJSONFromFile loads JSON string from a file
func (a *App) LoadJSONFromFile(filename string) (string, error) {
	data, err := os.ReadFile(filename)
	if err != nil {
		return "", fmt.Errorf("failed to read file: %v", err)
	}

	// Validate loaded JSON
	if !a.ValidateJSON(string(data)) {
		return "", fmt.Errorf("file contains invalid JSON")
	}

	return string(data), nil
}
