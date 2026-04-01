import { useState, type ChangeEvent, type SubmitEvent } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthField {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
}

interface AuthCardProps {
  title?: string;
  subtitle?: string;
  fields?: AuthField[];
  submitLabel?: string;
  footerText?: string;
  footerActionLabel?: string;
  onSubmit?: (values: Record<string, string>) => void;
  onFooterAction?: () => void;
  className?: string;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

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

// ─── Component ────────────────────────────────────────────────────────────────

export default function AuthCard({
  title = "",
  subtitle = "",
  fields = DEFAULT_FIELDS,
  submitLabel = "",
  footerText = "",
  footerActionLabel = "",
  onSubmit,
  onFooterAction,
  className = "",
}: AuthCardProps) {
  const initialValues = Object.fromEntries(fields.map((f) => [f.name, ""]));
  const [values, setValues] = useState<Record<string, string>>(initialValues);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValues((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit?.(values);
  };

  return (
    <div
      className={`bg-zinc-900 border border-zinc-700/50 rounded-2xl p-10 flex flex-col gap-6 w-full max-w-sm shadow-2xl ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-white">{title}</h1>
        {subtitle && <p className="text-sm text-zinc-400">{subtitle}</p>}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {fields.map((field) => (
          <div key={field.name} className="flex flex-col gap-1.5">
            <label htmlFor={field.name} className="text-sm text-zinc-400">
              {field.label}
            </label>
            <input
              id={field.name}
              name={field.name}
              type={field.type ?? "text"}
              placeholder={field.placeholder}
              value={values[field.name] ?? ""}
              onChange={handleChange}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-zinc-500 outline-none focus:border-zinc-500 transition-colors"
            />
          </div>
        ))}

        <button
          type="submit"
          className="mt-2 bg-white text-zinc-900 font-medium py-2.5 rounded-lg hover:bg-zinc-100 transition-colors text-sm cursor-pointer"
        >
          {submitLabel}
        </button>

        {(footerText || footerActionLabel) && (
          <span className="text-sm text-zinc-400">
            {footerText}{" "}
            <button
              type="button"
              onClick={onFooterAction}
              className="cursor-pointer text-white hover:underline"
            >
              {footerActionLabel}
            </button>
          </span>
        )}
      </form>
    </div>
  );
}
