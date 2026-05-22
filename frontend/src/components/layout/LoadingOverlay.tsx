

export function LoadingOverlay({ message = "Loading…" }: { message?: string }) {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-greyOne/50 backdrop-blur-sm">
            <svg
                width="60" height="60" viewBox="0 0 36 36"
                fill="none" xmlns="http://www.w3.org/2000/svg"
                className="animate-spin"
            >
                <circle cx="18" cy="18" r="14" stroke="#e5e7eb" strokeWidth="3" />
                <path d="M18 4a14 14 0 0 1 14 14" stroke="#000" strokeWidth="3" strokeLinecap="round" />
            </svg>
            <span className="text-sm text-gray-500">{message}</span>
        </div>
    );
}