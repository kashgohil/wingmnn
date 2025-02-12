package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
	"github.com/kashgohil/wingmnn/backend/modules/auth"
	"github.com/kashgohil/wingmnn/backend/server"
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

	server.Server = chi.NewRouter()

	server.Server.Use(middleware.RequestID)
	server.Server.Use(middleware.Recoverer)
	server.Server.Use(middleware.URLFormat)
	server.Server.Use(middleware.Timeout(60 * time.Second))

	server.Server.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"https://*", "http://*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	auth.Auth()

	log.Println("server running on port: ", os.Getenv("PORT"))
	http.ListenAndServe(":"+os.Getenv("PORT"), server.Server)
}
