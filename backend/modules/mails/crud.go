package mails

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/jackc/pgx/v5"
	"github.com/kashgohil/wingmnn/backend/server"
	"github.com/kashgohil/wingmnn/backend/tables"
	"github.com/kashgohil/wingmnn/backend/utility/crud"
	"github.com/kashgohil/wingmnn/backend/utility/query"
)

var mailCRUD = crud.NewCRUD[Mail](tables.MAILS)

func Get(context context.Context, conditions []query.Condition) ([]Mail, error) {
	return mailCRUD.Get(context, conditions)
}

func Create(context context.Context, actions []query.Action) ([]Mail, error) {
	return mailCRUD.Create(context, actions)
}

func Update(context context.Context, conditions []query.Condition, actions []query.Action) ([]Mail, error) {
	return mailCRUD.Update(context, conditions, actions)
}

func Delete(context context.Context, conditions []query.Condition) ([]Mail, error) {
	return mailCRUD.Delete(context, conditions)
}

func getByID(r *http.Request) ([]Mail, error) {
	id := r.URL.Query().Get("id")

	if id == "" {
		log.Println("id is required")
		return nil, fmt.Errorf("id is required")
	}

	return Get(context.Background(), []query.Condition{query.NewCondition("id", []interface{}{id}, query.Eq)})
}

func updateByID(r *http.Request) ([]Mail, error) {
	id := r.URL.Query().Get("id")

	if id == "" {
		log.Println("id is required")
		return nil, fmt.Errorf("id is required")
	}

	q := query.NewQuery[Mail](tables.MAILS, query.Update)

	if err := json.NewDecoder(r.Body).Decode(&q); err != nil {
		log.Println("[MAILS][UPDATE] cannot decode json into query", err)
		return nil, err
	}

	q.AddCondition(query.NewCondition("id", []interface{}{id}, query.Eq))

	sql, values := q.Build()

	rows, err := server.DBPool.Query(context.Background(), sql, values...)

	updatedMails, err := pgx.CollectRows(rows, pgx.RowToStructByName[Mail])

	if err != nil {
		return nil, err
	}

	return updatedMails, err
}

func deleteByID(r *http.Request) ([]Mail, error) {
	id := r.URL.Query().Get("id")

	if id == "" {
		log.Println("id is required")
		return nil, fmt.Errorf("id is required")
	}

	return Delete(context.Background(), []query.Condition{query.NewCondition("id", []interface{}{id}, query.Eq)})
}

func get(r *http.Request) ([]Mail, error) {
	q := query.NewQuery[Mail](tables.MAILS, query.Select)

	if err := json.NewDecoder(r.Body).Decode(&q); err != nil {
		log.Println("[MAILS][GET] cannot decode json into query", err)
		return nil, err
	}

	sql, values := q.Build()

	rows, err := server.DBPool.Query(context.Background(), sql, values...)

	mails, err := pgx.CollectRows(rows, pgx.RowToStructByName[Mail])

	if err != nil {
		return nil, err
	}

	return mails, err
}

func update(r *http.Request) ([]Mail, error) {
	q := query.NewQuery[Mail](tables.MAILS, query.Update)

	if err := json.NewDecoder(r.Body).Decode(&q); err != nil {
		log.Println("[MAILS][UPDATE] cannot decode json into query", err)
		return nil, err
	}

	sql, values := q.Build()

	rows, err := server.DBPool.Query(context.Background(), sql, values...)

	mails, err := pgx.CollectRows(rows, pgx.RowToStructByName[Mail])

	if err != nil {
		return nil, err
	}

	return mails, err
}

func create(r *http.Request) ([]Mail, error) {
	q := query.NewQuery[Mail](tables.MAILS, query.Insert)

	if err := json.NewDecoder(r.Body).Decode(&q); err != nil {
		log.Println("[MAILS][CREATE] cannot decode json into query", err)
		return nil, err
	}

	sql, values := q.Build()

	rows, err := server.DBPool.Query(context.Background(), sql, values...)

	mails, err := pgx.CollectRows(rows, pgx.RowToStructByName[Mail])

	if err != nil {
		return nil, err
	}

	return mails, err
}

func delete(r *http.Request) ([]Mail, error) {
	q := query.NewQuery[Mail](tables.MAILS, query.Delete)

	if err := json.NewDecoder(r.Body).Decode(&q); err != nil {
		log.Println("[MAILS][DELETE] cannot decode json into query", err)
		return nil, err
	}

	sql, values := q.Build()

	rows, err := server.DBPool.Query(context.Background(), sql, values...)

	mails, err := pgx.CollectRows(rows, pgx.RowToStructByName[Mail])

	if err != nil {
		return nil, err
	}

	return mails, err
}
