import type { FieldValues, UseFormReturn, Path } from "react-hook-form";

interface AuthField {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
}

interface AuthCardProps<T extends FieldValues> {
  title?: string;
  subtitle?: string;
  fields?: AuthField[];
  submitLabel?: string;
  footerText?: string;
  footerActionLabel?: string;
  form: UseFormReturn<T>;
  onSubmit: (values: T) => void;
  onFooterAction?: () => void;
  className?: string;
  isLoading?: boolean;
}

const DEFAULT_FIELDS: AuthField[] = [
  {
    name: "email",
    label: "Email",
    type: "email",
    placeholder: "you@example.com",
  },
  {
    name: "password",
    label: "Password",
    type: "password",
    placeholder: "••••••••",
  },
];

export default function AuthCard<T extends FieldValues>({
  title = "",
  subtitle = "",
  fields = DEFAULT_FIELDS,
  submitLabel = "",
  footerText = "",
  footerActionLabel = "",
  form,
  onSubmit,
  onFooterAction,
  className = "",
  isLoading = false,
}: AuthCardProps<T>) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  return (
    <div
      className={`bg-zinc-900 border border-zinc-700/50 rounded-2xl p-10 flex flex-col gap-6 w-full max-w-sm shadow-2xl ${className}`}
    >
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-white">{title}</h1>
        {subtitle && <p className="text-sm text-zinc-400">{subtitle}</p>}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
        {fields.map((field) => {
          const error = errors[field.name as Path<T>];
          const errorMessage = error?.message as string | undefined;

          return (
            <div key={field.name} className="flex flex-col gap-1.5">
              <label htmlFor={field.name} className="text-sm text-zinc-400">
                {field.label}
              </label>
              <input
                id={field.name}
                type={field.type ?? "text"}
                placeholder={field.placeholder}
                disabled={isLoading}
                {...register(field.name as Path<T>)}
                className={`bg-zinc-800 border ${
                  error ? "border-red-500" : "border-zinc-700"
                } rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-zinc-500 transition-colors`}
              />
              {errorMessage && (
                <span className="text-xs text-red-500 ml-1">
                  {errorMessage}
                </span>
              )}
            </div>
          );
        })}

        <button
          type="submit"
          disabled={isLoading}
          className="mt-2 bg-white text-zinc-900 font-medium py-2.5 rounded-lg hover:bg-zinc-100 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isLoading ? "Processing..." : submitLabel}
        </button>

        {errors.root && (
          <p className="text-sm text-red-500 text-center">
            {errors.root.message}
          </p>
        )}

        {(footerText || footerActionLabel) && (
          <span className="text-sm text-zinc-400 text-center">
            {footerText}{" "}
            <button
              type="button"
              onClick={onFooterAction}
              className="text-white hover:underline cursor-pointer"
            >
              {footerActionLabel}
            </button>
          </span>
        )}
      </form>
    </div>
  );
}
