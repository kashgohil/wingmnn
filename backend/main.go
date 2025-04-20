package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
	"github.com/kashgohil/wingmnn/backend/modules/auth"
	"github.com/kashgohil/wingmnn/backend/server"
	"github.com/kashgohil/wingmnn/backend/utility/cookie"
	"github.com/kashgohil/wingmnn/backend/utility/logger"
)

func main() {

	// load environment variables
	err := godotenv.Load()
	if err != nil {
		fmt.Printf("Error loading .env file: %v\n", err)
		os.Exit(1)
	}

	// connect to db
	server.DBPool, err = pgxpool.New(context.Background(), os.Getenv("DB_URL"))

	if err != nil {
		fmt.Fprintf(os.Stderr, "Unable to connect to database: %v\n", err)
		os.Exit(1)
	}

	// defer connection closure
	defer server.DBPool.Close()

	// logs
	logger.Setup()

	// router
	server.Server = chi.NewRouter()

	server.Server.Use(middleware.RequestID)
	server.Server.Use(middleware.Recoverer)
	server.Server.Use(middleware.URLFormat)
	server.Server.Use(logger.RequestLogger)
	server.Server.Use(middleware.Timeout(60 * time.Second))

	// middleware to check csrf token
	server.Server.Use(func(next http.Handler) http.Handler {
		fn := func(w http.ResponseWriter, r *http.Request) {
			if strings.Contains(r.URL.Path, "/auth/") {
				next.ServeHTTP(w, r)
				return
			}

			CSRFToken := r.Header.Get("X-CSRF-Token")
			CSRFCookie, err := r.Cookie("csrf_token")

			if err != nil {
				log.Println("[CSRF] cannot extract csrf cookie from request", err)
				cookie.RemoveCookie(w, "csrf_token")
				cookie.RemoveCookie(w, "auth_token")
				http.Error(w, "unauthorized access. redirecting you to login page", http.StatusUnauthorized)
				return
			}

			if CSRFToken == "" {
				log.Println("[CSRF] no csrf token found in request header")
				cookie.RemoveCookie(w, "csrf_token")
				cookie.RemoveCookie(w, "auth_token")
				http.Error(w, "unauthorized access. redirecting you to login page", http.StatusUnauthorized)
				return
			}

			if CSRFCookie.Value == "" {
				log.Println("[CSRF] no csrf cookie found in request")
				cookie.RemoveCookie(w, "csrf_token")
				cookie.RemoveCookie(w, "auth_token")
				http.Error(w, "unauthorized access. redirecting you to login page", http.StatusUnauthorized)
				return
			}

			if CSRFCookie.Value != CSRFToken {
				log.Println("[CSRF] mismatching csrf token")
				cookie.RemoveCookie(w, "csrf_token")
				cookie.RemoveCookie(w, "auth_token")
				http.Error(w, "unauthorized access. redirecting you to login page", http.StatusUnauthorized)
				return
			}

			next.ServeHTTP(w, r)
		}
		return http.HandlerFunc(fn)
	})

	server.Server.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"https://*", "http://*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	auth.Endpoints()

	log.Println("server running on port: ", os.Getenv("PORT"))
	http.ListenAndServe(":"+os.Getenv("PORT"), server.Server)
}
