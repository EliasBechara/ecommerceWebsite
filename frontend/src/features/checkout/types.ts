export interface Address {
    fullName: string;
    phone: string;
    street: string;
    number: string;
    city: string;
    state: string;
    zipCode: string;
}

export interface CheckoutItem {
    productId: string;

    product: {
        name: string;
        image?: string;
    };

    quantity: number;
    unitPrice: number;
    subtotal: number;
}

export interface CheckoutSummary {
    itemsTotal: number;
    shippingCost: number;
    total: number;
}

export interface CheckoutSession {
    id: string;

    status: "PENDING" | "CONFIRMED" | "EXPIRED";

    items: CheckoutItem[];

    address?: Address;

    createdAt: string;
    updatedAt: string;
}

export interface ConfirmCheckoutResponse {
    confirmed: CheckoutSession;
    order: { id: string };
}