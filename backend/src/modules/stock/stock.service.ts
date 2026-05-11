import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/AppError';

export const checkStockBySlug = async (
    slug: string | undefined,
    quantity: number,
) => {
    if (!slug) {
        throw new AppError('Product slug is required', 400);
    }

    const product = await prisma.product.findUnique({
        where: { slug },
        select: { stock: true, name: true },
    });

    if (!product) {
        throw new AppError('Product not found', 404);
    }

    return {
        slug,
        name: product.name,
        stock: product.stock,
        requested: quantity,
        isAvailable: product.stock >= quantity,
    };
};

export const decrementProductStock = async (
    slug: string | undefined,
    quantity: number,
) => {
    if (!slug) {
        throw new AppError('Product slug is required', 400);
    }
    const updated = await prisma.product.updateMany({
        where: {
            slug,
            stock: {
                gte: quantity,
            },
        },
        data: {
            stock: {
                decrement: quantity,
            },
        },
    });

    if (updated.count === 0) {
        const existingProduct =
            await prisma.product.findUnique({
                where: { slug },
                select: { stock: true },
            });

        if (!existingProduct) {
            throw new AppError('Product not found', 404);
        }

        throw new AppError(
            `Insufficient stock. Available: ${existingProduct.stock}, requested: ${quantity}`,
            409,
        );
    }

    const finalProduct = await prisma.product.findUnique({
        where: { slug },
        select: {
            slug: true,
            name: true,
            stock: true,
        },
    });

    return finalProduct;
};