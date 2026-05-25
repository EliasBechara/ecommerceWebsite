interface FormSectionProps extends React.FormHTMLAttributes<HTMLFormElement> {
    title: string;
    children: React.ReactNode;
}

export const FormSection = ({ title, children, ...props }: FormSectionProps) => {
    return (
        <form className="flex flex-col gap-4 max-w-xl" {...props}>
            <h2 className="text-xl font-bold mb-2 text-zinc-900">{title}</h2>
            {children}
        </form>
    );
};