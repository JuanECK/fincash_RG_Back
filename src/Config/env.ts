import dotenv from 'dotenv';
import path from 'node:path';
import { z } from 'zod';
import { logger } from './logger';

// carga las variables desde el archivo .env a process.env y 
// forzamos la ruta absoluta hacia la raíz del proyecto (subiendo un nivel desde src/config)
dotenv.config({path: path.resolve(process.cwd(), '.env')});

// define el esquema de validacion estricto con zod
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform((val) => Number.parseInt(val, 10)).default(3000),
  COOKIE_SECRET: z.string({
    error: 'La variable COOKIE_SECRET es obligatoria para firmar las cookies.',
  }).min(14, 'COOKIE_SECRET debe tener al menos 32 caracteres por seguridad.'),
  JWT_SECRET: z.string({
    error: 'La variable JWT_SECRET es obligatoria para firmar los tokens.',
  }).min(14, 'JWT_SECRET debe tener al menos 32 caracteres por seguridad.'),
  HMAC_SECRET: z.string({
    error: 'La variable HMAC_SECRET es obligatoria para validar la integridad de las peticiones.',
  }).min(14, 'HMAC_SECRET debe tener al menos 32 caracteres por seguridad.'),
  ALLOWED_ORIGIN: z.url('ALLOWED_ORIGIN debe ser una URL válida (ej: http://localhost:5173).'),

  // nodeMailer
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform((val) => val ? parseInt(val, 10) : 587).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().default('"Fincash RG Security" <no-reply@fincash.com>'),
});

// intenta parsear y validar process.env
const parseEnv = () => {
    const result = envSchema.safeParse(process.env);

    if( !result.success ){
        logger.error('ERROR CRITICO Configuracion de entorno invalida:');

        //muestra detalladamente que variable farro y porque
        result.error.issues.forEach((err) => {
            logger.error(`   Variable [${err.path.join('.')}]: ${err.message}`);
        });

        // Detiene el servidor de inmediato para evitar fallos catastróficos en producción
        process.exit(1);
    }
    return result.data;
}

// Exportamos el objeto ya validado y tipado de forma estricta
export const env = parseEnv();