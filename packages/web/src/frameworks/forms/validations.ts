import { forEach, isNil } from "@wingmnn/utils";
import {
  DataType,
  FieldType,
  type BaseValidations,
  type CheckboxField,
  type CompositeField,
  type DateField,
  type DateTimeField,
  type DateTimeValidations,
  type Field,
  type InputField,
  type NumberValidations,
  type RadioField,
  type RichTextField,
  type SelectField,
  type StringValidations,
  type SwitchField,
  type TimeField,
} from "./type";

export type ValidationResult =
  | {
      valid: true;
      error: undefined;
      childValidations?: Array<ValidationResult>;
    }
  | { valid: false; error: string; childValidations?: Array<ValidationResult> };

export const Validations = (function () {
  // private
  function _base(value: TSAny, validations: BaseValidations): ValidationResult {
    const { mandatory } = validations;
    if (mandatory && isNil(value)) {
      return {
        valid: false,
        error: "value cannot be empty",
      };
    }
    return { valid: true, error: undefined };
  }

  function _string(
    value: string,
    validations: StringValidations,
  ): ValidationResult {
    const { mandatory, min, max, regex } = validations;

    if (mandatory && isNil(value)) {
      return { valid: false, error: "value cannot be empty" };
    }

    if (min && value.length < min) {
      return {
        valid: false,
        error: `value has to be at least ${min} characters long`,
      };
    }

    if (max && value.length > max) {
      return {
        valid: false,
        error: `value cannot be longer than ${max} characters`,
      };
    }

    if (regex && new RegExp(regex).test(value)) {
      return {
        valid: false,
        error: `invalid value`,
      };
    }

    return {
      valid: true,
      error: undefined,
    };
  }

  function _number(
    value: number,
    validations: NumberValidations,
  ): ValidationResult {
    const { mandatory, min, max } = validations;

    if (mandatory && isNil(value)) {
      return { valid: false, error: "value cannot be empty" };
    }

    if (min && value < min) {
      return {
        valid: false,
        error: `value has to be at least ${min} characters long`,
      };
    }

    if (max && value > max) {
      return {
        valid: false,
        error: `value cannot be longer than ${max} characters`,
      };
    }

    return {
      valid: true,
      error: undefined,
    };
  }

  function _dateTime(
    value: number | string,
    validations: DateTimeValidations,
  ): ValidationResult {
    const { mandatory, min, max } = validations;

    if (mandatory && isNil(value)) {
      return { valid: false, error: "value cannot be empty" };
    }

    if (min && !Number.isNaN(Number(value)) && Number(value) < min) {
      return {
        valid: false,
        error: `value cannot be before ${new Date(min).toString()}`,
      };
    }

    if (max && !Number.isNaN(Number(value)) && Number(value) > max) {
      return {
        valid: false,
        error: `value cannot be after ${new Date(max).toString()}`,
      };
    }

    return { valid: true, error: undefined };
  }

  // public
  function select(field: SelectField, value: TSAny): ValidationResult {
    const { validations } = field;

    return _base(value, validations);
  }

  function richText(field: RichTextField, value: TSAny): ValidationResult {
    const { validations } = field;
    return _string(value, validations);
  }

  function checkbox(field: CheckboxField, value: TSAny): ValidationResult {
    const { validations } = field;
    return _base(value, validations);
  }

  function radio(field: RadioField, value: TSAny): ValidationResult {
    const { validations } = field;
    return _base(value, validations);
  }

  function input(field: InputField, value: TSAny): ValidationResult {
    const { validations, dataType } = field;
    switch (dataType) {
      case DataType.STRING:
      case DataType.PASSWORD:
        return _string(value, validations);
      case DataType.NUMBER:
        return _number(value, validations);
    }
  }

  function dateTime(field: DateTimeField, value: TSAny): ValidationResult {
    const { validations } = field;
    return _dateTime(value, validations);
  }

  function date(field: DateField, value: TSAny): ValidationResult {
    const { validations } = field;
    return _dateTime(value, validations);
  }

  function time(field: TimeField, value: TSAny): ValidationResult {
    const { validations } = field;
    return _dateTime(value, validations);
  }

  function switchField(field: SwitchField, value: boolean): ValidationResult {
    const { validations } = field;
    return _base(value, validations);
  }

  function composite(field: CompositeField, value: TSAny): ValidationResult {
    const { validations, childFields } = field;

    const baseValidation = _base(value, validations);
    if (!baseValidation.valid) return baseValidation;

    let ans: boolean = baseValidation.valid;
    let error: string | undefined = "";
    const childValidations: Array<ValidationResult> = [];

    forEach(childFields, (childField) => {
      const validation = validate(childField, value[childField.id]);
      childValidations.push(validation);
      ans &&= validation.valid;
      error = validation.error;
    });

    if (ans) {
      return { valid: true, error: undefined, childValidations };
    } else {
      return { valid: false, error, childValidations };
    }
  }

  function validate(field: Field, value: TSAny): ValidationResult {
    const { type } = field;
    switch (type) {
      case FieldType.CHECKBOX:
        return checkbox(field, value);
      case FieldType.COMPOSITE:
        return composite(field, value);
      case FieldType.RADIO:
        return radio(field, value);
      case FieldType.SWITCH:
        return switchField(field, value);
      case FieldType.DATE:
        return date(field, value);
      case FieldType.DATE_TIME:
        return dateTime(field, value);
      case FieldType.TIME:
        return time(field, value);
      case FieldType.INPUT:
        return input(field, value);
      case FieldType.RICH_TEXT:
        return richText(field, value);
      case FieldType.SELECT:
        return select(field, value);
    }
  }

  return {
    select,
    date,
    time,
    dateTime,
    richText,
    composite,
    input,
    checkbox,
    radio,
    switch: switchField,
    field: validate,
  };
})();
