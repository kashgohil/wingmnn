package query

import (
	"fmt"
	"log"
	"strings"

	"github.com/kashgohil/wingmnn/backend/utility/conversion"
)

type ActionType string

const (
	Set   ActionType = "SET"
	Unset ActionType = "UNSET"
)

type Action struct {
	Field string
	Type  ActionType
	Value interface{}
}

func NewAction(field string, value interface{}, Type ActionType) Action {
	return Action{
		Field: field,
		Value: value,
		Type:  Type,
	}
}

func (q *query[T]) AddAction(action Action) {
	q.Actions = append(q.Actions, action)
}

func (q *query[T]) buildActions() (string, string, []interface{}) {
	switch q.Operation {
	case Insert:
		actionFields := []string{}
		actionValues := []string{}
		values := []interface{}{}

		for _, action := range q.Actions {
			q.paramsCount++
			actionFields = append(actionFields, conversion.GetDBTag[T](action.Field))
			actionValues = append(actionValues, fmt.Sprintf("$%d", q.paramsCount))
			values = append(values, action.Value)
		}

		return strings.Join(actionFields, ", "), strings.Join(actionValues, ", "), values

	case Update:
		updateQuery := []string{}
		values := []interface{}{}
		for _, action := range q.Actions {
			q.paramsCount++
			switch action.Type {
			case Set:
				updateQuery = append(updateQuery, fmt.Sprintf("%s = $%d", conversion.GetDBTag[T](action.Field), q.paramsCount))
				values = append(values, action.Value)
			case Unset:
				updateQuery = append(updateQuery, fmt.Sprintf("%s = $%d", conversion.GetDBTag[T](action.Field), q.paramsCount))
				values = append(values, nil)
			default:
				log.Println("Invalid action type: ", action.Type, " Defaulting to SET")
				updateQuery = append(updateQuery, fmt.Sprintf("%s = $%d", conversion.GetDBTag[T](action.Field), q.paramsCount))
				values = append(values, action.Value)
			}
		}
		return strings.Join(updateQuery, ", "), "", values

	default:
		return "", "", nil
	}
}
