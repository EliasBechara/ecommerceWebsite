import { useId } from "react";
import type { FieldValues, UseFormReturn } from "react-hook-form";

import { Spinner } from "../../../components/icons/Spinner";
import { ControlledFormInput } from "../../../components/forms/ControlledFormInput";

interface AuthField {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
}

interface AuthCardProps<T extends FieldValues> {
  title?: string;
  subtitle?: string;
  fields: AuthField[];
  submitLabel?: string;
  footerText?: string;
  footerActionLabel?: string;
  form: UseFormReturn<T>;
  onSubmit: (values: T) => void;
  onFooterAction?: () => void;
  className?: string;
  isLoading?: boolean;
}

export default function AuthCard<T extends FieldValues>({
  title = "",
  subtitle = "",
  fields,
  submitLabel = "Submit",
  footerText = "",
  footerActionLabel = "",
  form,
  onSubmit,
  onFooterAction,
  className = "",
  isLoading = false,
}: AuthCardProps<T>) {
  const {
    handleSubmit,
    formState: { errors },
  } = form;

  const uid = useId();

  return (
    <div className="w-full flex items-center justify-center h-screen bg-greyOne">
      <div
        className={`bg-greyOneAccent rounded-2xl p-12 gap-6  flex flex-col justify-between w-full max-w-md shadow-2xl ${className}`}
      >
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold text-black">{title}</h1>
          {subtitle && <p className="text-sm text-zinc-600">{subtitle}</p>}
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-3"
          noValidate
        >
          {fields.map((field) => (
            <ControlledFormInput
              key={field.name}
              field={field}
              form={form}
              isLoading={isLoading}
              uid={uid}
            />
          ))}
          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 bg-black text-white font-medium py-2.5 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
          >
            {isLoading && <Spinner />}
            {isLoading ? "Processing..." : submitLabel}
          </button>

          {errors.root && (
            <p role="alert" className="text-sm text-red-500 text-center">
              {errors.root.message}
            </p>
          )}

          {(footerText || footerActionLabel) && (
            <span className="text-sm text-zinc-600 text-center">
              {footerText}{" "}
              <button
                type="button"
                onClick={onFooterAction}
                className="text-black hover:underline cursor-pointer"
              >
                {footerActionLabel}
              </button>
            </span>
          )}
        </form>
      </div>
    </div>
  );
}
