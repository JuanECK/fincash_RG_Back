import { Request, Response, NextFunction } from 'express';
import crypto from 'node:crypto';
import { logger } from '../Config/logger';

const HMAC_SECRET = process.env.HMAC_SECRET || 'secreto';

export const verifyHMAC = ( req:Request, res:Response, next:NextFunction ):void => {

    const clientSignature = req.headers[ 'x-signature' ] as string;

    if (!clientSignature) {
    logger.warning(`Intento de petición sin firma HMAC desde IP: ${req.ip}`);
    res.status(401).json({ error: 'Falta la firma digital de la petición' });
    return;
  }

    // se genera el hash usandoel cuerpo de la peticion (requiere express.json())
    const message = JSON.stringify( req.body );

//  const sortObject = (obj: Record<string, any>): Record<string, any> => {
//   if (obj === null || typeof obj !== 'object') return obj;
  
//   return Object.keys(obj)
//     .sort()
//     .reduce<Record<string, any>>((result, key) => {
//       const value = obj[key];
//       result[key] = (value !== null && typeof value === 'object') ? sortObject(value) : value;
//       return result;
//     }, {});
// };

// // Uso en el middleware
// const message = JSON.stringify(sortObject(req.body));

    const computedStringify = crypto
    .createHmac( 'sha256', HMAC_SECRET )
    .update(message)
    .digest('hex');

    if( clientSignature !== computedStringify ){
        logger.error( `Firma HMAC inválida. IP: ${req.ip}` );
        res.status(403).json({ error: 'Firma digital inválida o datos alterados' });
        return;
    }

    next();
}