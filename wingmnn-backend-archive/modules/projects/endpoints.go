package projects

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/kashgohil/wingmnn/backend/server"
	"github.com/kashgohil/wingmnn/backend/types"
)

func Endpoints() {
	server.Server.Route("/projects", func(r chi.Router) {
		r.Get("/get/{id}", getProjectByID)
		r.Post("/get", getProjects)

		r.Put("/create", createProject)

		r.Patch("/update/{id}", updateProjectByID)
		r.Patch("/update", updateProjects)

		r.Delete("/delete/{id}", deleteProjectByID)
		r.Delete("/delete", deleteProjects)
	})
}

func getProjectByID(w http.ResponseWriter, r *http.Request) {
	foundProjects, err := getByID(r)

	if err != nil {
		log.Print("[PROJECTS] Error fetching project: ", err, http.StatusInternalServerError)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(types.Response{
		Data: foundProjects,
	})
}

func getProjects(w http.ResponseWriter, r *http.Request) {
	foundProjects, err := get(r)

	if err != nil {
		log.Print("[PROJECTS] Error fetching projects: ", err, http.StatusInternalServerError)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(types.Response{
		Data: foundProjects,
	})
}

func createProject(w http.ResponseWriter, r *http.Request) {
	createdProjects, err := create(r)

	if err != nil {
		log.Print("[PROJECTS] Error creating project: ", err, http.StatusInternalServerError)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(types.Response{
		Data: createdProjects,
	})
}

func updateProjectByID(w http.ResponseWriter, r *http.Request) {
	updatedProjects, err := updateByID(r)

	if err != nil {
		log.Print("[PROJECTS] Error updating project: ", err, http.StatusInternalServerError)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(types.Response{
		Data: updatedProjects,
	})
}

func updateProjects(w http.ResponseWriter, r *http.Request) {
	updatedProjects, err := update(r)

	if err != nil {
		log.Print("[PROJECTS] Error updating projects: ", err, http.StatusInternalServerError)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(types.Response{
		Data: updatedProjects,
	})
}

func deleteProjectByID(w http.ResponseWriter, r *http.Request) {
	deletedProjects, err := deleteByID(r)

	if err != nil {
		log.Print("[PROJECTS] Error deleting project: ", err, http.StatusInternalServerError)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(types.Response{
		Data: deletedProjects,
	})
}

func deleteProjects(w http.ResponseWriter, r *http.Request) {
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
