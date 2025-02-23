package auth

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/kashgohil/wingmnn/backend/modules/user"
	"github.com/kashgohil/wingmnn/backend/utility"
	"github.com/kashgohil/wingmnn/backend/utility/query"
	"golang.org/x/crypto/bcrypt"
)

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type SignupRequest struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

func login(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Println("[AUTH][LOGIN] invalid request")
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Get user from database
	users, err := user.Get(r.Context(), []query.Condition{
		query.NewCondition("username", []interface{}{req.Username}, query.Eq),
	})

	if err == pgx.ErrNoRows {
		log.Println("[AUTH][LOGIN] no user found for username: ", req.Username)
		http.Error(w, "no user found. please make sure you have registered", http.StatusUnauthorized)
		return
	} else if err != nil {
		log.Println("[AUTH][LOGIN] something went wrong: ", err)
		http.Error(w, "Server error", http.StatusInternalServerError)
		return
	}

	user := users[0]

	// Check password
	if err := bcrypt.CompareHashAndPassword([]byte(user.HashedPassword), []byte(req.Password)); err != nil {
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	expiry := time.Now()

	// Generate JWT Access token
	token, err := GenerateAccessToken(AccessTokenClaims{
		UserID:    user.ID,
		Email:     user.Email,
		RoleID:    "ADMIN",
		Username:  user.Username,
		UserAgent: r.UserAgent(),
	})

	if err != nil {
		log.Println("[AUTH][LOGIN] error while generating access token: ", err, http.StatusInternalServerError)
		http.Error(w, "something went wrong while logging you in", http.StatusInternalServerError)
		return
	}

	// Generate JWT Refresh token
	refreshToken, err := GenerateRefreshToken(user.ID)

	if err != nil {
		log.Println("[AUTH][LOGIN] error while generating refresh token: ", err, http.StatusInternalServerError)
		http.Error(w, "something went wrong while logging you in", http.StatusInternalServerError)
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "auth-token",
		Value:    token,
		Expires:  expiry.Add(time.Hour),
		SameSite: http.SameSiteStrictMode,
		Path:     "/",
	})

	http.SetCookie(w, &http.Cookie{
		Name:     "refresh-token",
		Value:    refreshToken,
		Expires:  time.Now().Add(24 * 7 * time.Hour),
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteStrictMode,
		Path:     "/",
	})

	http.Redirect(w, r, "/", http.StatusSeeOther)
}

func signup(w http.ResponseWriter, r *http.Request) {
	var req SignupRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)

	if err != nil {
		log.Println("[AUTH][SIGNUP] cannot generate hashed password: ", err, http.StatusInternalServerError)
		http.Error(w, "something went wrong in signup process", http.StatusInternalServerError)
		return
	}

	users, err := user.Create(r.Context(), []query.Action{
		query.NewAction("username", req.Username, query.Set),
		query.NewAction("email", req.Email, query.Set),
		query.NewAction("password", hashedPassword, query.Set),
	})

	if err != nil {
		log.Println("[AUTH][SIGNUP] cannot create user: ", err, http.StatusInternalServerError)
		http.Error(w, "something went wrong in signup process", http.StatusInternalServerError)
		return
	}

	user := users[0]

	expiry := time.Now()

	// Generate JWT Access token
	token, err := GenerateAccessToken(AccessTokenClaims{
		UserID:    user.ID,
		Email:     user.Email,
		RoleID:    "ADMIN",
		Username:  user.Username,
		UserAgent: r.UserAgent(),
	})

	if err != nil {
		log.Println("[AUTH][LOGIN] error while generating access token: ", err, http.StatusInternalServerError)
		http.Error(w, "something went wrong while logging you in", http.StatusInternalServerError)
		return
	}

	// Generate JWT Refresh token
	refreshToken, err := GenerateRefreshToken(user.ID)

	if err != nil {
		log.Println("[AUTH][LOGIN] error while generating refresh token: ", err, http.StatusInternalServerError)
		http.Error(w, "something went wrong while logging you in", http.StatusInternalServerError)
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "auth-token",
		Value:    token,
		Expires:  expiry.Add(time.Hour),
		SameSite: http.SameSiteStrictMode,
		Path:     "/",
	})

	http.SetCookie(w, &http.Cookie{
		Name:     "refresh-token",
		Value:    refreshToken,
		Expires:  time.Now().Add(24 * 7 * time.Hour),
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteStrictMode,
		Path:     "/",
	})

	http.Redirect(w, r, utility.UIUrl("/onboarding"), http.StatusSeeOther)
	return
}
