package query

import (
	"fmt"
	"log"
	"strings"

	"github.com/kashgohil/wingmnn/backend/utility/conversion"
)

type Operator string

const (
	Eq        Operator = "="
	Gt        Operator = ">"
	Lt        Operator = "<"
	Gte       Operator = ">="
	Lte       Operator = "<="
	Like      Operator = "LIKE"
	ILike     Operator = "ILIKE"
	In        Operator = "IN"
	NotIn     Operator = "NOT IN"
	IsNull    Operator = "IS NULL"
	IsNotNull Operator = "IS NOT NULL"
	Contains  Operator = "@>" // JSONB contains
	Contained Operator = "<@" // JSONB contained in
	HasKey    Operator = "?>" // JSONB has key
	HasKeyAny Operator = "?|" // JSONB has any key
	HasKeyAll Operator = "?&" // JSONB has all keys
)

var OPERATORS = map[Operator]string{
	Eq:        "=",
	Gt:        ">",
	Lt:        "<",
	Gte:       ">=",
	Lte:       "<=",
	Like:      "LIKE",
	ILike:     "ILIKE",
	In:        "IN",
	NotIn:     "NOT IN",
	IsNull:    "IS NULL",
	IsNotNull: "IS NOT NULL",
	Contains:  "@>",
	Contained: "<@",
	HasKey:    "?>",
	HasKeyAny: "?|",
	HasKeyAll: "?&",
}

type LogicalOp string

const (
	AND LogicalOp = "AND"
	OR  LogicalOp = "OR"
)

type Condition struct {
	Field    string
	Operator Operator
	Value    []interface{}
}

type ConditionGroup struct {
	Conditions []Condition
	Operator   LogicalOp
}

func NewCondition(field string, value []interface{}, operator Operator) Condition {
	return Condition{
		Field:    field,
		Value:    value,
		Operator: operator,
	}
}

func (q *query[T]) AddCondition(condition Condition) {
	q.Conditions = append(q.Conditions, condition)
}

func (q *query[T]) buildConditions() (string, []interface{}) {
	conditionQuery := []string{}
	values := []interface{}{}

	for _, condition := range q.Conditions {
		q.paramsCount++
		sqlOperator := OPERATORS[condition.Operator]

		if sqlOperator == "" {
			log.Println("Invalid operator: ", q.Operation, " Defaulting to '='")
			sqlOperator = "="
		}

		conditionQuery = append(conditionQuery, fmt.Sprintf("%s %s $%d", conversion.GetDBTag[T](condition.Field), sqlOperator, q.paramsCount))
		values = append(values, condition.Value)
	}
	return strings.Join(conditionQuery, " AND "), values
}
