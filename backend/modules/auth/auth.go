package auth

import (
	"context"
	"crypto/rand"
	"database/sql"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/golang-jwt/jwt"
	"github.com/jackc/pgx/v5"
	"github.com/kashgohil/wingmnn/backend/modules/user"
	"github.com/kashgohil/wingmnn/backend/server"
	"github.com/kashgohil/wingmnn/backend/utility"
	"golang.org/x/crypto/bcrypt"
	"golang.org/x/oauth2"
)

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type SSORequest struct {
	ConnectionName string `json:"connectionName"`
}

type OAuthHandler struct {
	config *oauth2.Config
}

func login(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Println("[AUTH][LOGIN] invalid request")
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	userQuery := user.User{
		Username: req.Username,
	}

	query, args := utility.BuildGetQuery("users", userQuery)

	// Get user from database
	rows, err := server.DBPool.Query(context.Background(), query, args...)

	if err == sql.ErrNoRows {
		log.Println("[AUTH][LOGIN] no user found for username: ", req.Username)
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		return
	} else if err != nil {
		log.Println("[AUTH][LOGIN] something went wrong: ", err)
		http.Error(w, "Server error", http.StatusInternalServerError)
		return
	}

	user, err := pgx.CollectOneRow(rows, pgx.RowToStructByName[user.User])

	if err != nil {
		log.Println("[AUTH][LOGIN] something went wrong: ", err)
		http.Error(w, "Server error", http.StatusInternalServerError)
		return
	}

	// Check password
	if err := bcrypt.CompareHashAndPassword([]byte(user.HashedPassword), []byte(req.Password)); err != nil {
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	expiry := time.Now()

	// Generate JWT token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id":  user.ID,
		"username": user.Username,
		"expiry":   expiry.UnixMilli(),
	})

	tokenString, err := token.SignedString(os.Getenv("JWT_SECRET"))

	if err != nil {
		http.Error(w, "Server error", http.StatusInternalServerError)
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "auth-token",
		Value:    tokenString,
		Expires:  expiry,
		HttpOnly: true,
	})
}

var (
	googleAuth *oauth2.Config
	states     = make(map[string]time.Time)
)

func generateState() (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	state := base64.URLEncoding.EncodeToString(b)
	states[state] = time.Now().Add(15 * time.Minute) // State expires in 15 minutes
	return state, nil
}

func validateState(state string) bool {
	expiry, exists := states[state]
	if !exists {
		return false
	}
	if time.Now().After(expiry) {
		delete(states, state)
		return false
	}
	delete(states, state) // Use state only once
	return true
}

func googleCallback(w http.ResponseWriter, r *http.Request) {
	code := r.URL.Query().Get("code")
	state := r.URL.Query().Get("state")

	if !validateState(state) { // Implement state validation
		http.Error(w, "Invalid state", http.StatusBadRequest)
		return
	}

	token, err := googleAuth.Exchange(r.Context(), code)
	if err != nil {
		http.Error(w, "Failed to exchange token", http.StatusInternalServerError)
		return
	}

	// Get user info
	client := googleAuth.Client(r.Context(), token)
	resp, err := client.Get("https://www.googleapis.com/oauth2/v2/userinfo")
	if err != nil {
		log.Println("[AUTH][CALLBACK][GOOGLE] could not fetch user info: ", err)
		http.Error(w, "Failed to get user info", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	var userInfo map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&userInfo); err != nil {
		log.Println("[AUTH][CALLBACK][GOOGLE] could not decode user info: ", err)
		http.Error(w, "Failed to decode user info", http.StatusInternalServerError)
		return
	}

	fmt.Println(userInfo)

	// Return user info
	http.Redirect(w, r, utility.UIUrl("/"), http.StatusPermanentRedirect)
}

func googleSSO(w http.ResponseWriter, r *http.Request) {
	var Endpoint = oauth2.Endpoint{
		AuthURL:   "https://accounts.google.com/o/oauth2/auth",
		TokenURL:  "https://oauth2.googleapis.com/token",
		AuthStyle: oauth2.AuthStyleInParams,
	}

	googleAuth = &oauth2.Config{
		Endpoint:     Endpoint,
		ClientID:     os.Getenv("GOOGLE_CLIENT_ID"),
		ClientSecret: os.Getenv("GOOGLE_CLIENT_SECRET"),
		RedirectURL:  os.Getenv("GOOGLE_REDIRECT_URL"),
		Scopes: []string{
			"https://www.googleapis.com/auth/userinfo.email",
			"https://www.googleapis.com/auth/userinfo.profile",
			"https://www.googleapis.com/auth/calendar",   // Calendar access
			"https://www.googleapis.com/auth/drive",      // Drive access
			"https://www.googleapis.com/auth/gmail.send", // Gmail send
			"openid",  // OpenID Connect
			"profile", // Basic profile
			"email",
		},
	}

	state, err := generateState()

	if err != nil {
		log.Println("[AUTH][SSO][GOOGLE] could not generate state: ", err)
		http.Error(w, "Server error", http.StatusInternalServerError)
		return
	}

	url := googleAuth.AuthCodeURL(state, oauth2.AccessTypeOffline)
	http.Redirect(w, r, url, http.StatusTemporaryRedirect)
	return
}

func githubCallback(w http.ResponseWriter, r *http.Request) {}

func githubSSO(w http.ResponseWriter, r *http.Request) {}

func sso(w http.ResponseWriter, r *http.Request) {
	r.ParseForm()

	log.Println("Form Value: ", r.Form)

	switch r.Form.Get("connectionName") {
	case "google":
		googleSSO(w, r)
	case "github":
		githubSSO(w, r)
	}
}

func Auth() {
	server.Server.Route("/auth", func(r chi.Router) {
		r.Post("/login", login)
		r.Route("/sso", func(r chi.Router) {
			r.Post("/google", sso)
			r.Get("/google/callback", googleCallback)
		})
	})
}
