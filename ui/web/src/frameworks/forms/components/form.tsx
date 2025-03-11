import { Checkbox } from "@components/checkbox/checkbox";
import { Input } from "@components/input/input";
import { Radio } from "@components/radio/radio";
import { Select } from "@components/select/select";
import { Switch } from "@components/switch/switch";
import { classVariance } from "@utility/classVariance";
import { cx } from "@utility/cx";
import { map } from "@utility/map";
import React, { FormEvent } from "react";
import {
  CheckboxField,
  CompositeField,
  DataType,
  DateField,
  DateTimeField,
  Field,
  FieldType,
  InputField,
  RadioField,
  RichTextField,
  SelectField,
  SwitchField,
  TimeField,
} from "../type";
import { FormData } from "../useForm";
import { ValidationResult } from "../validations";

interface FormProps
  extends Omit<
    React.DetailedHTMLProps<
      React.FormHTMLAttributes<HTMLFormElement>,
      HTMLFormElement
    >,
    "onChange"
  > {
  formData: FormData;
  className?: string;
  fields: Array<Field>;
  onSubmit(values: FormData["values"]): void;
  onChange(fieldId: string, value: TSAny): void;
}

interface FormFieldProps {
  value: TSAny;
  field: Field;
  validations: ValidationResult;
  onChange: FormProps["onChange"];
}

interface FieldComponentProps<T> extends Omit<FormFieldProps, "field"> {
  field: T;
}

export interface FormMessageProps {
  message: string;
  type: "info" | "error";
}

const formMessageVariantClasses = classVariance({
  info: "text-white-950 text-md",
  error: "text-red-300 text-md",
});

export function FormMessage(props: FormMessageProps) {
  const { message, type } = props;

  if (!message) return null;

  return (
    <div className={cx("p-1", formMessageVariantClasses(type))}>{message}</div>
  );
}

function CompositeFieldRenderer(props: FieldComponentProps<CompositeField>) {
  const { field, value: fieldValue, validations, onChange } = props;
  const { childFields } = field;
  const { childValidations = [] } = validations;

  const changeHandler = React.useCallback(
    (fieldId: string, value: TSAny) => {
      onChange(fieldId, { ...fieldValue, [fieldId]: value });
    },
    [onChange, fieldValue],
  );

  return (
    <div className="border border-dashed rounded-lg p-2 space-y-2 w-full">
      {map(childFields, (childField, index) => {
        return (
          <FormField
            field={childField}
            key={childField.id}
            onChange={changeHandler}
            value={fieldValue[childField.id]}
            validations={childValidations[index]}
          />
        );
      })}
    </div>
  );
}

function SelectFieldRenderer(props: FieldComponentProps<SelectField>) {
  const { field, value, onChange } = props;

  const multi = field.dataType === DataType.LIST_OF_STRING;

  const changeHandler = React.useCallback(
    (value: TSAny) => {
      onChange(field.id, value);
    },
    [onChange, field.id],
  );

  return (
    <Select
      multi={multi}
      value={value}
      variant="outlined"
      options={field.options}
      onChange={changeHandler}
    />
  );
}

function InputFieldRenderer(props: FieldComponentProps<InputField>) {
  const { field, value, onChange } = props;

  function getDataType() {
    switch (field.dataType) {
      case DataType.NUMBER:
        return "number";
      case DataType.PASSWORD:
        return "password";
      default:
        return "string";
    }
  }

  const changeHandler = React.useCallback(
    (value: TSAny) => {
      onChange(field.id, value);
    },
    [onChange, field.id],
  );

  return (
    <Input
      value={value}
      variant="outlined"
      type={getDataType()}
      onChange={changeHandler}
      placeholder={field.name}
    />
  );
}

function CheckboxFieldRenderer(props: FieldComponentProps<CheckboxField>) {
  const { field, value, onChange } = props;

  const changeHandler = React.useCallback(
    (value: TSAny) => {
      onChange(field.id, value);
    },
    [onChange, field.id],
  );

  return <Checkbox checked={value} onChange={changeHandler} value={field.id} />;
}

function RadioFieldRenderer(props: FieldComponentProps<RadioField>) {
  const { field, value, onChange } = props;

  const changeHandler = React.useCallback(
    (value: TSAny) => {
      onChange(field.id, value);
    },
    [onChange, field.id],
  );

  return <Radio checked={value} onChange={changeHandler} value={field.id} />;
}

function DateFieldRenderer(props: FieldComponentProps<DateField>) {
  const { field, value, onChange } = props;

  const changeHandler = React.useCallback(
    (value: TSAny) => {
      onChange(field.id, value);
    },
    [onChange, field.id],
  );

  return (
    <Switch checked={value} onChange={changeHandler} message={field.name} />
  );
}

function TimeFieldRenderer(props: FieldComponentProps<TimeField>) {
  const { field, value, onChange } = props;

  const changeHandler = React.useCallback(
    (value: TSAny) => {
      onChange(field.id, value);
    },
    [onChange, field.id],
  );

  return (
    <Switch checked={value} onChange={changeHandler} message={field.name} />
  );
}

function DateTimeFieldRenderer(props: FieldComponentProps<DateTimeField>) {
  const { field, value, onChange } = props;

  const changeHandler = React.useCallback(
    (value: TSAny) => {
      onChange(field.id, value);
    },
    [onChange, field.id],
  );

  return (
    <Switch checked={value} onChange={changeHandler} message={field.name} />
  );
}

function SwitchFieldRenderer(props: FieldComponentProps<SwitchField>) {
  const { field, value, onChange } = props;

  const changeHandler = React.useCallback(
    (value: TSAny) => {
      onChange(field.id, value);
    },
    [onChange, field.id],
  );

  return (
    <Switch checked={value} onChange={changeHandler} message={field.name} />
  );
}

function RichTextFieldRenderer(props: FieldComponentProps<RichTextField>) {
  const { field, value, onChange } = props;

  const changeHandler = React.useCallback(
    (value: TSAny) => {
      onChange(field.id, value);
    },
    [onChange, field.id],
  );

  return (
    <Switch checked={value} onChange={changeHandler} message={field.name} />
  );
}

export function FormField(props: FormFieldProps) {
  const { field, value, validations, onChange } = props;

  const { error = "", valid } = validations;

  const message = valid ? field.description : error;

  switch (field.type) {
    case FieldType.COMPOSITE:
      return (
        <div tabIndex={-1}>
          <CompositeFieldRenderer
            field={field}
            value={value}
            onChange={onChange}
            validations={validations}
          />
          <FormMessage message={message} type={valid ? "info" : "error"} />
        </div>
      );
    case FieldType.CHECKBOX:
      return (
        <div tabIndex={-1}>
          <CheckboxFieldRenderer
            field={field}
            value={value}
            onChange={onChange}
            validations={validations}
          />
          <FormMessage message={message} type={valid ? "info" : "error"} />
        </div>
      );
    case FieldType.RADIO:
      return (
        <div tabIndex={-1}>
          <RadioFieldRenderer
            field={field}
            value={value}
            onChange={onChange}
            validations={validations}
          />
          <FormMessage message={message} type={valid ? "info" : "error"} />
        </div>
      );
    case FieldType.SELECT:
      return (
        <div tabIndex={-1}>
          <SelectFieldRenderer
            field={field}
            value={value}
            onChange={onChange}
            validations={validations}
          />
          <FormMessage message={message} type={valid ? "info" : "error"} />
        </div>
      );
    case FieldType.INPUT:
      return (
        <div tabIndex={-1}>
          <InputFieldRenderer
            field={field}
            value={value}
            onChange={onChange}
            validations={validations}
          />
          <FormMessage message={message} type={valid ? "info" : "error"} />
        </div>
      );
    case FieldType.SWITCH:
      return (
        <div tabIndex={-1}>
          <SwitchFieldRenderer
            field={field}
            value={value}
            onChange={onChange}
            validations={validations}
          />
          <FormMessage message={message} type={valid ? "info" : "error"} />
        </div>
      );
    case FieldType.RICH_TEXT:
      return (
        <div tabIndex={-1}>
          <RichTextFieldRenderer
            field={field}
            value={value}
            onChange={onChange}
            validations={validations}
          />
          <FormMessage message={message} type={valid ? "info" : "error"} />
        </div>
      );
    case FieldType.TIME:
      return (
        <div tabIndex={-1}>
          <TimeFieldRenderer
            field={field}
            value={value}
            onChange={onChange}
            validations={validations}
          />
          <FormMessage message={message} type={valid ? "info" : "error"} />
        </div>
      );
    case FieldType.DATE:
      return (
        <div tabIndex={-1}>
          <DateFieldRenderer
            field={field}
            value={value}
            onChange={onChange}
            validations={validations}
          />
          <FormMessage message={message} type={valid ? "info" : "error"} />
        </div>
      );
    case FieldType.DATE_TIME:
      return (
        <div tabIndex={-1}>
          <DateTimeFieldRenderer
            field={field}
            value={value}
            onChange={onChange}
            validations={validations}
          />
          <FormMessage message={message} type={valid ? "info" : "error"} />
        </div>
      );
  }
}

export function Form(props: FormProps) {
  const { formData, fields, className, onChange, onSubmit, ...rest } = props;

  const { validations, values } = formData;

  const submitHandler = React.useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      onSubmit(formData.values);
    },
    [onSubmit, formData.values],
  );

  return (
    <form
      {...rest}
      onSubmit={submitHandler}
      className={cx("space-y-4 flex flex-col", className)}
    >
      {map(fields, (field) => (
        <FormField
          field={field}
          key={field.id}
          onChange={onChange}
          value={values[field.id]}
          validations={validations[field.id]}
        />
      ))}
    </form>
  );
}
