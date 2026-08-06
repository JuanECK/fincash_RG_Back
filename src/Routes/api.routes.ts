import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { handleTestRoute, handleUpdateProfile, handleUpdateReport } from '../Controllers/test.controller';
import { verifyHMAC } from '../Middleware/hmac.middleware';
import { verifyJWT } from '../Middleware/auth.middleware';
import { validateResource } from '../Middleware/validate.middleware';
import { createTestSchema, registerSchema, updateProfileSchema, updateReportSchema, loginSchema } from '../Schemas/test.schema';
import { loginController, logoutController } from '../Controllers/auth.controller'
import { registerController } from '../Controllers/register.controller';
import { authorizeRoles } from '../Middleware/role.middleware';

const router = Router();

// Rate Limiter especifico para esta ruta de prueba
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max:100, // maximo 100 peticiones por ventana
    message: { error:'Demasiadas peticiones desde esta IP, intente más tarde.' },
    standardHeaders:true,
    legacyHeaders:false
})
// =================================================================================================
// 1. FLUJO DE AUTENTICACIÓN (LOGIN/REGISTRO - Protegidas por Rate Limiter y Firma HMAC obligatoria)
// =================================================================================================
router.post(
  '/auth/login', 
  apiLimiter,
  verifyHMAC,                    // Valida que nadie alterara los montos del JSON en tránsito
  validateResource(loginSchema), // Valida la estructura del JSON con Zod
  loginController                // Ejecuta la acción en el controlador
);
// Ruta de deslogueo (sin necesidad de verificacion)
router.post('/auth/logout', logoutController)
// Ruta de registro de usuario nuevo ( protegida para que solo el administrador pueda dar de alta )
router.post(
  '/auth/register', 
  apiLimiter,
  verifyHMAC,                       // Valida que nadie alterara los montos del JSON en tránsito
  validateResource(registerSchema), // Valida la estructura del JSON con Zod
  registerController                // Ejecuta la acción en el controlador
)

// ==========================================
// ACCIONES POST-LOGIN (PROCESOS OPERATIVOS)
// ==========================================

// Ruta General Protegida (Cualquier usuario autenticado entra)
router.post('/test', apiLimiter, verifyJWT, verifyHMAC, validateResource(createTestSchema), handleTestRoute);

// RUTA EXCLUSIVA ADMINS
router.put(
  '/admin/update-report',
  apiLimiter,
  verifyJWT,                            // Valida que tenga la cookie de sesión activa
  authorizeRoles('admin'),              // Bloquea si no es un Administrador
  verifyHMAC,                           // Valida que nadie alterara los montos del JSON en tránsito
  validateResource(updateReportSchema), // Valida la estructura del JSON con Zod
  handleUpdateReport                    // Ejecuta la acción en el controlador
);

// NUEVA RUTA PARA USUARIOS Y ADMINS
router.patch(
  '/user/update-profile',
  apiLimiter,
  verifyJWT,                              // Valida que tenga la cookie de sesión activa
  authorizeRoles('user', 'admin'),        // Permite el paso a ambos roles
  verifyHMAC,                             // Valida que nadie alterara los montos del JSON en tránsito
  validateResource(updateProfileSchema),  // Valida la estructura del JSON con Zod
  handleUpdateProfile                     // Ejecuta la acción en el controlador
);


export default router;