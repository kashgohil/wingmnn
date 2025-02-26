package query

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/kashgohil/wingmnn/backend/server"
	"github.com/kashgohil/wingmnn/backend/tables"
	"github.com/kashgohil/wingmnn/backend/utility/conversion"
)

type JoinType string

const (
	InnerJoin JoinType = "INNER JOIN"
	LeftJoin  JoinType = "LEFT JOIN"
	RightJoin JoinType = "RIGHT JOIN"
)

type TableOperation string

const (
	Insert TableOperation = "INSERT"
	Update TableOperation = "UPDATE"
	Delete TableOperation = "DELETE"
	Select TableOperation = "SELECT"
)

type Join struct {
	Type       JoinType
	Table      string
	Alias      string
	Conditions []Condition
}

type query[T any] struct {
	Table      tables.TableNames `json:"-"`
	Operation  TableOperation    `json:"-"`
	Fields     []string          `json:"fields"`
	Conditions []Condition       `json:"conditions"`
	Actions    []Action          `json:"actions"`
	OrderBy    string            `json:"orderBy"`
	GroupBy    string            `json:"groupBy"`

	paramsCount int
}

func NewQuery[T any](Table tables.TableNames, Operation TableOperation) *query[T] {
	return &query[T]{
		Table:       Table,
		Operation:   Operation,
		Fields:      []string{"*"},
		Conditions:  []Condition{},
		Actions:     []Action{},
		OrderBy:     "",
		GroupBy:     "",
		paramsCount: 1,
	}
}

const (
	id        = "id"
	deleted   = "deleted"
	createdAt = "createdAt"
	updatedAt = "updatedAt"
	createdBy = "createdBy"
	updatedBy = "updatedBy"
)

func (q *query[T]) selectOperation() (string, []interface{}) {
	conditions, values := q.buildConditions()
	return fmt.Sprintf("SELECT %s FROM %s WHERE %s", strings.Join(conversion.GetDBTags[T](q.Fields), ", "), q.Table, conditions), values
}

func (q *query[T]) hardDeleteOperation() (string, []interface{}) {
	conditions, values := q.buildConditions()
	return fmt.Sprintf("DELETE FROM %s WHERE %s", q.Table, conditions), values
}

func (q *query[T]) softDeleteOperation(context context.Context) (string, []interface{}) {
	q.AddAction(NewAction(deleted, true, Set))
	return q.updateOperation(context)
}

func (q *query[T]) updateOperation(context context.Context) (string, []interface{}) {
	userID := context.Value(server.UserID)

	q.AddAction(NewAction(updatedBy, userID, Set))
	q.AddAction(NewAction(updatedAt, time.Now().UnixMilli(), Set))

	actionFields, _, values := q.buildActions()
	conditions, conditionValues := q.buildConditions()
	return fmt.Sprintf("UPDATE %s SET %s WHERE %s RETURNING %s", q.Table, actionFields, conditions, strings.Join(conversion.GetDBTags[T](q.Fields), ", ")), append(values, conditionValues...)
}

func (q *query[T]) insertOperation(context context.Context) (string, []interface{}) {
	userID, ok := context.Value(server.UserID).(string)
	if !ok {
		userID = "SYSTEM"
	}

	q.AddAction(NewAction(id, uuid.New().String(), Set))
	q.AddAction(NewAction(createdBy, userID, Set))
	q.AddAction(NewAction(updatedBy, userID, Set))
	q.AddAction(NewAction(createdAt, time.Now().UnixMilli(), Set))
	q.AddAction(NewAction(updatedAt, time.Now().UnixMilli(), Set))

	actionFields, actionValues, values := q.buildActions()
	return fmt.Sprintf("INSERT INTO %s (%s) VALUES (%s) RETURNING %s", q.Table, actionFields, actionValues, strings.Join(conversion.GetDBTags[T](q.Fields), ", ")), values
}

func (q *query[T]) Build(context context.Context) (string, []interface{}) {
	switch q.Operation {
	case "SELECT":
		return q.selectOperation()
	case "INSERT":
		return q.insertOperation(context)
	case "UPDATE":
		return q.updateOperation(context)
	case "DELETE":
		return q.softDeleteOperation(context)
	default:
		return "", nil
	}
}
