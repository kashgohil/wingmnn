package user

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/kashgohil/wingmnn/backend/server"
	"github.com/kashgohil/wingmnn/backend/types"
)

func Endpoints() {
	server.Server.Route("/user", func(r chi.Router) {
		r.Get("/get/{id}", getUserByID)
		r.Post("/get", getUsers)

		r.Put("/create", createUser)

		r.Patch("/update/{id}", updateUserByID)
		r.Patch("/update", updateUsers)

		r.Delete("/delete/{id}", deleteUserByID)
		r.Delete("/delete", deleteUsers)
	})
}

func getUserByID(w http.ResponseWriter, r *http.Request) {
	dbUser, err := getByID(r)
	if err != nil {
		log.Println("[USER] error fetching user: ", err, http.StatusInternalServerError)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(types.Response{Data: &dbUser})
}

func getUsers(w http.ResponseWriter, r *http.Request) {
	users, err := get(r)
	if err != nil {
		log.Println("[USER] error fetching user: ", err, http.StatusInternalServerError)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(types.Response{Data: &users})
}

func createUser(w http.ResponseWriter, r *http.Request) {
	createdUsers, err := create(r)
	if err != nil {
		log.Println("[USER] error creating user: ", err, http.StatusInternalServerError)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(types.Response{Data: &createdUsers})
}

func updateUserByID(w http.ResponseWriter, r *http.Request) {
	updatedUsers, err := updateByID(r)
	if err != nil {
		log.Println("[USER] error updating user: ", err, http.StatusInternalServerError)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(types.Response{Data: &updatedUsers})
}

func updateUsers(w http.ResponseWriter, r *http.Request) {
	updatedUsers, err := update(r)
	if err != nil {
		log.Println("[USER] error updating user: ", err, http.StatusInternalServerError)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(types.Response{Data: &updatedUsers})
}

func deleteUserByID(w http.ResponseWriter, r *http.Request) {
	deletedUsers, err := deleteByID(r)
	if err != nil {
		log.Println("[USER] error deleting user: ", err, http.StatusInternalServerError)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(types.Response{Data: &deletedUsers})
}

func deleteUsers(w http.ResponseWriter, r *http.Request) {
	deletedUsers, err := delete(r)
	if err != nil {
		log.Println("[USER] error deleting user: ", err, http.StatusInternalServerError)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(types.Response{Data: &deletedUsers})
}
