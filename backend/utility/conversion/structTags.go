package conversion

import (
	"reflect"
	"strings"
)

func GetDBTag[T any](fieldName string) string {
	var t T

	for _, field := range reflect.VisibleFields(reflect.TypeOf(t)) {
		if field.Tag.Get("json") == fieldName || field.Name == fieldName {
			return field.Tag.Get("db")
		}
	}

	return strings.ToLower(fieldName)
}

func GetDBTags[T any](fieldNames []string) []string {
	var tags []string = make([]string, 0)

	for _, fieldName := range fieldNames {
		tags = append(tags, GetDBTag[T](fieldName))
	}

	return tags
}

func GetJSONTag[T any](fieldName string) string {
	var t T

	for _, field := range reflect.VisibleFields(reflect.TypeOf(t)) {
		if field.Tag.Get("db") == fieldName || field.Name == fieldName {
			return field.Tag.Get("json")
		}
	}

	return strings.ToLower(fieldName)
}

func GetJSONTags[T any](fieldNames []string) []string {
	var tags []string = make([]string, 0)

	for _, fieldName := range fieldNames {
		tags = append(tags, GetJSONTag[T](fieldName))
	}

	return tags
}
