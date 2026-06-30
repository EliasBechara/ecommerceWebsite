import { useState } from "react";

type SortOption = "price_asc" | "price_desc" | "newest";

const sortLabels: Record<SortOption, string> = {
    price_asc: "Price: Low to High",
    price_desc: "Price: High to Low",
    newest: "Newest",
};

interface SortDropdownProps {
    onChange: (sort: SortOption) => void;
    currentSort: string;
}

export function SortDropdown({
    onChange,
    currentSort,
}: SortDropdownProps) {
    const [open, setOpen] = useState(false);

    const selected = (currentSort as SortOption) || "newest";

    const handleSelect = (option: SortOption) => {
        onChange(option);
        setOpen(false);
    };

    return (
        <div
            className="relative"
            tabIndex={-1}
            onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) {
                    setOpen(false);
                }
            }}
        >
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-md bg-greyOne px-4 py-2 text-black cursor-pointer"
            >
                {sortLabels[selected]}

                <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    className={`transition-transform duration-200 ${open ? "rotate-180" : ""
                        }`}
                >
                    <path
                        d="M2 4l4 4 4-4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </button>

            <div
                className={`absolute right-0 top-full z-50 mt-2 w-56 origin-top rounded-md border border-greyOne bg-greyOneAccent shadow-md transition-all duration-200 ${open
                        ? "scale-y-100 opacity-100"
                        : "pointer-events-none scale-y-95 opacity-0"
                    }`}
            >
                {(Object.keys(sortLabels) as SortOption[]).map((option) => (
                    <button
                        key={option}
                        type="button"
                        onClick={() => handleSelect(option)}
                        className={`w-full cursor-pointer px-4 py-2 text-left text-sm hover:bg-gray-50 ${selected === option
                                ? "font-medium text-black"
                                : "text-gray-700"
                            }`}
                    >
                        {sortLabels[option]}
                    </button>
                ))}
            </div>
        </div>
    );
}