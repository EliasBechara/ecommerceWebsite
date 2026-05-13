import { prisma } from '../../lib/prisma';

export const cleanDatabase = async () => {
    await prisma.checkoutSessionItem.deleteMany();
    await prisma.checkoutSession.deleteMany();

    await prisma.cartItem.deleteMany();
    await prisma.cart.deleteMany();

    await prisma.product.deleteMany();
    await prisma.user.deleteMany();
};