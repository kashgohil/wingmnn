package auth

import (
	"github.com/go-chi/chi/v5"
	"github.com/kashgohil/wingmnn/backend/server"
)

func Endpoints() {
	server.Server.Route("/auth", func(r chi.Router) {
		r.Post("/login", login)
		r.Post("/signup", signup)
		r.Route("/sso", func(r chi.Router) {
			r.Post("/google", sso)
			r.Get("/google/callback", googleCallback)
		})
	})
}
