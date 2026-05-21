import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import {
    useUpdateAddressMutation,
    useConfirmCheckoutMutation,
} from "../api/checkoutApi";

import type { Address } from "../types";

export const useCheckoutForm = (
    sessionId: string
) => {
    const navigate = useNavigate();

    const [
        updateAddress,
        { isLoading: updatingAddress },
    ] = useUpdateAddressMutation();

    const [
        confirmCheckout,
        { isLoading: confirming },
    ] = useConfirmCheckoutMutation();

    const form = useForm<Address>();

    const onSubmit = form.handleSubmit(
        async (data) => {
            try {
                await updateAddress({
                    sessionId,
                    address: data,
                }).unwrap();

                const result =
                    await confirmCheckout(
                        sessionId
                    ).unwrap();

                navigate(
                    `/payment/${result.order.id}`
                );
            } catch (error) {
                console.error(error);
            }
        }
    );

    return {
        ...form,
        onSubmit,
        updatingAddress,
        confirming,
    };
};