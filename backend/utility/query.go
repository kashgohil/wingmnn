package utility

import (
	"fmt"
	"reflect"
	"strings"
	"time"

	"github.com/google/uuid"
)

func BuildUpdateQuery(tableName string, id string, data interface{}) (string, []interface{}) {
	val := reflect.ValueOf(data)
	typ := val.Type()

	// For pointer to struct, get the underlying element
	if val.Kind() == reflect.Ptr {
		val = val.Elem()
		typ = val.Type()
	}

	var setClauses []string
	var args []interface{}
	paramCount := 1

	for i := 0; i < typ.NumField(); i++ {
		field := typ.Field(i)
		value := val.Field(i)

		// Check the ignore tag
		ignoreTag := field.Tag.Get("ignore")
		if ignoreTag == "true" {
			continue
		}

		// Get the db tag, fallback to lowercase field name if not present
		dbTag := field.Tag.Get("db")
		if dbTag == "" {
			dbTag = strings.ToLower(field.Name)
		}

		// Skip if field is nil (for pointer fields)
		if value.Kind() == reflect.Ptr && value.IsNil() {
			continue
		}

		// For pointer fields, get the underlying value
		if value.Kind() == reflect.Ptr {
			value = value.Elem()
		}

		setClauses = append(setClauses, fmt.Sprintf("%s = $%d", dbTag, paramCount))
		args = append(args, value.Interface())
		paramCount++
	}

	// Add updated_at column data
	setClauses = append(setClauses, "updated_at")
	args = append(args, time.Now().UnixMilli())
	paramCount++

	// Add ID as the last parameter
	args = append(args, id)

	query := fmt.Sprintf(
		"UPDATE %s SET %s WHERE id = $%d AND deleted = false RETURNING *",
		tableName,
		strings.Join(setClauses, ", "),
		paramCount,
	)

	return query, args
}

func BuildCreateQuery(tableName string, userID string, data interface{}) (string, []interface{}) {
	val := reflect.ValueOf(data)
	typ := val.Type()

	// For pointer to struct, get the underlying element
	if val.Kind() == reflect.Ptr {
		val = val.Elem()
		typ = val.Type()
	}

	var columns []string
	var placeholders []string
	var args []interface{}
	paramCount := 1

	// First add the regular fields from the struct
	for i := 0; i < typ.NumField(); i++ {
		field := typ.Field(i)
		value := val.Field(i)

		// Check the ignore tag
		ignoreTag := field.Tag.Get("ignore")
		if ignoreTag == "true" {
			continue
		}

		// Get the db tag, fallback to lowercase field name if not present
		dbTag := field.Tag.Get("db")
		if dbTag == "" {
			dbTag = strings.ToLower(field.Name)
		}

		// skip if the field is nil (for pointer fields)
		if value.Kind() == reflect.Ptr && value.IsNil() {
			continue
		}

		// For pointer fields, get the underlying value
		if value.Kind() == reflect.Ptr {
			value = value.Elem()
		}

		columns = append(columns, dbTag)
		placeholders = append(placeholders, fmt.Sprintf("$%d", paramCount))
		args = append(args, value.Interface())
		paramCount++
	}

	// Add automatic fields
	now := time.Now().UnixMilli()

	// id
	columns = append(columns, "id")
	placeholders = append(placeholders, fmt.Sprintf("$%d", paramCount))
	args = append(args, uuid.New().String())
	paramCount++

	// created_at
	columns = append(columns, "created_at")
	placeholders = append(placeholders, fmt.Sprintf("$%d", paramCount))
	args = append(args, now)
	paramCount++

	// updated_at
	columns = append(columns, "updated_at")
	placeholders = append(placeholders, fmt.Sprintf("$%d", paramCount))
	args = append(args, now)
	paramCount++

	// created_by
	columns = append(columns, "created_by")
	placeholders = append(placeholders, fmt.Sprintf("$%d", paramCount))
	args = append(args, userID)
	paramCount++

	// updated_by
	columns = append(columns, "updated_by")
	placeholders = append(placeholders, fmt.Sprintf("$%d", paramCount))
	args = append(args, userID)
	paramCount++

	// deleted
	columns = append(columns, "deleted")
	placeholders = append(placeholders, fmt.Sprintf("$%d", paramCount))
	args = append(args, false)
	paramCount++

	query := fmt.Sprintf(
		"INSERT INTO %s (%s) VALUES (%s) RETURNING *",
		tableName,
		strings.Join(columns, ", "),
		strings.Join(placeholders, ", "),
	)

	return query, args
}

func BuildGetQuery(tableName string, data interface{}) (string, []interface{}) {
	val := reflect.ValueOf(data)
	typ := val.Type()

	// For pointer to struct, get the underlying element
	if val.Kind() == reflect.Ptr {
		val = val.Elem()
		typ = val.Type()
	}

	var clauses []string
	var args []interface{}
	paramCount := 1

	for i := 0; i < typ.NumField(); i++ {
		field := typ.Field(i)
		value := val.Field(i)

		if value.Kind() == reflect.Ptr && value.IsNil() {
			continue
		}

		dbTag := field.Tag.Get("db")
		if dbTag == "" {
			dbTag = strings.ToLower(field.Name)
		}

		if value.Kind() == reflect.Ptr {
			value = value.Elem()
		}

		clauses = append(clauses, fmt.Sprintf("%s = $%d", dbTag, paramCount))
		args = append(args, value.Interface())
		paramCount++
	}

	query := fmt.Sprintf(
		"SELECT * FROM %s WHERE %s",
		tableName,
		strings.Join(clauses, " AND "),
	)

	return query, args
}
