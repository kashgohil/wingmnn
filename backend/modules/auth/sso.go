package auth

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/kashgohil/wingmnn/backend/modules/user"
	"github.com/kashgohil/wingmnn/backend/server"
	"github.com/kashgohil/wingmnn/backend/utility"
	"github.com/kashgohil/wingmnn/backend/utility/query"
	"golang.org/x/oauth2"
)

var (
	authConfig *oauth2.Config
	states     = make(map[string]time.Time)
)

type SSORequest struct {
	ConnectionName string `json:"connectionName"`
}

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

	ctx := context.WithValue(r.Context(), server.UserID, "SYSTEM")
	r = r.WithContext(ctx)

	if !validateState(state) { // Implement state validation
		log.Println("[AUTH][CALLBACK][GOOGLE] invalid state in callback url", http.StatusBadRequest)
		http.Error(w, "something went wrong while logging you in", http.StatusBadRequest)
		return
	}

	token, err := authConfig.Exchange(r.Context(), code)
	if err != nil {
		log.Println("[AUTH][CALLBACK][GOOGLE] failed to exchange token", http.StatusInternalServerError)
		http.Error(w, "something went wrong while logging you in", http.StatusInternalServerError)
		return
	}

	// Get user info
	client := authConfig.Client(r.Context(), token)
	resp, err := client.Get("https://www.googleapis.com/oauth2/v2/userinfo")

	if err != nil {
		log.Println("[AUTH][CALLBACK][GOOGLE] could not fetch user info: ", err, http.StatusInternalServerError)
		http.Error(w, "Failed to get user info", http.StatusInternalServerError)
		return
	}

	defer resp.Body.Close()

	var userInfo map[string]interface{}

	if err := json.NewDecoder(resp.Body).Decode(&userInfo); err != nil {
		log.Println("[AUTH][CALLBACK][GOOGLE] could not decode user info: ", err, http.StatusInternalServerError)
		http.Error(w, "Failed to decode user info", http.StatusInternalServerError)
		return
	}

	users, err := user.Get(r.Context(), []query.Condition{query.NewCondition("email", []interface{}{userInfo["email"]}, query.Eq)})

	if err != nil {
		log.Println("[AUTH][CALLBACK][GOOGLE] could not get user: ", err, http.StatusInternalServerError)
		http.Error(w, "something went wrong while looging you in", http.StatusInternalServerError)
		return
	}

	if len(users) == 0 {
		actions := []query.Action{
			query.NewAction("name", userInfo["name"].(string), query.Set),
			query.NewAction("email", userInfo["email"].(string), query.Set),
			query.NewAction("username", userInfo["name"].(string), query.Set),
			query.NewAction("profilePicture", userInfo["picture"].(string), query.Set),
			query.NewAction("verifiedEmail", userInfo["verified_email"].(bool), query.Set),
		}

		users, err = user.Create(r.Context(), actions)
		if err != nil {
			log.Println("[AUTH][CALLBACK][GOOGLE] could not create user: ", err, http.StatusInternalServerError)
			http.Error(w, "something went wrong while looging you in", http.StatusInternalServerError)
			return
		}
	}

	usr := users[0]

	expiry := time.Now()

	// Generate JWT Access token
	jwtToken, err := GenerateAccessToken(AccessTokenClaims{
		UserID:    usr.ID,
		RoleID:    "ADMIN",
		Email:     usr.Email,
		Username:  usr.Username,
		UserAgent: r.UserAgent(),
	})

	if err != nil {
		log.Println("[AUTH][LOGIN] error while generating access token: ", err, http.StatusInternalServerError)
		http.Error(w, "something went wrong while logging you in", http.StatusInternalServerError)
		return
	}

	// Generate JWT Refresh token
	refreshToken, err := GenerateRefreshToken(usr.ID)

	if err != nil {
		log.Println("[AUTH][LOGIN] error while generating refresh token: ", err, http.StatusInternalServerError)
		http.Error(w, "something went wrong while logging you in", http.StatusInternalServerError)
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "auth_token",
		Value:    jwtToken,
		Expires:  expiry.Add(time.Hour),
		SameSite: http.SameSiteStrictMode,
		Path:     "/",
	})

	http.SetCookie(w, &http.Cookie{
		Name:     "refresh_token",
		Value:    refreshToken,
		Expires:  time.Now().Add(24 * 7 * time.Hour),
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteStrictMode,
		Path:     "/",
	})

	// Return user info
	http.Redirect(w, r, utility.UIUrl("/"), http.StatusPermanentRedirect)
	return
}

func googleSSO(w http.ResponseWriter, r *http.Request) {
	var Endpoint = oauth2.Endpoint{
		AuthURL:   "https://accounts.google.com/o/oauth2/auth",
		TokenURL:  "https://oauth2.googleapis.com/token",
		AuthStyle: oauth2.AuthStyleInParams,
	}

	authConfig = &oauth2.Config{
		Endpoint:     Endpoint,
		ClientID:     os.Getenv("GOOGLE_CLIENT_ID"),
		ClientSecret: os.Getenv("GOOGLE_CLIENT_SECRET"),
		RedirectURL:  os.Getenv("GOOGLE_REDIRECT_URL"),
		Scopes: []string{
			"https://www.googleapis.com/auth/userinfo.email",
			"https://www.googleapis.com/auth/userinfo.profile",
			"https://www.googleapis.com/auth/calendar", // Calendar access

			// Drive access
			// ref: https://www.googleapis.com/discovery/v1/apis/drive/v3/rest
			"https://www.googleapis.com/auth/drive",
			"https://www.googleapis.com/auth/drive.file",
			"https://www.googleapis.com/auth/drive.metadata",
			"https://www.googleapis.com/auth/drive.photos.readonly",

			// Gmail access
			// ref: https://gmail.googleapis.com/$discovery/rest?version=v1
			"https://mail.google.com/",
			"https://www.googleapis.com/auth/gmail.compose",
			"https://www.googleapis.com/auth/gmail.insert",
			"https://www.googleapis.com/auth/gmail.labels",
			"https://www.googleapis.com/auth/gmail.metadata",
			"https://www.googleapis.com/auth/gmail.modify",
			"https://www.googleapis.com/auth/gmail.readonly",
			"https://www.googleapis.com/auth/gmail.send",
			"https://www.googleapis.com/auth/gmail.settings.basic",
			"https://www.googleapis.com/auth/gmail.settings.sharing",

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

	url := authConfig.AuthCodeURL(state, oauth2.AccessTypeOffline)
	http.Redirect(w, r, url, http.StatusTemporaryRedirect)
	return
}

func githubCallback(w http.ResponseWriter, r *http.Request) {}

func githubSSO(w http.ResponseWriter, r *http.Request) {}

func sso(w http.ResponseWriter, r *http.Request) {
	r.ParseForm()

	switch r.Form.Get("connectionName") {
	case "google":
		googleSSO(w, r)
	case "github":
		githubSSO(w, r)
	}
}
