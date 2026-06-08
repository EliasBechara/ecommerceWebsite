import { prisma } from "../../../lib/prisma";
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { addItemToCartService, clearCartService, getCartService, mergeCartService, removeItemFromCartService, updateCartItemQuantityService, verifyCartAndCheckoutService } from "../cart.service";
import { AppError } from "../../../utils/AppError";

vi.mock('../../../lib/prisma', () => ({
    prisma: {
        product: { findUnique: vi.fn() },
        cart: { findUnique: vi.fn() },
        cartItem: {
            upsert: vi.fn(),
            deleteMany: vi.fn(),
            updateMany: vi.fn(),
        },
        $transaction: vi.fn(),
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

describe('getCartService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return cart with items when found', async () => {
        const mockCart = {
            id: 'cart-1',
            userId: 'user-1',
            items: [{ product: { id: 'p1', name: 'Shoes', price: 100, stock: 10 }, quantity: 2, price: 100 }],
        };

        mockedPrisma.cart.findUnique.mockResolvedValue(mockCart);

        const result = await getCartService('user-1');

        expect(mockedPrisma.cart.findUnique).toHaveBeenCalledWith({
            where: { userId: 'user-1' },
            include: { items: { include: { product: true } } },
        });
        expect(result).toEqual(mockCart);
    });

    it('should throw 404 if cart not found', async () => {
        mockedPrisma.cart.findUnique.mockResolvedValue(null);

        await expect(getCartService('user-1')).rejects.toThrow(
            new AppError('Cart not found', 404),
        );
    });
});


describe('mergeCartService', () => {
    const txMock = {
        cart: { findUnique: vi.fn(), create: vi.fn() },
        product: { findMany: vi.fn() },
        cartItem: { upsert: vi.fn() },
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockedPrisma.$transaction.mockImplementation(
            async (cb: (tx: typeof txMock) => Promise<unknown>) => cb(txMock),
        );
    });

    const baseCart = { id: 'cart-1', userId: 'user-1' };
    const baseProduct = { id: 'product-1', name: 'Shoes', price: 100, stock: 10 };
    const updatedCart = {
        id: 'cart-1',
        userId: 'user-1',
        items: [{ product: baseProduct, quantity: 2, price: 100 }],
    };

    it('should merge guest cart into existing cart', async () => {
        txMock.cart.findUnique
            .mockResolvedValueOnce(baseCart)
            .mockResolvedValueOnce(updatedCart);
        txMock.product.findMany.mockResolvedValue([baseProduct]);
        txMock.cartItem.upsert.mockResolvedValue({});

        const result = await mergeCartService('user-1', [
            { productId: 'product-1', quantity: 2 },
        ]);

        expect(txMock.cart.create).not.toHaveBeenCalled();
        expect(txMock.cartItem.upsert).toHaveBeenCalledWith({
            where: { cartId_productId: { cartId: 'cart-1', productId: 'product-1' } },
            update: { quantity: 2, price: 100 },
            create: { cartId: 'cart-1', productId: 'product-1', quantity: 2, price: 100 },
        });
        expect(result).toEqual(updatedCart);
    });

    it('should create a cart if one does not exist', async () => {
        txMock.cart.findUnique
            .mockResolvedValueOnce(null)
            .mockResolvedValueOnce(updatedCart);
        txMock.cart.create.mockResolvedValue(baseCart);
        txMock.product.findMany.mockResolvedValue([baseProduct]);
        txMock.cartItem.upsert.mockResolvedValue({});

        await mergeCartService('user-1', [{ productId: 'product-1', quantity: 2 }]);

        expect(txMock.cart.create).toHaveBeenCalledWith({
            data: { userId: 'user-1' },
        });
    });

    it('should cap quantity to product stock', async () => {
        const lowStockProduct = { ...baseProduct, stock: 1 };

        txMock.cart.findUnique
            .mockResolvedValueOnce(baseCart)
            .mockResolvedValueOnce(updatedCart);
        txMock.product.findMany.mockResolvedValue([lowStockProduct]);
        txMock.cartItem.upsert.mockResolvedValue({});

        await mergeCartService('user-1', [{ productId: 'product-1', quantity: 99 }]);

        expect(txMock.cartItem.upsert).toHaveBeenCalledWith(
            expect.objectContaining({
                update: { quantity: 1, price: 100 },
                create: expect.objectContaining({ quantity: 1 }),
            }),
        );
    });

    it('should skip items with quantity <= 0 after stock cap', async () => {
        const outOfStockProduct = { ...baseProduct, stock: 0 };

        txMock.cart.findUnique
            .mockResolvedValueOnce(baseCart)
            .mockResolvedValueOnce(updatedCart);
        txMock.product.findMany.mockResolvedValue([outOfStockProduct]);

        await mergeCartService('user-1', [{ productId: 'product-1', quantity: 5 }]);

        expect(txMock.cartItem.upsert).not.toHaveBeenCalled();
    });

    it('should skip items whose product is not found', async () => {
        txMock.cart.findUnique
            .mockResolvedValueOnce(baseCart)
            .mockResolvedValueOnce(updatedCart);
        txMock.product.findMany.mockResolvedValue([]);

        await mergeCartService('user-1', [{ productId: 'ghost-product', quantity: 2 }]);

        expect(txMock.cartItem.upsert).not.toHaveBeenCalled();
    });

    it('should throw 500 if cart is not found after merge', async () => {
        txMock.cart.findUnique
            .mockResolvedValueOnce(baseCart)
            .mockResolvedValueOnce(null);
        txMock.product.findMany.mockResolvedValue([baseProduct]);
        txMock.cartItem.upsert.mockResolvedValue({});

        await expect(
            mergeCartService('user-1', [{ productId: 'product-1', quantity: 2 }]),
        ).rejects.toThrow(new AppError('Cart not found after merge', 500));
    });
});