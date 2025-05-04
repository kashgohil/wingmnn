package projects

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5"
	"github.com/kashgohil/wingmnn/backend/server"
	"github.com/kashgohil/wingmnn/backend/tables"
	"github.com/kashgohil/wingmnn/backend/utility/crud"
	"github.com/kashgohil/wingmnn/backend/utility/query"
)

var projectsCRUD = crud.NewCRUD[Project](tables.PROJECTS)

func Get(ctx context.Context, conditions []query.Condition) ([]Project, error) {
	return projectsCRUD.Get(ctx, conditions)
}

func Create(ctx context.Context, actions []query.Action) ([]Project, error) {
	return projectsCRUD.Create(ctx, actions)
}

func Update(ctx context.Context, conditions []query.Condition, actions []query.Action) ([]Project, error) {
	return projectsCRUD.Update(ctx, conditions, actions)
}

func Delete(ctx context.Context, conditions []query.Condition) ([]Project, error) {
	return projectsCRUD.Delete(ctx, conditions)
}

func getByID(r *http.Request) ([]Project, error) {
	id := chi.URLParam(r, "id")

	if id == "" {
		log.Println("[PROJECTS][GET] id is required")
		return nil, fmt.Errorf("id is required")
	}

	return Get(r.Context(), []query.Condition{
		query.NewCondition("id", []interface{}{id}, query.Eq),
	})
}

func updateByID(r *http.Request) ([]Project, error) {
	id := chi.URLParam(r, "id")

	if id == "" {
		log.Println("[PROJECTS][UPDATE] id is required")
		return nil, fmt.Errorf("id is required")
	}

	q := query.NewQuery[Project](tables.PROJECTS, query.Update)
	if err := json.NewDecoder(r.Body).Decode(&q); err != nil {
		log.Println("[PROJECTS][UPDATE] cannot decode json into query", err)
		return nil, err
	}

	q.AddCondition(query.NewCondition("id", []interface{}{id}, query.Eq))

	sql, values := q.Build(r.Context())

	rows, err := server.DBPool.Query(r.Context(), sql, values...)

	updatedProjects, err := pgx.CollectRows(rows, pgx.RowToStructByName[Project])

	if err != nil {
		return nil, err
	}

	return updatedProjects, err
}

func deleteByID(r *http.Request) ([]Project, error) {
	id := chi.URLParam(r, "id")

	if id == "" {
		log.Println("[PROJECTS][DELETE] id is required")
		return nil, fmt.Errorf("id is required")
	}

	return Delete(r.Context(), []query.Condition{
		query.NewCondition("id", []interface{}{id}, query.Eq),
	})
}

func get(r *http.Request) ([]Project, error) {
	q := query.NewQuery[Project](tables.PROJECTS, query.Select)

	if err := json.NewDecoder(r.Body).Decode(&q); err != nil {
		log.Print("[PROJECTS][GET] cannot decode json into query", err)
		return nil, err
	}

	sql, values := q.Build(r.Context())

	rows, err := server.DBPool.Query(r.Context(), sql, values...)

	projects, err := pgx.CollectRows(rows, pgx.RowToStructByName[Project])

	if err != nil {
		return nil, err
	}

	return projects, nil
}

func create(r *http.Request) ([]Project, error) {
	q := query.NewQuery[Project](tables.PROJECTS, query.Insert)

	if err := json.NewDecoder(r.Body).Decode(&q); err != nil {
		log.Print("[PROJECTS][CREATE] cannot decode json into query", err)
		return nil, err
	}

	sql, values := q.Build(r.Context())

	rows, err := server.DBPool.Query(r.Context(), sql, values...)

	projects, err := pgx.CollectRows(rows, pgx.RowToStructByName[Project])

	if err != nil {
		return nil, err
	}

	return projects, nil
}

func update(r *http.Request) ([]Project, error) {
	q := query.NewQuery[Project](tables.PROJECTS, query.Update)

	if err := json.NewDecoder(r.Body).Decode(&q); err != nil {
		log.Print("[PROJECTS][UPDATE] cannot decode json into query", err)
		return nil, err
	}

	sql, values := q.Build(r.Context())

	rows, err := server.DBPool.Query(r.Context(), sql, values...)

	projects, err := pgx.CollectRows(rows, pgx.RowToStructByName[Project])

	if err != nil {
		return nil, err
	}

	return projects, nil
}

func delete(r *http.Request) ([]Project, error) {
	q := query.NewQuery[Project](tables.PROJECTS, query.Delete)

	if err := json.NewDecoder(r.Body).Decode(&q); err != nil {
		log.Print("[PROJECTS][DELETE] cannot decode json into query", err)
		return nil, err
	}

	sql, values := q.Build(r.Context())

	rows, err := server.DBPool.Query(r.Context(), sql, values...)

	projects, err := pgx.CollectRows(rows, pgx.RowToStructByName[Project])

	if err != nil {
		return nil, err
	}

	return projects, nil
}
