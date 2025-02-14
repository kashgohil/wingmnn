import { DataType, Field, FieldType } from "@frameworks/forms/type";

export const LandingFields = (function () {
  // private
  function password(): Field {
    return {
      id: "password",
      label: "Password",
      type: FieldType.INPUT,
      dataType: DataType.PASSWORD,
      validations: { min: 8, mandatory: true },
    } as Field;
  }

  function username(): Field {
    return {
      id: "username",
      label: "Username",
      type: FieldType.INPUT,
      dataType: DataType.STRING,
      validations: { min: 3, mandatory: true },
    } as Field;
  }

  // public
  function loginFields(): Array<Field> {
    return [username(), password()];
  }

  function signupFields(): Array<Field> {
    return [username(), password()];
  }

  return { loginFields, signupFields };
})();
