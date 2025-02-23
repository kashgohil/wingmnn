package conversion

import (
	"errors"
	"fmt"
	"reflect"
	"strconv"
	"strings"
)

func MapToStruct[T any](mp map[string]interface{}) (T, error) {
	var result T
	valueOf := reflect.ValueOf(&result).Elem()

	if err := mapToValue(valueOf, reflect.ValueOf(mp)); err != nil {
		return result, err
	}

	return result, nil
}

func mapToValue(dest reflect.Value, src reflect.Value) error {
	if !dest.CanSet() {
		return errors.New("destination value is not settable")
	}

	// Handle nil source
	if !src.IsValid() || src.IsZero() {
		return nil
	}

	switch dest.Kind() {
	case reflect.Struct:
		return mapToStruct(dest, src)
	case reflect.Map:
		return mapToMap(dest, src)
	case reflect.Slice:
		return mapToSlice(dest, src)
	case reflect.Ptr:
		if dest.IsNil() {
			dest.Set(reflect.New(dest.Type().Elem()))
		}
		return mapToValue(dest.Elem(), src)
	default:
		return setBasicType(dest, src)
	}
}

func mapToStruct(dest reflect.Value, src reflect.Value) error {
	if src.Kind() != reflect.Map {
		return errors.New("source must be a map for struct conversion")
	}

	for i := 0; i < dest.NumField(); i++ {
		field := dest.Type().Field(i)
		fieldValue := dest.Field(i)

		// Get the field name from json tag or use struct field name
		fieldName := field.Name
		if jsonTag := field.Tag.Get("json"); jsonTag != "" {
			fieldName = strings.Split(jsonTag, ",")[0]
		}

		srcValue := src.MapIndex(reflect.ValueOf(fieldName))
		if !srcValue.IsValid() {
			continue
		}

		if err := mapToValue(fieldValue, srcValue); err != nil {
			return fmt.Errorf("error setting field %s: %w", fieldName, err)
		}
	}
	return nil
}

func mapToMap(dest reflect.Value, src reflect.Value) error {
	if src.Kind() != reflect.Map {
		return errors.New("source must be a map for map conversion")
	}

	if dest.IsNil() {
		dest.Set(reflect.MakeMap(dest.Type()))
	}

	iter := src.MapRange()
	for iter.Next() {
		key := iter.Key()
		srcValue := iter.Value()

		newValue := reflect.New(dest.Type().Elem()).Elem()
		if err := mapToValue(newValue, srcValue); err != nil {
			return err
		}

		dest.SetMapIndex(key, newValue)
	}
	return nil
}

func mapToSlice(dest reflect.Value, src reflect.Value) error {
	if src.Kind() != reflect.Slice {
		return errors.New("source must be a slice for slice conversion")
	}

	slice := reflect.MakeSlice(dest.Type(), src.Len(), src.Cap())
	for i := 0; i < src.Len(); i++ {
		if err := mapToValue(slice.Index(i), src.Index(i)); err != nil {
			return err
		}
	}
	dest.Set(slice)
	return nil
}

func setBasicType(dest reflect.Value, src reflect.Value) error {
	switch dest.Kind() {
	case reflect.String:
		switch src.Kind() {
		case reflect.String:
			dest.SetString(src.String())
		default:
			dest.SetString(fmt.Sprint(src.Interface()))
		}
	case reflect.Bool:
		switch src.Kind() {
		case reflect.Bool:
			dest.SetBool(src.Bool())
		case reflect.String:
			b, err := strconv.ParseBool(src.String())
			if err != nil {
				return err
			}
			dest.SetBool(b)
		}
	case reflect.Int, reflect.Int8, reflect.Int16, reflect.Int32, reflect.Int64:
		switch src.Kind() {
		case reflect.Int, reflect.Int8, reflect.Int16, reflect.Int32, reflect.Int64:
			dest.SetInt(src.Int())
		case reflect.Float32, reflect.Float64:
			dest.SetInt(int64(src.Float()))
		case reflect.String:
			i, err := strconv.ParseInt(src.String(), 10, 64)
			if err != nil {
				return err
			}
			dest.SetInt(i)
		}
	case reflect.Uint, reflect.Uint8, reflect.Uint16, reflect.Uint32, reflect.Uint64:
		switch src.Kind() {
		case reflect.Uint, reflect.Uint8, reflect.Uint16, reflect.Uint32, reflect.Uint64:
			dest.SetUint(src.Uint())
		case reflect.Float32, reflect.Float64:
			dest.SetUint(uint64(src.Float()))
		case reflect.String:
			u, err := strconv.ParseUint(src.String(), 10, 64)
			if err != nil {
				return err
			}
			dest.SetUint(u)
		}
	case reflect.Float32, reflect.Float64:
		switch src.Kind() {
		case reflect.Float32, reflect.Float64:
			dest.SetFloat(src.Float())
		case reflect.Int, reflect.Int8, reflect.Int16, reflect.Int32, reflect.Int64:
			dest.SetFloat(float64(src.Int()))
		case reflect.String:
			f, err := strconv.ParseFloat(src.String(), 64)
			if err != nil {
				return err
			}
			dest.SetFloat(f)
		}
	default:
		return fmt.Errorf("unsupported type conversion from %v to %v", src.Type(), dest.Type())
	}
	return nil
}
