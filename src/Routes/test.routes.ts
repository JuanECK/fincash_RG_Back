import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { handleTestRoute } from '../Controllers/test.controller';
import { verifyHMAC } from '../Middleware/hmac.middleware';
import { validateResource } from '../Middleware/validate.middleware';
import { createTestSchema } from '../Schemas/test.schema';

const router = Router();

// Rate Limiter especifico para esta ruta de prueba
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max:100, // maximo 100 peticiones por ventana
    message: { error:'Demasiadas peticiones desde esta IP, intente más tarde.' },
    standardHeaders:true,
    legacyHeaders:false
})

// Aplicación secuencial de seguridad: Rate Limit -> HMAC -> Zod -> Controlador
router.post(
  '/test', apiLimiter, verifyHMAC, validateResource(createTestSchema), handleTestRoute
);

export default router;