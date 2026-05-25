interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    containerClass?: string;
}

export const FormField = ({
    label,
    className,
    containerClass,
    ...props
}: FormFieldProps) => (
    <div className={`flex flex-col gap-1.5 w-full ${containerClass ?? ""}`}>

        {label && (
            <label className="text-sm font-medium text-zinc-700">
                {label}
            </label>
        )}

        <input
            className={`bg-greyOneAccent border border-zinc-300 rounded-lg px-4 py-3 outline-none focus:border-zinc-500 transition-colors ${className ?? ""}`}
            {...props}
        />
    </div>
);