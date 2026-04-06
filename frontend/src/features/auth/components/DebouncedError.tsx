import { useFormState, useWatch } from "react-hook-form";
import type { FieldValues, UseFormReturn, Path } from "react-hook-form";
import { useDebounce } from "../hooks/useDebounce";

export interface AuthField {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
}

export function DebouncedError<T extends FieldValues>({
  form,
  name,
  errorId,
}: {
  form: UseFormReturn<T>;
  name: Path<T>;
  errorId: string;
}) {
  const value = useWatch({
    control: form.control,
    name,
  });

  const debouncedValue = useDebounce(value, 600);

  const { errors } = useFormState({
    control: form.control,
    name,
  });

  const error = errors[name];

  if (!error || value !== debouncedValue) return null;

  return (
    <span id={errorId} role="alert" className="text-xs text-red-500 ml-1">
      {error.message as string}
    </span>
  );
}
