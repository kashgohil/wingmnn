package crud

import (
	"context"

	"github.com/jackc/pgx/v5"
	"github.com/kashgohil/wingmnn/backend/server"
	"github.com/kashgohil/wingmnn/backend/tables"
	"github.com/kashgohil/wingmnn/backend/utility/query"
)

type CRUD[T any] struct {
	Table tables.TableNames
}

func NewCRUD[T any](table tables.TableNames) *CRUD[T] {
	return &CRUD[T]{
		Table: table,
	}
}

func (c *CRUD[T]) Create(context context.Context, actions []query.Action) ([]T, error) {
	q := query.NewQuery[T](c.Table, query.Insert)

	for _, action := range actions {
		q.AddAction(action)
	}

	sql, values := q.Build(context)

	rows, err := server.DBPool.Query(context, sql, values...)

	data, err := pgx.CollectRows(rows, pgx.RowToStructByName[T])

	if err != nil {
		return nil, err
	}

	return data, err
}

func (c *CRUD[T]) Delete(context context.Context, conditions []query.Condition) ([]T, error) {
	q := query.NewQuery[T](c.Table, query.Delete)

	for _, condition := range conditions {
		q.AddCondition(condition)
	}

	sql, values := q.Build(context)

	rows, err := server.DBPool.Query(context, sql, values...)

	if err != nil {
		return nil, err
	}

	data, err := pgx.CollectRows(rows, pgx.RowToStructByName[T])

	return data, err
}

func (c *CRUD[T]) Update(context context.Context, conditions []query.Condition, actions []query.Action) ([]T, error) {
	q := query.NewQuery[T](c.Table, query.Update)

	for _, condition := range conditions {
		q.AddCondition(condition)
	}

	for _, action := range actions {
		q.AddAction(action)
	}

	sql, values := q.Build(context)

	rows, err := server.DBPool.Query(context, sql, values...)

	data, err := pgx.CollectRows(rows, pgx.RowToStructByName[T])

	if err != nil {
		return nil, err
	}

	return data, err
}

func (c *CRUD[T]) Get(context context.Context, conditions []query.Condition) ([]T, error) {
	q := query.NewQuery[T](c.Table, query.Select)

	for _, condition := range conditions {
		q.AddCondition(condition)
	}

	sql, values := q.Build(context)

	rows, err := server.DBPool.Query(context, sql, values...)

	data, err := pgx.CollectRows(rows, pgx.RowToStructByName[T])

	if err != nil {
		return nil, err
	}

	return data, err
}
