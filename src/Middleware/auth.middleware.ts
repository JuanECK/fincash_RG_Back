import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../Config/logger';
import { env } from '../Config/env';

const JWT_SECRET = env.JWT_SECRET ;

// Extendemos la interfaz de Express para poder guardar los datos del usuario autenticado
declare global {
    namespace Express{
        interface Request{
            user?:any;
        }
    }
}

export const verifyJWT = (req: Request, res: Response, next: NextFunction): void => {
    // Buscamos el token en las cookies firmadas legítimas
    const token = req.signedCookies['access_token'];

    // 2. Extraemos el string crudo de la cabecera HTTP (Evitamos que cookie-parser oculte el error)
    const rawCookieHeader = req.headers.cookie || '';
    const tieneCookieEnHeader = rawCookieHeader.includes('access_token=');

    //   DETECCIÓN DE CONTRASEÑA/COOKIE ALTERADA POR FUERA:
    // Si no está en signedCookies, pero el cliente SÍ envió una cookie en 'req.cookies',
    // significa que la firma de la cookie fue manipulada en Postman o en el navegador.
    // const cookieAlterada = req.cookies['access_token'];
    if (!token && tieneCookieEnHeader) {
        logger.error(`⚠️ INTENTO DE HACKEO: Estructura de cookie manipulada. IP: ${req.ip}`);
        
        // Borramos la cookie corrupta del cliente de forma agresiva
        res.clearCookie('access_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        signed: true
        });

        res.status(403).json({ 
        error: 'Estructura de sesión corrupta o alterada. Sesión destruida automáticamente por seguridad.' 
        });
        return;
    }

      // Si literalmente no envió ninguna cookie (sesión caducada real o nunca inició sesión)
    if (!token) {
        logger.warning(`Intento de acceso denegado por falta de cookie de sesión. IP: ${req.ip}`);
        res.status(401).json({ error: 'Acceso denegado. Sesión no activa o caducada.' });
        return;
    }

      // 2. Si la cookie es estructuralmente correcta, validamos el contenido del JWT interno
    try {
        const decoded = jwt.verify(token, env.JWT_SECRET);
        req.user = decoded; // Adjuntamos los datos descodificados a la petición
        next();
    } catch (error) {

    //DETECCIÓN DE MANIPULACIÓN O EXPIRACIÓN
    logger.error(`Cookie JWT corrupta o expirada detectada. IP: ${req.ip}. Detalles: ${error}`);

    // Borramos la cookie si el JWT expiró o el algoritmo interno falló
    res.clearCookie('access_token',{
        httpOnly:true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'strict',
        signed: true
    })

    res.status(403).json({ error: 'Sesión inválida o alterada. Tu sesión ha sido cerrada automáticamente por seguridad.' });
  }
};