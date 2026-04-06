import { useFormState } from "react-hook-form";
import type { FieldValues, UseFormReturn, Path } from "react-hook-form";
import { PasswordToggle } from "./PasswordToggle";
import { DebouncedError } from "./DebouncedError";

export interface AuthField {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
}

interface AuthFieldItemProps<T extends FieldValues> {
  field: AuthField;
  form: UseFormReturn<T>;
  isLoading: boolean;
  uid: string;
}

export function AuthFieldItem<T extends FieldValues>({
  field,
  form,
  isLoading,
  uid,
}: AuthFieldItemProps<T>) {
  const fieldId = `${uid}-${field.name}`;
  const errorId = `${uid}-${field.name}-error`;

  const { errors } = useFormState({
    control: form.control,
    name: field.name as Path<T>,
  });

  const currentError = errors[field.name as Path<T>];
  const hasError = !!currentError;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={fieldId} className="text-sm text-zinc-400">
        {field.label}
      </label>

      <div className="relative">
        <input
          id={fieldId}
          type={field.type ?? "text"}
          placeholder={field.placeholder}
          disabled={isLoading}
          autoComplete={field.autoComplete}
          aria-invalid={hasError ? "true" : "false"}
          aria-describedby={hasError ? errorId : undefined}
          {...form.register(field.name as Path<T>)}
          className={`w-full bg-zinc-800 border rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:ring-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed
            ${
              hasError
                ? "border-red-500 focus:border-red-400 focus:ring-red-500/20"
                : "border-zinc-700 focus:border-zinc-500 focus:ring-zinc-500/20"
            }`}
        />

        {field.type === "password" && (
          <PasswordToggle fieldId={fieldId} disabled={isLoading} />
        )}
      </div>

      <DebouncedError
        form={form}
        name={field.name as Path<T>}
        errorId={errorId}
      />
    </div>
  );
}
