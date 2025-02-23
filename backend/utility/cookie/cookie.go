package cookie

import "net/http"

func RemoveCookie(w http.ResponseWriter, CookieName string) {
	http.SetCookie(w, &http.Cookie{
		Name:   CookieName,
		Value:  "",
		Path:   "/",
		MaxAge: -1,
	})
}
