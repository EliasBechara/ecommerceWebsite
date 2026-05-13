/* eslint-disable @typescript-eslint/no-explicit-any */
import { vi } from 'vitest';

export let mockedUserId = '';

export const setMockUserId = (id: string) => {
    mockedUserId = id;
};

vi.mock('../../middleware/protect', () => ({
    protect: (
        req: any,
        _res: any,
        next: any,
    ) => {
        req.user = {
            id: mockedUserId,
        };

        next();
    },
}));