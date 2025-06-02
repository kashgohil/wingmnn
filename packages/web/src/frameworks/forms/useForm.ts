import { everyObj, forEach, isEqual, someObj } from "@wingmnn/utils";
import { useCallback, useMemo, useRef, useState } from "react";
import { type Field } from "./type";
import { type ValidationResult, Validations } from "./validations";

export interface FormData {
  isValid: boolean;
  isDirty: boolean;
  values: MapOf<TSAny>;
  dirty: MapOf<boolean>;
  validations: MapOf<ValidationResult>;
}

export function useForm(
  fields: Array<Field>,
  params?: { initialValue?: MapOf<TSAny> },
) {
  const { initialValue = {} } = params || {};

  const [values, setValues] = useState<FormData["values"]>({});
  const [dirty, setDirty] = useState<FormData["dirty"]>(initialValue);

  const initialValuesRef = useRef<MapOf<TSAny>>(
    Object.freeze({ ...initialValue }),
  );

  const formData = useMemo(() => {
    const validations: FormData["validations"] = {};
    const isDirty = someObj(dirty, (value) => value);

    forEach(fields, (field) => {
      if (dirty[field.id]) {
        validations[field.id] = Validations.field(field, values[field.id]);
      } else {
        validations[field.id] = { valid: true, error: undefined };
      }
    });

    return {
      dirty,
      values,
      validations,

      isDirty,
      isValid:
        isDirty && everyObj(validations, (validation) => validation.valid),
    };
  }, [fields, values, dirty]);

  const checkDirty = useCallback((fieldId: string, value: TSAny) => {
    return !isEqual(value, initialValuesRef.current[fieldId]);
  }, []);

  const update = useCallback(
    (fieldId: string, value: TSAny) => {
      setValues((values) => {
        values[fieldId] = value;
        return values;
      });
      setDirty((dirty) => {
        if (dirty[fieldId]) return dirty;
        dirty[fieldId] = checkDirty(fieldId, value);
        return dirty;
      });
    },
    [checkDirty],
  );

  const reset = useCallback(() => {
    setValues(initialValuesRef.current);
    setDirty({});
  }, []);

  return { formData, update, reset, initialValues: initialValuesRef.current };
}
