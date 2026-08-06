import { Request, Response, NextFunction } from 'express';
import { ZodObject, ZodError } from 'zod';
import { logger } from '../Config/logger';

export const validateResource = ( schema: ZodObject ) =>
    ( req: Request, res:Response, next:NextFunction ):void =>{
        try{
            schema.parse({
                body:req.body,
                query:req.query,
                params:req.params,
            });
            next();
        } catch(error){
            if( error instanceof ZodError ){
                logger.warning(`Error de validación de datos: ${JSON.stringify(error.format)}`);
                res.status(200).json({
                    status:400,
                    error: {
                        code: 'ERROR DE VALIDACION',
                        message: 'Los datos enviados no cumplen con los requisitos de seguridad.',
                        details: error.issues.map(err => ({ field: err.path.join('.'), message: err.message }))
                    }
                    // errors: error.issues.map(err => ({ failed:err.path[1], message: err.message})),
                })
                return
            }
            res.status(200).json({ 
                status: 500, 
                error: { 
                    code: 'ERROR INTERNO DEL SERVIDOR', 
                    message: 'Error de procesamiento.' } 
                });
            // res.status(500).json({ error: 'Internal server error'  })
        }
    };
