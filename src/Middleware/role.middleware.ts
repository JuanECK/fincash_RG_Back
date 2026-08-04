import { Request, Response, NextFunction } from 'express';
import { logger } from '../Config/logger';

export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // 1. Verificar si el middleware verifyJWT ya se ejecutó correctamente
    if (!req.user) {
      logger.error(`Intento de validar roles sin un JWT verificado previamente. IP: ${req.ip}`);
      res.status(500).json({ error: 'Error interno de configuración de seguridad.' });
      return;
    }

    const userRole = req.user.role;

    // 2. Verificar si el rol del usuario está incluido en los roles permitidos
    if (!allowedRoles.includes(userRole)) {
      logger.warning(`Acceso denegado. El usuario con ID: ${req.user.id} e IP: ${req.ip} intentó acceder con el rol no autorizado: [${userRole}]`);
      res.status(403).json({ 
        error: `Acceso denegado. Se requiere uno de los siguientes roles: [${allowedRoles.join(', ')}]. Tu rol actual es: [${userRole}]` 
      });
      return;
    }

    // Si tiene el rol adecuado, se le da paso al controlador
    next();
  };
};