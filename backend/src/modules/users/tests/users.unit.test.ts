import { prisma } from '../../../lib/prisma';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    getUserProfile,
    updateUserProfile,
    getUserAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
} from '../users.service';
import { AppError } from '../../../utils/AppError';

vi.mock('../../../lib/prisma', () => ({
    prisma: {
        user: {
            findUnique: vi.fn(),
            update: vi.fn(),
        },
        address: {
            findUnique: vi.fn(),
            findMany: vi.fn(),
            findFirst: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            updateMany: vi.fn(),
            delete: vi.fn(),
            count: vi.fn(),
        },
    },
}));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockedPrisma = prisma as any;

// ── Shared fixtures ───────────────────────────────────────────────────────────

const mockUser = {
    id: 'user-1',
    email: 'john@example.com',
    firstName: 'John',
    lastName: 'Doe',
    phoneNumber: '11999999999',
    createdAt: new Date(),
};

const mockAddress = {
    id: 'addr-1',
    userId: 'user-1',
    label: 'Home',
    recipientName: 'John Doe',
    phoneNumber: '11999999999',
    street: 'Rua das Flores',
    number: '123',
    complement: null,
    district: 'Centro',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01310-100',
    country: 'BR',
    isDefault: true,
    createdAt: new Date(),
};

const addressInput = {
    recipientName: 'John Doe',
    street: 'Rua das Flores',
    number: '123',
    district: 'Centro',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01310-100',
    country: 'BR',
};


describe('getUserProfile', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return user profile when found', async () => {
        mockedPrisma.user.findUnique.mockResolvedValue(mockUser);

        const result = await getUserProfile('user-1');

        expect(mockedPrisma.user.findUnique).toHaveBeenCalledWith({
            where: { id: 'user-1' },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phoneNumber: true,
                createdAt: true,
            },
        });

        expect(result).toEqual(mockUser);
    });

    it('should throw 404 if user does not exist', async () => {
        mockedPrisma.user.findUnique.mockResolvedValue(null);

        await expect(getUserProfile('user-1')).rejects.toThrow(
            new AppError('User not found', 404),
        );
    });
});



describe('updateUserProfile', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should update and return the user profile', async () => {
        const input = { firstName: 'Jane', lastName: 'Doe', phoneNumber: '11888888888' };
        const updatedUser = { ...mockUser, ...input };

        mockedPrisma.user.update.mockResolvedValue(updatedUser);

        const result = await updateUserProfile('user-1', input);

        expect(mockedPrisma.user.update).toHaveBeenCalledWith({
            where: { id: 'user-1' },
            data: {
                firstName: 'Jane',
                lastName: 'Doe',
                phoneNumber: '11888888888',
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phoneNumber: true,
            },
        });

        expect(result).toEqual(updatedUser);
    });

    it('should set phoneNumber to null when not provided', async () => {
        const input = { firstName: 'Jane', lastName: 'Doe' };

        mockedPrisma.user.update.mockResolvedValue({ ...mockUser, phoneNumber: null });

        await updateUserProfile('user-1', input);

        expect(mockedPrisma.user.update).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({ phoneNumber: null }),
            }),
        );
    });
});



describe('getUserAddresses', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return addresses ordered by default then createdAt', async () => {
        mockedPrisma.address.findMany.mockResolvedValue([mockAddress]);

        const result = await getUserAddresses('user-1');

        expect(mockedPrisma.address.findMany).toHaveBeenCalledWith({
            where: { userId: 'user-1' },
            orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
            select: expect.objectContaining({ id: true, recipientName: true }),
        });

        expect(result).toEqual([mockAddress]);
    });

    it('should return an empty array if user has no addresses', async () => {
        mockedPrisma.address.findMany.mockResolvedValue([]);

        const result = await getUserAddresses('user-1');

        expect(result).toEqual([]);
    });
});


describe('createAddress', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should create an address and make it default when it is the first one', async () => {
        mockedPrisma.address.count.mockResolvedValue(0);
        mockedPrisma.address.create.mockResolvedValue({ ...mockAddress, isDefault: true });

        const result = await createAddress('user-1', addressInput);

        expect(mockedPrisma.address.updateMany).not.toHaveBeenCalled();

        expect(mockedPrisma.address.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({ isDefault: true }),
            }),
        );

        expect(result.isDefault).toBe(true);
    });

    it('should unset current default before creating a new default address', async () => {
        mockedPrisma.address.count.mockResolvedValue(1);
        mockedPrisma.address.updateMany.mockResolvedValue({ count: 1 });
        mockedPrisma.address.create.mockResolvedValue({ ...mockAddress, isDefault: true });

        await createAddress('user-1', { ...addressInput, isDefault: true });

        expect(mockedPrisma.address.updateMany).toHaveBeenCalledWith({
            where: { userId: 'user-1', isDefault: true },
            data: { isDefault: false },
        });
    });

    it('should not unset defaults when new address is not marked as default', async () => {
        mockedPrisma.address.count.mockResolvedValue(2);
        mockedPrisma.address.create.mockResolvedValue({ ...mockAddress, isDefault: false });

        await createAddress('user-1', { ...addressInput, isDefault: false });

        expect(mockedPrisma.address.updateMany).not.toHaveBeenCalled();
    });

    it('should set optional fields to null when not provided', async () => {
        mockedPrisma.address.count.mockResolvedValue(1);
        mockedPrisma.address.create.mockResolvedValue(mockAddress);

        await createAddress('user-1', addressInput);

        expect(mockedPrisma.address.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    label: null,
                    phoneNumber: null,
                    complement: null,
                    country: 'BR',
                }),
            }),
        );
    });
});


describe('updateAddress', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should update and return the address', async () => {
        const updatedAddress = { ...mockAddress, city: 'Campinas' };

        mockedPrisma.address.findUnique.mockResolvedValue(mockAddress);
        mockedPrisma.address.update.mockResolvedValue(updatedAddress);

        const result = await updateAddress('user-1', 'addr-1', { city: 'Campinas' });

        expect(mockedPrisma.address.update).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { id: 'addr-1' },
                data: { city: 'Campinas' },
            }),
        );

        expect(result).toEqual(updatedAddress);
    });

    it('should unset current default before promoting this address to default', async () => {
        mockedPrisma.address.findUnique.mockResolvedValue(mockAddress);
        mockedPrisma.address.updateMany.mockResolvedValue({ count: 1 });
        mockedPrisma.address.update.mockResolvedValue({ ...mockAddress, isDefault: true });

        await updateAddress('user-1', 'addr-1', { isDefault: true });

        expect(mockedPrisma.address.updateMany).toHaveBeenCalledWith({
            where: { userId: 'user-1', isDefault: true },
            data: { isDefault: false },
        });
    });

    it('should not unset defaults when isDefault is not being set', async () => {
        mockedPrisma.address.findUnique.mockResolvedValue(mockAddress);
        mockedPrisma.address.update.mockResolvedValue(mockAddress);

        await updateAddress('user-1', 'addr-1', { city: 'Campinas' });

        expect(mockedPrisma.address.updateMany).not.toHaveBeenCalled();
    });

    it('should throw 404 if address does not exist', async () => {
        mockedPrisma.address.findUnique.mockResolvedValue(null);

        await expect(
            updateAddress('user-1', 'addr-1', { city: 'Campinas' }),
        ).rejects.toThrow(new AppError('Address not found', 404));
    });

    it('should throw 403 if address belongs to another user', async () => {
        mockedPrisma.address.findUnique.mockResolvedValue({
            ...mockAddress,
            userId: 'other-user',
        });

        await expect(
            updateAddress('user-1', 'addr-1', { city: 'Campinas' }),
        ).rejects.toThrow(new AppError('Forbidden', 403));
    });
});


describe('deleteAddress', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should delete the address', async () => {
        mockedPrisma.address.findUnique.mockResolvedValue({
            ...mockAddress,
            isDefault: false,
        });
        mockedPrisma.address.delete.mockResolvedValue({});

        await deleteAddress('user-1', 'addr-1');

        expect(mockedPrisma.address.delete).toHaveBeenCalledWith({
            where: { id: 'addr-1' },
        });
    });

    it('should promote the oldest remaining address to default after deleting the default', async () => {
        const nextAddress = { ...mockAddress, id: 'addr-2', isDefault: false };

        mockedPrisma.address.findUnique.mockResolvedValue(mockAddress);
        mockedPrisma.address.delete.mockResolvedValue({});
        mockedPrisma.address.findFirst.mockResolvedValue(nextAddress);
        mockedPrisma.address.update.mockResolvedValue({ ...nextAddress, isDefault: true });

        await deleteAddress('user-1', 'addr-1');

        expect(mockedPrisma.address.findFirst).toHaveBeenCalledWith({
            where: { userId: 'user-1' },
            orderBy: { createdAt: 'asc' },
        });

        expect(mockedPrisma.address.update).toHaveBeenCalledWith({
            where: { id: 'addr-2' },
            data: { isDefault: true },
        });
    });

    it('should not promote any address if none remain after deleting the default', async () => {
        mockedPrisma.address.findUnique.mockResolvedValue(mockAddress);
        mockedPrisma.address.delete.mockResolvedValue({});
        mockedPrisma.address.findFirst.mockResolvedValue(null);

        await deleteAddress('user-1', 'addr-1');

        expect(mockedPrisma.address.update).not.toHaveBeenCalled();
    });

    it('should not attempt promotion when a non-default address is deleted', async () => {
        mockedPrisma.address.findUnique.mockResolvedValue({
            ...mockAddress,
            isDefault: false,
        });
        mockedPrisma.address.delete.mockResolvedValue({});

        await deleteAddress('user-1', 'addr-1');

        expect(mockedPrisma.address.findFirst).not.toHaveBeenCalled();
        expect(mockedPrisma.address.update).not.toHaveBeenCalled();
    });

    it('should throw 404 if address does not exist', async () => {
        mockedPrisma.address.findUnique.mockResolvedValue(null);

        await expect(deleteAddress('user-1', 'addr-1')).rejects.toThrow(
            new AppError('Address not found', 404),
        );
    });

    it('should throw 403 if address belongs to another user', async () => {
        mockedPrisma.address.findUnique.mockResolvedValue({
            ...mockAddress,
            userId: 'other-user',
        });

        await expect(deleteAddress('user-1', 'addr-1')).rejects.toThrow(
            new AppError('Forbidden', 403),
        );
    });
});