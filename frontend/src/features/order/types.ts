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

    address: {
        streetAddress: string;
        houseNumber: string;
        city: string;
        state: string;
        zipCode: string;
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

    address: {
        streetAddress: string;
        houseNumber: string;
        city: string;
        state: string;
        zipCode: string;
    };
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