import { useCallback, useRef, useMemo, useState } from "react";
import { Field } from "./type";
import { forEachArray } from "@utility/forEach";
import { ValidationResult, Validations } from "./validations";
import { everyObj } from "@utility/every";
import { someObj } from "@utility/some";
import { isEqual } from "@utility/isEqual";

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

    forEachArray(fields, (field) => {
      validations[field.id] = Validations.field(field, values[field.id]);
    });

    return {
      dirty,
      values,
      validations,

      isDirty: someObj(dirty, (value) => value),
      isValid: everyObj(validations, (validation) => validation.valid),
    };
  }, [fields, values, dirty]);

  const checkDirty = useCallback((fieldId: string, value: TSAny) => {
    return isEqual(value, initialValuesRef.current[fieldId]);
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
