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
                res.status(400).json({
                    status:'fail',
                    errors: error.issues.map(err => ({ failed:err.path[1], message: err.message})),
                })
                return
            }
            res.status(500).json({ error: 'Internal server error'  })
        }
    };
