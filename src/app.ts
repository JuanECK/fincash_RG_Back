import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { logger } from './Config/logger';
import testRoutes from './Routes/test.routes';
import { env } from './Config/env';

const app = express();

// -----Capas globales de seguridad y utilidades-----

// CONFIGURACIÓN DE HELMET CON CSP ESTRICTA Y ADAPTADA
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true, // Carga las políticas seguras por defecto de Helmet
      directives: {
        // Define de dónde se pueden cargar los scripts de JavaScript
        "script-src": ["'self'", "'unsafe-inline'"], // Permite scripts de tu dominio e inline (necesario para muchas herramientas frontend)
        
        // Define a qué servidores puede hacer peticiones HTTP el cliente (CORS saliente desde el navegador)
        "connect-src": ["'self'", "http://localhost:3000"], // Añade aquí URLs de APIs externas si tu frontend las consume directamente
        
        // Define de dónde se pueden cargar estilos CSS
        "style-src": ["'self'", "'unsafe-inline'", "https://googleapis.com"],
        
        // Define de dónde se pueden descargar fuentes tipográficas
        "font-src": ["'self'", "https://gstatic.com"],
        
        // Define de dónde se pueden cargar imágenes (Muy útil si usas almacenamiento en la nube)
        "img-src": ["'self'", "data:", "https://cloudinary.com"], // Añade aquí tu bucket de AWS S3 o Cloudinary si usas imágenes externas
        
        // Bloquea que tu sitio web sea renderizado dentro de un <iframe> en páginas de terceros (Previene Clickjacking)
        "frame-ancestors": ["'none'"],
        
        // Fuerza al navegador a actualizar todas las peticiones HTTP a HTTPS de forma automática
        "upgrade-insecure-requests": [],
      },
    },
    // Protecciones adicionales de Helmet que trabajan en conjunto con la CSP:
    crossOriginEmbedderPolicy: false, // Desactivado para evitar conflictos comunes al cargar imágenes de terceros
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Permite compartir recursos de manera segura entre dominios controlados
  })
);

// Configuración de CORS estricta (Obligatoria para que las cookies viajen entre Frontend y Backend)
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

//Limita de forma estricta el tamaño máximo que Express aceptará en los bodies.
app.use(express.json({ limit: '10kb' }));

const COOKIE_SECRET = env.COOKIE_SECRET;
app.use(cookieParser(COOKIE_SECRET));

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