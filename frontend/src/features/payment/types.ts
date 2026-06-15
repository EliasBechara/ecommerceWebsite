export type PaymentMethod =
    | "CREDIT_CARD"
    | "DEBIT_CARD"
    | "PIX"
    | "BOLETO";

export type PaymentStatusType =
    | "PENDING"
    | "CONFIRMED"
    | "FAILED";

export interface CreatePaymentBody {
    orderId: string;
    method: PaymentMethod;
    currency?: string;
}

export interface ConfirmPaymentBody {
    paymentId: string;
    providerReference: string;
}

export interface Payment {
    id: string;
    orderId: string;
    userId: string;

    method: PaymentMethod;
    currency: string;

    amount: number;

    status: PaymentStatusType;

    providerReference: string;

    createdAt: string;
    updatedAt: string;
}

export interface PaymentStatus {
    paymentId: string;
    orderId: string;

    status: PaymentStatusType;

    method: PaymentMethod;

    amount: number;
    currency: string;

    createdAt: string;
    updatedAt: string;
}