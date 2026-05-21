import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGetOrderByIdQuery } from "../../order/api/orderApi";
import { useCreatePaymentMutation, useConfirmPaymentMutation } from "../api/paymentApi";
import type { PaymentMethod } from "../types";

export function usePayment() {
    const navigate = useNavigate();
    const { orderId } = useParams<{ orderId: string }>();
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("PIX");

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

            navigate("/order-success");
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