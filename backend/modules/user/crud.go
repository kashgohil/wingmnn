package user

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

var userCRUD = crud.NewCRUD[User](tables.USERS)

func Get(context context.Context, conditions []query.Condition) ([]User, error) {
	return userCRUD.Get(context, conditions)
}

func Create(context context.Context, actions []query.Action) ([]User, error) {
	return userCRUD.Create(context, actions)
}

func Update(context context.Context, conditions []query.Condition, actions []query.Action) ([]User, error) {
	return userCRUD.Update(context, conditions, actions)
}

func Delete(context context.Context, conditions []query.Condition) ([]User, error) {
	return userCRUD.Delete(context, conditions)
}

func getByID(r *http.Request) ([]User, error) {
	id := chi.URLParam(r, "id")

	if id == "" {
		log.Println("[USERS][GET] id is required")
		return nil, fmt.Errorf("id is required")
	}

	return Get(r.Context(), []query.Condition{
		query.NewCondition("id", []interface{}{id}, query.Eq),
	})
}

func updateByID(r *http.Request) ([]User, error) {
	id := chi.URLParam(r, "id")

	if id == "" {
		log.Println("[USERS][UPDATE] id is required")
		return nil, fmt.Errorf("id is required")
	}

	q := query.NewQuery[User](tables.USERS, query.Update)
	if err := json.NewDecoder(r.Body).Decode(&q); err != nil {
		log.Println("[USERS][GET] cannot decode json into query", err)
		return nil, err
	}

	q.AddCondition(query.NewCondition("id", []interface{}{id}, query.Eq))

	sql, values := q.Build()

	rows, err := server.DBPool.Query(context.Background(), sql, values...)

	updatedUsers, err := pgx.CollectRows(rows, pgx.RowToStructByName[User])

	if err != nil {
		return nil, err
	}

	return updatedUsers, err
}

func deleteByID(r *http.Request) ([]User, error) {
	id := chi.URLParam(r, "id")

	if id == "" {
		log.Println("[USERS][DELETE] id is required")
		return nil, fmt.Errorf("id is required")
	}

	return Delete(r.Context(), []query.Condition{
		query.NewCondition("id", []interface{}{id}, query.Eq),
	})
}

func get(r *http.Request) ([]User, error) {
	q := query.NewQuery[User](tables.USERS, query.Select)

	if err := json.NewDecoder(r.Body).Decode(&q); err != nil {
		log.Println("[USERS][GET] cannot decode json into query", err)
		return nil, err
	}

	sql, values := q.Build()

	rows, err := server.DBPool.Query(context.Background(), sql, values...)

	foundUsers, err := pgx.CollectRows(rows, pgx.RowToStructByName[User])

	if err != nil {
		return nil, err
	}

	return foundUsers, err
}

func create(r *http.Request) ([]User, error) {
	q := query.NewQuery[User](tables.USERS, query.Insert)

	if err := json.NewDecoder(r.Body).Decode(&q); err != nil {
		log.Println("[USERS][CREATE] cannot decode json into query", err)
		return nil, err
	}

	sql, values := q.Build()

	rows, err := server.DBPool.Query(context.Background(), sql, values...)

	createdUsers, err := pgx.CollectRows(rows, pgx.RowToStructByName[User])

	if err != nil {
		return nil, err
	}

	return createdUsers, err
}

func update(r *http.Request) ([]User, error) {
	q := query.NewQuery[User](tables.USERS, query.Update)

	if err := json.NewDecoder(r.Body).Decode(&q); err != nil {
		log.Println("[USERS][UPDATE] cannot decode json into query", err)
		return nil, err
	}

	sql, values := q.Build()

	rows, err := server.DBPool.Query(context.Background(), sql, values...)

	updatedUsers, err := pgx.CollectRows(rows, pgx.RowToStructByName[User])

	if err != nil {
		return nil, err
	}

	return updatedUsers, err
}

func delete(r *http.Request) ([]User, error) {
	q := query.NewQuery[User](tables.USERS, query.Delete)

	if err := json.NewDecoder(r.Body).Decode(&q); err != nil {
		log.Println("[USERS][DELETE] cannot decode json into query", err)
		return nil, err
	}

	sql, values := q.Build()

	rows, err := server.DBPool.Query(context.Background(), sql, values...)

	deletedUsers, err := pgx.CollectRows(rows, pgx.RowToStructByName[User])

	if err != nil {
		return nil, err
	}

	return deletedUsers, err
}
