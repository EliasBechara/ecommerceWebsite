import { prisma } from "../../../../lib/prisma";
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { addItemToCartService, clearCartService, removeItemFromCartService, updateCartItemQuantityService, verifyCartAndCheckoutService } from "../../cart.service";
import { AppError } from "../../../../utils/AppError";

vi.mock('../../../../lib/prisma', () => ({
    prisma: {
        product: { findUnique: vi.fn() },
        cart: { findUnique: vi.fn() },
        cartItem: {
            upsert: vi.fn(),
            deleteMany: vi.fn(),
            updateMany: vi.fn(),
        },
    },
}));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockedPrisma = prisma as any;

describe('addItemToCartService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should add item when valid', async () => {
        const mockProduct = { id: 'product-1', name: 'Shoes', price: 100, stock: 10 };
        const mockCart = { id: 'cart-1', userId: 'user-1' };

        const mockUpdatedCart = {
            id: 'cart-1',
            userId: 'user-1',
            items: [{ product: mockProduct, quantity: 2, price: 100 }],
        };

        mockedPrisma.product.findUnique.mockResolvedValue(mockProduct);
        mockedPrisma.cart.findUnique
            .mockResolvedValueOnce(mockCart)
            .mockResolvedValueOnce(mockUpdatedCart);

        mockedPrisma.cartItem.upsert.mockResolvedValue({});

        const result = await addItemToCartService('user-1', 'product-1', 2);

        expect(mockedPrisma.cartItem.upsert).toHaveBeenCalledWith({
            where: { cartId_productId: { cartId: 'cart-1', productId: 'product-1' } },
            update: { quantity: { increment: 2 } },
            create: { cartId: 'cart-1', productId: 'product-1', quantity: 2, price: 100 },
        });

        expect(mockedPrisma.cart.findUnique).toHaveBeenLastCalledWith({
            where: { userId: 'user-1' },
            include: { items: { include: { product: true } } },
        });

        expect(result).toEqual(mockUpdatedCart);
    });

    it('should throw if product not found', async () => {
        mockedPrisma.product.findUnique.mockResolvedValue(null);
        mockedPrisma.cart.findUnique.mockResolvedValue({ id: 'cart-1', userId: 'user-1' });

        await expect(
            addItemToCartService('user-1', 'product-1', 2)
        ).rejects.toThrow('Product not found');
    });

    it('should throw if cart not found', async () => {
        mockedPrisma.product.findUnique.mockResolvedValue({ id: 'p1', price: 100, stock: 10 });
        mockedPrisma.cart.findUnique.mockResolvedValue(null);

        await expect(
            addItemToCartService('user-1', 'product-1', 2)
        ).rejects.toThrow('Cart not found');
    });

    it('should throw if insufficient stock', async () => {
        mockedPrisma.product.findUnique.mockResolvedValue({
            id: 'p1',
            price: 100,
            stock: 1,
        });

        mockedPrisma.cart.findUnique.mockResolvedValue({
            id: 'cart-1',
            userId: 'user-1',
        });

        await expect(
            addItemToCartService('user-1', 'product-1', 5)
        ).rejects.toThrow('Insufficient stock');
    });
});

describe('removeItemFromCartService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should remove item and return updated cart', async () => {
        const mockUpdatedCart = {
            id: 'cart-1',
            userId: 'user-1',
            items: [],
        };

        mockedPrisma.cartItem.deleteMany.mockResolvedValue({ count: 1 });
        mockedPrisma.cart.findUnique.mockResolvedValue(mockUpdatedCart);

        const result = await removeItemFromCartService('user-1', 'product-1');

        expect(mockedPrisma.cartItem.deleteMany).toHaveBeenCalledWith({
            where: { cart: { userId: 'user-1' }, productId: 'product-1' },
        });

        expect(mockedPrisma.cart.findUnique).toHaveBeenCalledWith({
            where: { userId: 'user-1' },
            include: { items: { include: { product: true } } },
        });

        expect(result).toEqual(mockUpdatedCart);
    });

    it('should throw if item is not in cart', async () => {
        mockedPrisma.cartItem.deleteMany.mockResolvedValue({ count: 0 });

        await expect(
            removeItemFromCartService('user-1', 'product-1')
        ).rejects.toThrow('Item not found in cart');
    });


    it('should throw if cart does not exist', async () => {
        mockedPrisma.cartItem.deleteMany.mockResolvedValue({ count: 1 });
        mockedPrisma.cart.findUnique.mockResolvedValue(null);

        await expect(
            removeItemFromCartService('user-1', 'product-1')
        ).rejects.toThrow('Cart not found');
    });
});


describe('updateCartItemQuantityService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should update quantity when quantity > 0', async () => {
        const mockProduct = { id: 'product-1', name: 'Shoes', price: 100, stock: 10 };

        const mockUpdatedCart = {
            id: 'cart-1',
            userId: 'user-1',
            items: [{ product: mockProduct, quantity: 2, price: 100 }],
        };

        mockedPrisma.cartItem.updateMany.mockResolvedValue({ count: 1 });
        mockedPrisma.cart.findUnique.mockResolvedValue(mockUpdatedCart);

        const result = await updateCartItemQuantityService('user-1', 'product-1', 2);

        expect(mockedPrisma.cartItem.updateMany).toHaveBeenCalledWith({
            where: { cart: { userId: 'user-1' }, productId: 'product-1' },
            data: { quantity: 2 },
        });

        expect(mockedPrisma.cartItem.deleteMany).not.toHaveBeenCalled();

        expect(mockedPrisma.cart.findUnique).toHaveBeenCalledWith({
            where: { userId: 'user-1' },
            include: { items: { include: { product: true } } },
        });

        expect(result).toEqual(mockUpdatedCart);
    });


    it('should delete item when quantity <= 0', async () => {
        const mockUpdatedCart = {
            id: 'cart-1',
            userId: 'user-1',
            items: [],
        };

        mockedPrisma.cartItem.deleteMany.mockResolvedValue({ count: 1 });
        mockedPrisma.cart.findUnique.mockResolvedValue(mockUpdatedCart);

        const result = await updateCartItemQuantityService('user-1', 'product-1', 0);

        expect(mockedPrisma.cartItem.deleteMany).toHaveBeenCalledWith({
            where: { cart: { userId: 'user-1' }, productId: 'product-1' },
        });

        expect(mockedPrisma.cartItem.updateMany).not.toHaveBeenCalled();

        expect(mockedPrisma.cart.findUnique).toHaveBeenCalledWith({
            where: { userId: 'user-1' },
            include: { items: { include: { product: true } } },
        });

        expect(result).toEqual(mockUpdatedCart);
    });

    it('should delete item when quantity is negative', async () => {
        const mockUpdatedCart = {
            id: 'cart-1',
            userId: 'user-1',
            items: [],
        };

        mockedPrisma.cartItem.deleteMany.mockResolvedValue({ count: 1 });
        mockedPrisma.cart.findUnique.mockResolvedValue(mockUpdatedCart);

        const result = await updateCartItemQuantityService('user-1', 'product-1', -5);

        expect(mockedPrisma.cartItem.deleteMany).toHaveBeenCalledWith({
            where: { cart: { userId: 'user-1' }, productId: 'product-1' },
        });

        expect(mockedPrisma.cartItem.updateMany).not.toHaveBeenCalled();

        expect(result).toEqual(mockUpdatedCart);
    });

    it('should throw if item does not exist', async () => {
        mockedPrisma.cartItem.updateMany.mockResolvedValue({ count: 0 });

        await expect(
            updateCartItemQuantityService('user-1', 'product-1', 2)
        ).rejects.toThrow('Item not found in cart');
    });


    it('should throw if deleting non-existent item (quantity <= 0)', async () => {
        mockedPrisma.cartItem.deleteMany.mockResolvedValue({ count: 0 });

        await expect(
            updateCartItemQuantityService('user-1', 'product-1', 0)
        ).rejects.toThrow('Item not found in cart');
    });



    it('should throw if cart does not exist', async () => {
        mockedPrisma.cartItem.updateMany.mockResolvedValue({ count: 1 });
        mockedPrisma.cart.findUnique.mockResolvedValue(null);

        await expect(
            updateCartItemQuantityService('user-1', 'product-1', 2)
        ).rejects.toThrow('Cart not found');
    });
});



describe('clearCartService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should delete all items and return updated cart', async () => {
        const mockCart = { id: 'cart-1', userId: 'user-1' };

        const mockUpdatedCart = {
            id: 'cart-1',
            userId: 'user-1',
            items: [],
        };

        mockedPrisma.cart.findUnique
            .mockResolvedValueOnce(mockCart)
            .mockResolvedValueOnce(mockUpdatedCart);

        mockedPrisma.cartItem.deleteMany.mockResolvedValue({ count: 3 });

        const result = await clearCartService('user-1');

        expect(mockedPrisma.cart.findUnique).toHaveBeenNthCalledWith(1, {
            where: { userId: 'user-1' },
        });

        expect(mockedPrisma.cartItem.deleteMany).toHaveBeenCalledWith({
            where: { cart: { userId: 'user-1' } },
        });

        expect(mockedPrisma.cart.findUnique).toHaveBeenNthCalledWith(2, {
            where: { userId: 'user-1' },
            include: { items: true },
        });

        expect(result).toEqual(mockUpdatedCart);
    });

    it('should throw if cart does not exist', async () => {
        mockedPrisma.cart.findUnique.mockResolvedValue(null);

        await expect(
            clearCartService('user-1')
        ).rejects.toThrow('Cart not found');
    });
});


describe('verifyCartAndCheckoutService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return cart when everything is valid', async () => {
        const mockCart = {
            id: 'cart-1',
            userId: 'user-1',
            items: [
                {
                    quantity: 2,
                    price: 100,
                    product: { id: 'p1', name: 'Shoes', price: 100, stock: 10 },
                },
            ],
        };

        mockedPrisma.cart.findUnique.mockResolvedValue(mockCart);

        const result = await verifyCartAndCheckoutService('user-1');

        expect(result).toEqual(mockCart);
    });

    it('should throw if cart does not exist', async () => {
        mockedPrisma.cart.findUnique.mockResolvedValue(null);

        await expect(
            verifyCartAndCheckoutService('user-1')
        ).rejects.toThrow(new AppError('Cart not found', 404));
    });

    it('should throw if cart is empty', async () => {
        const mockCart = { id: 'cart-1', userId: 'user-1', items: [] };

        mockedPrisma.cart.findUnique.mockResolvedValue(mockCart);

        await expect(
            verifyCartAndCheckoutService('user-1')
        ).rejects.toThrow(new AppError('Cart is empty', 400));
    });

    it('should throw if product no longer exists', async () => {
        const mockCart = {
            id: 'cart-1',
            userId: 'user-1',
            items: [
                {
                    quantity: 2,
                    price: 100,
                    product: null,
                },
            ],
        };

        mockedPrisma.cart.findUnique.mockResolvedValue(mockCart);

        await expect(
            verifyCartAndCheckoutService('user-1')
        ).rejects.toThrow('Product no longer exists');
    });

    it('should throw if stock is insufficient', async () => {
        const mockCart = {
            id: 'cart-1',
            userId: 'user-1',
            items: [
                {
                    quantity: 5,
                    price: 100,
                    product: { id: 'p1', name: 'Shoes', price: 100, stock: 2 },
                },
            ],
        };

        mockedPrisma.cart.findUnique.mockResolvedValue(mockCart);

        await expect(
            verifyCartAndCheckoutService('user-1')
        ).rejects.toThrow('Insufficient stock for Shoes');
    });

    it('should throw if price changed', async () => {
        const mockCart = {
            id: 'cart-1',
            userId: 'user-1',
            items: [
                {
                    quantity: 2,
                    price: 100,
                    product: { id: 'p1', name: 'Shoes', price: 120, stock: 10 },
                },
            ],
        };

        mockedPrisma.cart.findUnique.mockResolvedValue(mockCart);

        await expect(
            verifyCartAndCheckoutService('user-1')
        ).rejects.toThrow('Price changed for Shoes, please review your cart');
    });
});