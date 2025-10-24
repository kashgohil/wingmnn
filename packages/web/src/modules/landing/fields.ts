import { DataType, type Field, FieldType } from "@frameworks/forms/type";

export const LandingFields = (function () {
  // private
  function password(): Field {
    return {
      id: "password",
      name: "password",
      type: FieldType.INPUT,
      dataType: DataType.PASSWORD,
      validations: { min: 8, mandatory: true },
    } as unknown as Field;
  }

  function username(): Field {
    return {
      id: "username",
      name: "Username",
      type: FieldType.INPUT,
      dataType: DataType.STRING,
      validations: { min: 3, mandatory: true },
    } as unknown as Field;
  }

  function email(): Field {
    return {
      id: "email",
      name: "Email",
      type: FieldType.INPUT,
      dataType: DataType.STRING,
      validations: { mandatory: true },
    } as unknown as Field;
  }

  // public
  function loginFields(): Array<Field> {
    return [email(), password()];
  }

  function signupFields(): Array<Field> {
    return [username(), password()];
  }

  return { loginFields, signupFields };
})();
