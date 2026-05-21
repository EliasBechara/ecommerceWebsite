export type OrderStatus =
    | "PENDING"
    | "CONFIRMED"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED";

export interface OrderItem {
    id: string;

    productId: string;

    quantity: number;

    unitPrice: number;

    product: {
        id: string;
        name: string;
        imageUrl: string;
        price: number;
    };
}

export interface Order {
    id: string;

    userId: string;

    total: number;

    status: OrderStatus;

    items: OrderItem[];

    createdAt: string;
    updatedAt: string;
}

export interface CreateOrderBody {
    items: {
        productId: string;
        quantity: number;
    }[];
}

export interface UpdateOrderStatusBody {
    status: OrderStatus;
}