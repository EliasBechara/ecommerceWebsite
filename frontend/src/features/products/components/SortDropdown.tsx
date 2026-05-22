import { useState } from "react";

type SortOption = "price_asc" | "price_desc" | "newest";

const sortLabels: Record<SortOption, string> = {
    price_asc: "Price: Low to High",
    price_desc: "Price: High to Low",
    newest: "Newest",
};

export function SortDropdown({ onChange, currentSort }: {
    onChange: (sort: SortOption) => void;
    currentSort: string;
}) {
    const [open, setOpen] = useState(false);
    const selected = (currentSort as SortOption) || "newest";

    const handleSelect = (option: SortOption) => {
        onChange(option);
        setOpen(false);
    };

    return (
        <div
            className="relative"
            onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false); }}
            tabIndex={-1}
        >
            <button
                onClick={() => setOpen((o) => !o)}
                className="absolute right-24 top-27 flex items-center gap-2 px-4 py-2 bg-greyOne rounded-md text-md text-black cursor-pointer"
            >
                {sortLabels[selected]}
                <svg
                    width="12" height="12" viewBox="0 0 12 12" fill="none"
                    className={`transition-transform duration-200 ${open ? "rotate-180" : "rotate-0"}`}
                >
                    <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>

            <div className={`absolute right-20 top-36 mt-1 w-48 text-black bg-greyOneAccent border border-greyOne rounded-md shadow-sm z-10 cursor-pointer origin-top transition-all duration-200 ${open
                ? "opacity-100 scale-y-100 pointer-events-auto"
                : "opacity-0 scale-y-0 pointer-events-none"
                }`}>
                {(Object.keys(sortLabels) as SortOption[]).map((option) => (
                    <button
                        key={option}
                        onClick={() => handleSelect(option)}
                        className={`cursor-pointer w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${selected === option ? "text-black font-medium" : "text-gray-700"
                            }`}
                    >
                        {sortLabels[option]}
                    </button>
                ))}
            </div>
        </div>
    );
}