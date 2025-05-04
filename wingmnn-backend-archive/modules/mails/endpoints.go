package mails

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/kashgohil/wingmnn/backend/server"
	"github.com/kashgohil/wingmnn/backend/types"
)

func Endpoints() {
	server.Server.Route("/mails", func(r chi.Router) {
		r.Get("/get/{id}", getMailByID)
		r.Post("/get", getMails)

		r.Put("/create", createMail)

		r.Patch("/update/{id}", updateMailByID)
		r.Patch("/update", updateMails)

		r.Delete("/delete/{id}", deleteMailByID)
		r.Delete("/delete", deleteMails)
	})
}

func getMailByID(w http.ResponseWriter, r *http.Request) {
	foundMails, err := getByID(r)

	if err != nil {
		log.Print("[MAILS] Error fetching mail: ", err, http.StatusInternalServerError)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(types.Response{
		Data: foundMails,
	})
}

func getMails(w http.ResponseWriter, r *http.Request) {
	foundMails, err := get(r)

	if err != nil {
		log.Print("[MAILS] Error fetching mails: ", err, http.StatusInternalServerError)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(types.Response{
		Data: foundMails,
	})
}

func createMail(w http.ResponseWriter, r *http.Request) {
	createdMails, err := create(r)

	if err != nil {
		log.Print("[MAILS] Error creating mail: ", err, http.StatusInternalServerError)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(types.Response{
		Data: createdMails,
	})
}

func updateMailByID(w http.ResponseWriter, r *http.Request) {
	updatedMails, err := updateByID(r)

	if err != nil {
		log.Print("[MAILS] Error updating mail: ", err, http.StatusInternalServerError)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(types.Response{
		Data: updatedMails,
	})
}

func updateMails(w http.ResponseWriter, r *http.Request) {
	updatedMails, err := update(r)

	if err != nil {
		log.Print("[MAILS] Error updating mails: ", err, http.StatusInternalServerError)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(types.Response{
		Data: updatedMails,
	})
}

func deleteMailByID(w http.ResponseWriter, r *http.Request) {
	deletedMails, err := deleteByID(r)

	if err != nil {
		log.Print("[MAILS] Error deleting mail: ", err, http.StatusInternalServerError)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(types.Response{
		Data: deletedMails,
	})
}

func deleteMails(w http.ResponseWriter, r *http.Request) {
	deletedProjects, err := delete(r)

	if err != nil {
		log.Print("[PROJECTS] Error deleting projects: ", err, http.StatusInternalServerError)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(types.Response{
		Data: deletedProjects,
	})
}
