import type { ReactNode } from 'react'

interface AccountSectionProps {
    title: string
    children: ReactNode
    className?: string
}

export const AccountSection = ({
    title,
    children,
    className = '',
}: AccountSectionProps) => {
    return (
        <section
            className={`flex flex-col max-w-xl ${className}`}
        >
            <h2 className="text-xl font-bold mb-4 text-zinc-900">
                {title}
            </h2>

            {children}
        </section>
    )
}