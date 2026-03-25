import app from './app';
import { pool } from './config/db/index';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await pool.query('SELECT 1');

    console.log('✅ Database connected');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
