/* eslint-disable @typescript-eslint/no-explicit-any */
import express from 'express';
import cookieParser from 'cookie-parser';
import { errorMiddleware } from '../../middleware/errorMiddleware';

export const createTestApp = (router: any, basePath: string) => {
    const app = express();

    app.use(express.json());
    app.use(cookieParser());

    app.use(basePath, router);

    app.use(errorMiddleware);

    return app;
};