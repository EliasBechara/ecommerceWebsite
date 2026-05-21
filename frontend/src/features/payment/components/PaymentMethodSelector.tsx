import type { PaymentMethod } from "../types";

interface Props {
    methods: PaymentMethod[];
    selected: PaymentMethod;
    onSelect: (method: PaymentMethod) => void;
}

export function PaymentMethodSelector({ methods, selected, onSelect }: Props) {
    return (
        <div className="border rounded-xl p-5">
            <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
            <div className="grid grid-cols-2 gap-3">
                {methods.map((method) => (
                    <button
                        key={method}
                        type="button"
                        onClick={() => onSelect(method)}
                        className={`border rounded-lg p-4 transition text-left cursor-pointer ${selected === method
                            ? "border-black bg-black text-white"
                            : "border-gray-300 hover:border-black"
                            }`}
                    >
                        {method.replaceAll("_", " ")}
                    </button>
                ))}
            </div>
        </div>
    );
}