/* eslint-disable @typescript-eslint/no-explicit-any */
import { useFormState } from "react-hook-form";
import type { FieldValues, UseFormReturn, Path } from "react-hook-form";
import { PasswordToggle } from "./PasswordToggle";
import { DebouncedError } from "./DebouncedError";

export interface FormInputConfig {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  variant?: 'accent' | 'light';
}

const bgVariants = {
  accent: 'bg-greyOneAccent border-zinc-700 focus:border-zinc-500 focus:ring-zinc-500/20',
  light: 'bg-[#F4F4F5] border-zinc-300 focus:border-zinc-500 focus:ring-zinc-500/20',
};

interface ControlledFormInputProps<T extends FieldValues> {
  field: FormInputConfig;
  form: UseFormReturn<any>;
  isLoading: boolean;
  uid: string;
  variant?: 'accent' | 'light';
}

export function ControlledFormInput<T extends FieldValues>({
  field,
  form,
  isLoading,
  uid,
  variant = 'accent',
}: ControlledFormInputProps<T>) {
  const fieldId = `${uid}-${field.name}`;
  const errorId = `${uid}-${field.name}-error`;

  const { errors } = useFormState({
    control: form.control,
    name: field.name as Path<T>,
  });

  const currentError = errors[field.name as Path<T>];
  const hasError = !!currentError;

  const activeVariant = variant ?? field.variant ?? 'accent';

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={fieldId} className="text-sm text-black">
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
          className={`w-full border rounded-lg px-4 py-2.5 text-zinc-600 text-sm outline-none focus:ring-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed
              ${hasError
              ? "border-red-500 focus:border-red-400 focus:ring-red-500/20 bg-greyOneAccent"
              : bgVariants[activeVariant]
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