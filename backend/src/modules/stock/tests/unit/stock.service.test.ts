/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    checkStockBySlug,
    decrementProductStock,
} from '../../stock.service';
import { AppError } from '../../../../utils/AppError';
import { prisma } from '../../../../lib/prisma';

vi.mock('../../../lib/prisma', () => ({
    prisma: {
        product: {
            findUnique: vi.fn(),
            update: vi.fn(),
        },
    },
}));

describe('checkStockBySlug', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should throw if slug is missing', async () => {
        await expect(
            checkStockBySlug(undefined, 2),
        ).rejects.toThrow(
            new AppError('Product slug is required', 400),
        );
    });

    it('should throw if product is not found', async () => {
        vi.mocked(prisma.product.findUnique).mockResolvedValue(
            null,
        );

        await expect(
            checkStockBySlug('rtx-5080', 2),
        ).rejects.toThrow(
            new AppError('Product not found', 404),
        );
    });

    it('should return stock validation data', async () => {
        vi.mocked(prisma.product.findUnique).mockResolvedValue({
            stock: 10,
            name: 'RTX 5080',
        } as any);

        const result = await checkStockBySlug(
            'rtx-5080',
            2,
        );

        expect(result).toEqual({
            slug: 'rtx-5080',
            name: 'RTX 5080',
            stock: 10,
            requested: 2,
            isAvailable: true,
        });

        expect(prisma.product.findUnique).toHaveBeenCalledWith({
            where: { slug: 'rtx-5080' },
            select: {
                stock: true,
                name: true,
            },
        });
    });

    it('should return unavailable when stock is insufficient', async () => {
        vi.mocked(prisma.product.findUnique).mockResolvedValue({
            stock: 1,
            name: 'RTX 5080',
        } as any);

        const result = await checkStockBySlug(
            'rtx-5080',
            5,
        );

        expect(result.isAvailable).toBe(false);
    });
});

describe('decrementProductStock', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should throw if slug is missing', async () => {
        await expect(
            decrementProductStock(undefined, 1),
        ).rejects.toThrow(
            new AppError('Product slug is required', 400),
        );
    });

    it('should throw if product is not found', async () => {
        vi.mocked(prisma.product.findUnique).mockResolvedValue(
            null,
        );

        await expect(
            decrementProductStock('rtx-5080', 1),
        ).rejects.toThrow(
            new AppError('Product not found', 404),
        );
    });

    it('should throw if stock is insufficient', async () => {
        vi.mocked(prisma.product.findUnique).mockResolvedValue({
            stock: 2,
        } as any);

        await expect(
            decrementProductStock('rtx-5080', 5),
        ).rejects.toThrow(
            new AppError(
                'Insufficient stock. Available: 2, requested: 5',
                409,
            ),
        );
    });

    it('should decrement stock successfully', async () => {
        vi.mocked(prisma.product.findUnique).mockResolvedValue({
            stock: 10,
        } as any);

        vi.mocked(prisma.product.update).mockResolvedValue({
            slug: 'rtx-5080',
            name: 'RTX 5080',
            stock: 8,
        } as any);

        const result = await decrementProductStock(
            'rtx-5080',
            2,
        );

        expect(result).toEqual({
            slug: 'rtx-5080',
            name: 'RTX 5080',
            stock: 8,
        });

        expect(prisma.product.update).toHaveBeenCalledWith({
            where: {
                slug: 'rtx-5080',
            },
            data: {
                stock: {
                    decrement: 2,
                },
            },
            select: {
                slug: true,
                name: true,
                stock: true,
            },
        });
    });
});