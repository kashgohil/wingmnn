package logger

import (
	"log/slog"
	"net/http"
	"os"
	"time"
)

var logger *slog.Logger

type ResponseWriter struct {
	http.ResponseWriter
	status      int
	byesWritten []byte
}

func (w *ResponseWriter) Status() int {
	if w.status == 0 {
		return http.StatusOK
	}
	return w.status
}

func (ww *ResponseWriter) Write(p []byte) (int, error) {
	n, err := ww.ResponseWriter.Write(p)
	ww.byesWritten = append(ww.byesWritten, p...)
	return n, err
}

func (ww *ResponseWriter) BytesWritten() []byte {
	return ww.byesWritten
}

func RequestLogger(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()

		ww := &ResponseWriter{ResponseWriter: w}

		next.ServeHTTP(ww, r)

		logger.Info("Request Completed",
			"method", r.Method,
			"path", r.URL.Path,
			"time", time.Since(start),
			"status", ww.Status(),
			"duration", time.Since(start),
			"bytesWritten", ww.BytesWritten(),
		)
	})
}

func Setup() {
	logHandler := slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level:     slog.LevelInfo,
		AddSource: true,
	})

	logger = slog.New(logHandler)

	slog.SetDefault(logger)
}
