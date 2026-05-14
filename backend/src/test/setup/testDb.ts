import { prisma } from '../../lib/prisma';

export const cleanDatabase = async () => {
    await prisma.checkoutSessionItem.deleteMany();
    await prisma.checkoutSession.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.cart.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();
    await prisma.user.deleteMany();
};