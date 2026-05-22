type Props = {
    value: string;
    onChange: (val: string) => void;
    onClose: () => void;
};

export const SearchInput = ({ value, onChange, onClose }: Props) => {
    return (
        <div className="p-4 flex items-center gap-2">
            <input
                autoFocus
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Search..."
                className="w-full border p-2 rounded outline-none"
            />
            <button
                className="p-2 hover:bg-gray-100 rounded cursor-pointer"
                onClick={onClose}
            >
                ✕
            </button>
        </div>
    );
};