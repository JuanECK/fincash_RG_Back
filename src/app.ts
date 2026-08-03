import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import helmet from 'helmet';
import { logger } from './Config/logger';
import testRoutes from './Routes/test.routes';

const app = express();

// Capas globales de seguridad y utilidades
app.use(helmet());
app.use(cors());
app.use(express.json());

// Integración de Morgan con Winston
const morganMiddleware = morgan(
  ':method :url :status :res[content-length] - :response-time ms',
  { stream: { write: (message) => logger.http(message.trim()) } }
);
app.use(morganMiddleware);

// Rutas de la API
app.use('/api/v1', testRoutes);
// url principal del test

export default app;