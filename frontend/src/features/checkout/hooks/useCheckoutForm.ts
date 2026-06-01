import { useNavigate } from "react-router-dom";
import {
    useUpdateAddressMutation,
    useConfirmCheckoutMutation,
} from "../api/checkoutApi";


export const useCheckoutForm = (sessionId: string) => {
    const navigate = useNavigate();
    const [updateAddress, { isLoading: updatingAddress }] = useUpdateAddressMutation();
    const [confirmCheckout, { isLoading: confirming }] = useConfirmCheckoutMutation();

    const onSubmit = async (addressId: string) => {
        try {
            console.log("updateAddress payload:", { sessionId, addressId });
            await updateAddress({ sessionId, addressId }).unwrap();
            console.log("confirmCheckout payload:", sessionId);
            const result = await confirmCheckout(sessionId).unwrap();
            navigate(`/payment/${result.order.id}`);
        } catch (error) {
            console.error(error);
        }
    };

    return { onSubmit, updatingAddress, confirming };
};