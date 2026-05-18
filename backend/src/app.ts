import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorMiddleware } from './middleware/errorMiddleware';
import cookieParser from 'cookie-parser';

// Routes Imports
import authRoutes from './modules/auth/auth.routes';
import productsRoutes from './modules/products/products.routes';
import cartRoutes from './modules/cart/cart.routes';
import checkoutRoutes from './modules/checkout/checkout.routes'
import ordersRoutes from './modules/order/order.routes'
import paymentRoutes from './modules/payment/payment.routes'
import stockRoutes from './modules/stock/stock.routes'

const app = express();

// Security
app.use(helmet());

// Logging
app.use(morgan('dev'));

// CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
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
app.use('/api/cart', cartRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/stock', stockRoutes);


// Error handling
app.use(errorMiddleware);

export default app;
