import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useUpdateAddressMutation, useConfirmCheckoutMutation } from "../api/checkoutApi";
import type { Address } from "../types";

export const useCheckoutForm = (sessionId: string) => {
    const navigate = useNavigate();
    const [updateAddress, { isLoading: updatingAddress }] = useUpdateAddressMutation();
    const [confirmCheckout, { isLoading: confirming }] = useConfirmCheckoutMutation();
    const form = useForm<Address>();

    const onSubmit = form.handleSubmit(async (data) => {
        try {
            await updateAddress({ sessionId, address: data }).unwrap();
            await confirmCheckout(sessionId).unwrap();
            navigate("/order-success");
        } catch (error) {
            console.error(error);
        }
    });

    return { ...form, onSubmit, updatingAddress, confirming };
};