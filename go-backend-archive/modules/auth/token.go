package auth

import (
	"os"
	"time"

	"github.com/golang-jwt/jwt"
)

type AccessTokenClaims struct {
	UserID    string `json:"userId"`
	SessionID string `json:"sessionId"`
	ExpiresAt int64  `json:"expiresAt"`
	Username  string `json:"username"`
	Email     string `json:"email"`
	RoleID    string `json:"roleId"`
	UserAgent string `json:"userAgent"`
}

type RefreshTokenClaims struct {
	UserID    int   `json:"userId"`
	ExpiresAt int64 `json:"expiresAt"`
}

func GenerateAccessToken(claims AccessTokenClaims) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"userId":    claims.UserID,
		"sessionId": claims.SessionID,
		"username":  claims.Username,
		"email":     claims.Email,
		"roleId":    claims.RoleID,
		"userAgent": claims.UserAgent,
		"expiresAt": time.Now().Add(time.Hour).UnixMilli(),
	})

	return token.SignedString([]byte(os.Getenv("JWT_SECRET")))
}

func GenerateRefreshToken(userID string) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"userId":    userID,
		"expiresAt": time.Now().Add(time.Hour * 24 * 7).UnixMilli(),
	})

	return token.SignedString([]byte(os.Getenv("JWT_SECRET")))
}
