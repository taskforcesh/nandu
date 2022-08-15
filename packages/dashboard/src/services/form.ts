import { Accessor } from "solid-js";
import { createStore } from "solid-js/store";

type FormFields = {
  [key: string]: string | boolean;
};
const useForm = (fields: FormFields) => {
  const [form, setForm] = createStore<Partial<FormFields>>(fields);

  const clearField = (fieldName: string) => {
    setForm({
      [fieldName]: "",
    });
  };

  const updateFormField = (fieldName: string) => (event: Event) => {
    const inputElement = event.currentTarget as HTMLInputElement;
    if (inputElement.type === "checkbox") {
      setForm({
        [fieldName]: !!inputElement.checked,
      });
    } else {
      setForm({
        [fieldName]: inputElement.value,
      });
    }
  };

  return { form, updateFormField, clearField };
};

export { useForm };
