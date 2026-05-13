import { prisma } from '../../../lib/prisma';

export const createUser = async () => {
    return prisma.user.create({
        data: {
            email: `test-${Date.now()}@test.com`,
            password: 'hashed-password',
        },
    });
};