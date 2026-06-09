/* eslint-disable @typescript-eslint/no-explicit-any */
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import usersRouter from '../users.routes';
import { prisma } from '../../../lib/prisma';
import { createTestApp } from '../../../test/setup/createTestApp';
import { cleanDatabase } from '../../../test/setup/testDb';
import { createUser } from '../../../test/setup/factories/user.factory';

let mockUserId = '';

vi.mock('../../../middleware/protect', () => ({
    protect: (req: any, _res: any, next: any) => {
        req.user = { id: mockUserId };
        next();
    },
}));

// ─────────────────────────────────────────
// App Setup
// ─────────────────────────────────────────
const app = createTestApp(usersRouter, '/users');

// ─────────────────────────────────────────
// Test Data
// ─────────────────────────────────────────
let user: any;

// ─────────────────────────────────────────
// DB Setup
// ─────────────────────────────────────────
beforeEach(async () => {
    await cleanDatabase();

    user = await createUser();

    mockUserId = user.id;
});

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────
const validAddress = {
    recipientName: 'John Doe',
    street: 'Rua das Flores',
    number: '123',
    district: 'Centro',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01310-100',
    country: 'BR',
};

const seedAddress = (overrides: object = {}) =>
    prisma.address.create({
        data: {
            userId: user.id,
            recipientName: 'John Doe',
            street: 'Rua das Flores',
            number: '123',
            district: 'Centro',
            city: 'São Paulo',
            state: 'SP',
            zipCode: '01310-100',
            country: 'BR',
            isDefault: false,
            ...overrides,
        },
    });




describe('GET /users/me', () => {
    it('should return the authenticated user profile', async () => {
        const res = await request(app).get('/users/me');

        expect(res.status).toBe(200);
        expect(res.body.id).toBe(user.id);
        expect(res.body.email).toBe(user.email);
        expect(res.body.password).toBeUndefined();
    });

    it('should return 404 if user does not exist', async () => {
        mockUserId = '00000000-0000-0000-0000-000000000000';

        const res = await request(app).get('/users/me');

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('User not found');
    });
});




describe('PATCH /users/me/profile', () => {
    it('should update the user profile', async () => {
        const res = await request(app)
            .patch('/users/me/profile')
            .send({ firstName: 'Jane', lastName: 'Smith', phoneNumber: '11888888888' });

        expect(res.status).toBe(200);
        expect(res.body.firstName).toBe('Jane');
        expect(res.body.lastName).toBe('Smith');
        expect(res.body.phoneNumber).toBe('11888888888');
    });

    it('should set phoneNumber to null when omitted', async () => {
        const res = await request(app)
            .patch('/users/me/profile')
            .send({ firstName: 'Jane', lastName: 'Smith' });

        expect(res.status).toBe(200);
        expect(res.body.phoneNumber).toBeNull();
    });

    it('should return 400 if firstName is missing', async () => {
        const res = await request(app)
            .patch('/users/me/profile')
            .send({ lastName: 'Smith' });

        expect(res.status).toBe(400);
    });

    it('should return 400 if lastName is missing', async () => {
        const res = await request(app)
            .patch('/users/me/profile')
            .send({ firstName: 'Jane' });

        expect(res.status).toBe(400);
    });
});



describe('GET /users/me/addresses', () => {
    it('should return all addresses for the user', async () => {
        await seedAddress({ isDefault: true });
        await seedAddress({ street: 'Av. Paulista', isDefault: false });

        const res = await request(app).get('/users/me/addresses');

        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(2);
    });

    it('should return empty array when user has no addresses', async () => {
        const res = await request(app).get('/users/me/addresses');

        expect(res.status).toBe(200);
        expect(res.body).toEqual([]);
    });

    it('should return the default address first', async () => {
        await seedAddress({ isDefault: false, street: 'Rua B' });
        await seedAddress({ isDefault: true, street: 'Rua A' });

        const res = await request(app).get('/users/me/addresses');

        expect(res.status).toBe(200);
        expect(res.body[0].isDefault).toBe(true);
    });

    it('should not expose the userId field', async () => {
        await seedAddress();

        const res = await request(app).get('/users/me/addresses');

        expect(res.body[0].userId).toBeUndefined();
    });
});



describe('POST /users/me/addresses', () => {
    it('should create a new address', async () => {
        const res = await request(app)
            .post('/users/me/addresses')
            .send(validAddress);

        expect(res.status).toBe(201);
        expect(res.body.recipientName).toBe('John Doe');
        expect(res.body.city).toBe('São Paulo');
    });

    it('should automatically make the first address the default', async () => {
        const res = await request(app)
            .post('/users/me/addresses')
            .send(validAddress);

        expect(res.status).toBe(201);
        expect(res.body.isDefault).toBe(true);
    });

    it('should unset the previous default when creating a new default address', async () => {
        await seedAddress({ isDefault: true });

        const res = await request(app)
            .post('/users/me/addresses')
            .send({ ...validAddress, isDefault: true, street: 'Av. Paulista' });

        expect(res.status).toBe(201);
        expect(res.body.isDefault).toBe(true);

        const addresses = await prisma.address.findMany({ where: { userId: user.id } });
        const defaults = addresses.filter((a) => a.isDefault);
        expect(defaults).toHaveLength(1);
    });

    it('should return 400 if recipientName is missing', async () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { recipientName: _, ...body } = validAddress;

        const res = await request(app).post('/users/me/addresses').send(body);

        expect(res.status).toBe(400);
    });

    it('should return 400 if zipCode format is invalid', async () => {
        const res = await request(app)
            .post('/users/me/addresses')
            .send({ ...validAddress, zipCode: 'invalid' });

        expect(res.status).toBe(400);
    });

    it('should return 400 if state is not exactly 2 characters', async () => {
        const res = await request(app)
            .post('/users/me/addresses')
            .send({ ...validAddress, state: 'SAO' });

        expect(res.status).toBe(400);
    });

    it('should return 400 if label is not a valid enum value', async () => {
        const res = await request(app)
            .post('/users/me/addresses')
            .send({ ...validAddress, label: 'GARAGE' });

        expect(res.status).toBe(400);
    });
});

// ─────────────────────────────────────────
// PATCH /users/me/addresses/:addressId
// ─────────────────────────────────────────
describe('PATCH /users/me/addresses/:addressId', () => {
    it('should update an address field', async () => {
        const address = await seedAddress();

        const res = await request(app)
            .patch(`/users/me/addresses/${address.id}`)
            .send({ city: 'Campinas' });

        expect(res.status).toBe(200);
        expect(res.body.city).toBe('Campinas');
    });

    it('should unset previous default when promoting a new one', async () => {
        const first = await seedAddress({ isDefault: true });
        const second = await seedAddress({ isDefault: false, street: 'Av. Paulista' });

        await request(app)
            .patch(`/users/me/addresses/${second.id}`)
            .send({ isDefault: true });

        const addresses = await prisma.address.findMany({ where: { userId: user.id } });
        const defaults = addresses.filter((a) => a.isDefault);

        expect(defaults).toHaveLength(1);
        expect(defaults[0].id).toBe(second.id);

        const updatedFirst = addresses.find((a) => a.id === first.id);
        expect(updatedFirst!.isDefault).toBe(false);
    });

    it('should return 404 if address does not exist', async () => {
        const res = await request(app)
            .patch('/users/me/addresses/00000000-0000-0000-0000-000000000000')
            .send({ city: 'Campinas' });

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Address not found');
    });

    it('should return 403 if address belongs to another user', async () => {
        const otherUser = await createUser();
        const otherAddress = await prisma.address.create({
            data: {
                userId: otherUser.id,
                recipientName: 'Other',
                street: 'Rua X',
                number: '1',
                district: 'Bairro',
                city: 'Rio',
                state: 'RJ',
                zipCode: '20040-020',
                country: 'BR',
            },
        });

        const res = await request(app)
            .patch(`/users/me/addresses/${otherAddress.id}`)
            .send({ city: 'Niterói' });

        expect(res.status).toBe(403);
        expect(res.body.message).toBe('Forbidden');
    });

    it('should return 400 if zipCode format is invalid', async () => {
        const address = await seedAddress();

        const res = await request(app)
            .patch(`/users/me/addresses/${address.id}`)
            .send({ zipCode: 'bad-zip' });

        expect(res.status).toBe(400);
    });
});

// ─────────────────────────────────────────
// DELETE /users/me/addresses/:addressId
// ─────────────────────────────────────────
describe('DELETE /users/me/addresses/:addressId', () => {
    it('should delete the address and return 204', async () => {
        const address = await seedAddress();

        const res = await request(app).delete(`/users/me/addresses/${address.id}`);

        expect(res.status).toBe(204);

        const deleted = await prisma.address.findUnique({ where: { id: address.id } });
        expect(deleted).toBeNull();
    });

    it('should promote the oldest remaining address to default after deleting the default', async () => {
        const first = await seedAddress({ isDefault: true });
        const second = await seedAddress({ isDefault: false, street: 'Av. Paulista' });

        await request(app).delete(`/users/me/addresses/${first.id}`);

        const promoted = await prisma.address.findUnique({ where: { id: second.id } });
        expect(promoted!.isDefault).toBe(true);
    });

    it('should not promote anything when deleting a non-default address', async () => {
        const defaultAddr = await seedAddress({ isDefault: true });
        const nonDefault = await seedAddress({ isDefault: false, street: 'Av. Paulista' });

        await request(app).delete(`/users/me/addresses/${nonDefault.id}`);

        const remaining = await prisma.address.findUnique({ where: { id: defaultAddr.id } });
        expect(remaining!.isDefault).toBe(true);
    });

    it('should return 404 if address does not exist', async () => {
        const res = await request(app).delete(
            '/users/me/addresses/00000000-0000-0000-0000-000000000000',
        );

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Address not found');
    });

    it('should return 403 if address belongs to another user', async () => {
        const otherUser = await createUser();
        const otherAddress = await prisma.address.create({
            data: {
                userId: otherUser.id,
                recipientName: 'Other',
                street: 'Rua X',
                number: '1',
                district: 'Bairro',
                city: 'Rio',
                state: 'RJ',
                zipCode: '20040-020',
                country: 'BR',
            },
        });

        const res = await request(app).delete(`/users/me/addresses/${otherAddress.id}`);

        expect(res.status).toBe(403);
        expect(res.body.message).toBe('Forbidden');
    });
});

// ─────────────────────────────────────────
// Cleanup
// ─────────────────────────────────────────
afterAll(async () => {
    await prisma.$disconnect();
});