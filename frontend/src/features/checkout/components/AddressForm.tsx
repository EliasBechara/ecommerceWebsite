import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { Address } from "../types";

interface AddressFormProps {
    register: UseFormRegister<Address>;
    errors: FieldErrors<Address>;
}

const FormField = ({
    className,
    ...props
}: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
        className={`border border-zinc-300 rounded-lg px-4 py-3 outline-none ${className ?? ""}`}
        {...props}
    />
);

export const AddressForm = ({ register, errors }: AddressFormProps) => {
    return (
        <section className="bg-white border border-zinc-200 rounded-2xl p-6">
            <h2 className="text-xl font-medium mb-6">Delivery address</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                    {...register("fullName", { required: "Full name is required", minLength: { value: 2, message: "Name is too short" } })}
                    placeholder="Full name"
                />
                <FormField
                    {...register("phone", { required: "Phone number is required", minLength: { value: 8, message: "Invalid phone number" } })}
                    placeholder="Phone number"
                />
                <FormField
                    {...register("street", { required: "Street is required" })}
                    placeholder="Street address"
                    className="md:col-span-2"
                />
                <FormField
                    {...register("number", { required: "House number is required" })}
                    placeholder="House number"
                />
                <FormField
                    {...register("city", { required: "City is required" })}
                    placeholder="City"
                />
                <FormField
                    {...register("state", { required: "State is required" })}
                    placeholder="State"
                />
                <FormField
                    {...register("zipCode", { required: "ZIP code is required" })}
                    placeholder="ZIP code"
                    className="md:col-span-2"
                />
            </div>
            {Object.keys(errors).length > 0 && (
                <div className="mt-4 flex flex-col gap-1">
                    {Object.values(errors).map((error) => (
                        <p key={error.message} className="text-red-500 text-sm">
                            {error.message}
                        </p>
                    ))}
                </div>
            )}
        </section>
    );
};