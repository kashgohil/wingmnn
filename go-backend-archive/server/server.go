package server

import (
	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

var Server *chi.Mux

var DBPool *pgxpool.Pool

const UserID = "user_id"
