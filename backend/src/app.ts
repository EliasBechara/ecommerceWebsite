import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './modules/auth/auth.routes';
import productsRoutes from './modules/products/products.routes';
import { errorMiddleware } from './middleware/errorMiddleware';
import cookieParser from 'cookie-parser';

const app = express();

// Security
app.use(helmet());

// Logging
app.use(morgan('dev'));

// CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  }),
);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);

// Error handling
app.use(errorMiddleware);

export default app;
