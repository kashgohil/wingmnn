export enum FieldType {
  SELECT = "SELECT",
  INPUT = "INPUT",
  DATE = "DATE",
  TIME = "TIME",
  DATE_TIME = "DATE_TIME",
  RICH_TEXT = "RICH_TEXT",
  CHECKBOX = "CHECKBOX",
  RADIO = "RADIO",
  COMPOSITE = "COMPOSITE",
  SWITCH = "SWITCH",
}

export enum DataType {
  STRING = "STRING",
  NUMBER = "NUMBER",
  BOOLEAN = "BOOLEAN",
  PASSWORD = "PASSWORD",
  COMPOSITE = "COMPOSITE",

  LIST_OF_STRING = "LIST_OF_STRING",
  LIST_OF_COMPOSITE = "LIST_OF_COMPOSITE",
}

export type BaseValidations = {
  mandatory: boolean;
};

export interface StringValidations extends BaseValidations {
  min: number;
  max: number;
  regex: RegExp;
}

export interface NumberValidations extends BaseValidations {
  min: number;
  max: number;
}

export interface DateTimeValidations extends BaseValidations {
  min: number;
  max: number;
}

interface BaseField extends BaseDetails, Metadata {
  remark?: string;
}

interface SingleSelectField extends BaseField {
  type: FieldType.SELECT;
  options: Array<Option>;
  dataType: DataType.STRING;
  validations: BaseValidations;
}

interface MultiSelectField extends BaseField {
  type: FieldType.SELECT;
  options: Array<Option>;
  validations: BaseValidations;
  dataType: DataType.LIST_OF_STRING;
}

export type SelectField = SingleSelectField | MultiSelectField;

export interface CheckboxField extends BaseField {
  type: FieldType.CHECKBOX;
  validations: BaseValidations;
  dataType: DataType.LIST_OF_STRING;
}

export interface RadioField extends BaseField {
  type: FieldType.RADIO;
  dataType: DataType.STRING;
  validations: BaseValidations;
}

interface TextInputField extends BaseField {
  type: FieldType.INPUT;
  validations: StringValidations;
  dataType: DataType.STRING | DataType.PASSWORD;
}

interface NumberInputField extends BaseField {
  type: FieldType.INPUT;
  dataType: DataType.NUMBER;
  validations: NumberValidations;
}

export type InputField = TextInputField | NumberInputField;

export interface RichTextField extends BaseField {
  type: FieldType.RICH_TEXT;
  dataType: DataType.STRING;
  validations: StringValidations;
}

export interface DateField extends BaseField {
  type: FieldType.DATE;
  dataType: DataType.STRING;
  validations: DateTimeValidations;
}

export interface TimeField extends BaseField {
  type: FieldType.TIME;
  dataType: DataType.STRING;
  validations: DateTimeValidations;
}

export interface DateTimeField extends BaseField {
  type: FieldType.DATE_TIME;
  dataType: DataType.STRING;
  validations: DateTimeValidations;
}

interface SingleCompositeField extends BaseField {
  type: FieldType.COMPOSITE;
  childFields: Array<Field>;
  dataType: DataType.COMPOSITE;
  validations: BaseValidations;
}

interface MultiCompositeField extends BaseField {
  type: FieldType.COMPOSITE;
  childFields: Array<Field>;
  dataType: DataType.LIST_OF_COMPOSITE;
  validations: BaseValidations;
}

export type CompositeField = SingleCompositeField | MultiCompositeField;

export interface SwitchField extends BaseField {
  type: FieldType.SWITCH;
  dataType: DataType.BOOLEAN;
  validations: BaseValidations;
}

export type Field =
  | SelectField
  | InputField
  | DateField
  | TimeField
  | DateTimeField
  | CheckboxField
  | RadioField
  | RichTextField
  | SwitchField
  | CompositeField;

export type FieldTypeMap = {
  [FieldType.SELECT]: SelectField;
  [FieldType.INPUT]: InputField;
  [FieldType.RADIO]: RadioField;
  [FieldType.RICH_TEXT]: RichTextField;
  [FieldType.CHECKBOX]: CheckboxField;
  [FieldType.COMPOSITE]: CompositeField;
  [FieldType.DATE]: DateField;
  [FieldType.TIME]: TimeField;
  [FieldType.DATE_TIME]: DateTimeField;
};
