import { Request, Response } from 'express';
import { logger } from '../Config/logger';

export const handleTestRoute = async ( req:Request, res:Response ):Promise<void> =>{
    try{
        const { username, email } = req.body;

          
        logger.info(`Ruta de prueba accedida exitosamente por: ${username}`);
    
        res.status(200).json({
        status: 'success',
        message: 'Petición autorizada, validada y firmada correctamente.',
        data: { username, email }
        });

    }catch(error){
        logger.error(`Error en test.controller: ${error}`);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}