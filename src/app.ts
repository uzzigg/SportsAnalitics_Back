import express, { Express } from 'express';
import corsMiddleware from './middleware/cors.js';
import { errorHandler } from './middleware/errorHandler.js';
import playerRoutes from './routes/players.js';

const app: Express = express();

// Middlewares
app.use(express.json());
app.use(corsMiddleware);

// Rutas API
app.use('/api/players', playerRoutes);

// Manejo de errores global
app.use(errorHandler);

export default app;
