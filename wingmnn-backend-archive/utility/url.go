package utility

import (
	"fmt"
	"os"
	"strings"
)

func UIUrl(path string) string {
	updatedPath := strings.TrimPrefix(path, "/")
	fmt.Printf("%s/%s", os.Getenv("UI_URL"), updatedPath)
	return fmt.Sprintf("%s/%s", os.Getenv("UI_URL"), updatedPath)
}
