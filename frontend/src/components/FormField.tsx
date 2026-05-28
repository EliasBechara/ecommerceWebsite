import React from 'react'

interface FormFieldProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string
    containerClass?: string
    error?: string
    variant?: 'accent' | 'light'
}

const bgVariants = {
    accent: 'bg-greyOneAccent',
    light: 'bg-[#F4F4F5]',
}

export const FormField = React.forwardRef<
    HTMLInputElement,
    FormFieldProps
>(
    (
        {
            label,
            className,
            containerClass,
            error,
            variant = 'accent',
            ...props
        },
        ref,
    ) => (
        <div
            className={`flex flex-col gap-1.5 w-full ${containerClass ?? ''
                }`}
        >
            {label && (
                <label className="text-sm font-medium text-zinc-700">
                    {label}
                </label>
            )}

            <input
                ref={ref}
                className={`
                    ${bgVariants[variant]} 
                    border
                    rounded-lg
                    px-4
                    py-3
                    outline-none
                    transition-colors
                    ${error
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-zinc-300 focus:border-zinc-500'
                    }
                    ${className ?? ''}
                `}
                {...props}
            />

            {error && (
                <p className="text-sm text-red-500">
                    {error}
                </p>
            )}
        </div>
    ),
)

FormField.displayName = 'FormField'