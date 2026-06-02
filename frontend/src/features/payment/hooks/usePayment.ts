import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGetOrderByIdQuery } from "../../order/api/orderApi";
import { useCreatePaymentMutation, useConfirmPaymentMutation } from "../api/paymentApi";
import type { PaymentMethod } from "../types";
import { useDispatch } from "react-redux";
import { cartApi } from "../../cart/api/cartApi";
import { clearCart } from "../../cart/cartSlice";
import { orderApi } from "../../order/api/orderApi";

export function usePayment() {
    const navigate = useNavigate();
    const { orderId } = useParams<{ orderId: string }>();
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("PIX");
    const dispatch = useDispatch();

    const { data: order, isLoading: loadingOrder, error: orderError } =
        useGetOrderByIdQuery(orderId!, { skip: !orderId });

    const [createPayment, { isLoading: creatingPayment }] = useCreatePaymentMutation();
    const [confirmPayment, { isLoading: confirmingPayment }] = useConfirmPaymentMutation();

    const handlePayment = async () => {
        if (!orderId) return;
        try {
            const payment = await createPayment({
                orderId,
                method: selectedMethod,
                currency: "BRL",
            }).unwrap();

            await confirmPayment({
                paymentId: payment.id,
                data: {
                    paymentId: payment.id,
                    providerReference: payment.providerReference,
                },
            }).unwrap();

            dispatch(clearCart());

            dispatch(orderApi.util.invalidateTags([{ type: "Order", id: orderId }]));
            dispatch(orderApi.util.invalidateTags([{ type: "Order", id: "LIST" }]));
            dispatch(cartApi.util.invalidateTags(["Cart"]));


            navigate(`/orders/success/${orderId}`);

        } catch (error) {
            console.error(error);
        }
    };

    return {
        order,
        loadingOrder,
        orderError,
        selectedMethod,
        setSelectedMethod,
        handlePayment,
        isProcessing: creatingPayment || confirmingPayment,
    };
}