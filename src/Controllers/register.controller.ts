import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { logger } from '../Config/logger';

//base de datos 
const usuarioDataBase: any[] = [];

export const registerController = async ( req:Request, res:Response ):Promise<void> => {
    try {
        console.log({body:req.body})
        const { email, password } = req.body;

        //verificar si el usuario ya existe
        const existeUsuario = usuarioDataBase.find( u => u.email === email );
        if( existeUsuario ){
            res.status(400).json({ error:'El correo electrónico ya está registrado.'});
            return;
        }

        // si no existe Registramos al usuario
        // encriptamos la contraseña con BCRYPT ( unidireccional y segura )
        // el numero 10 es para el "salt rounds" ( costo de procesamiento contra ataques de fuerza bruta )
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash( password, saltRounds );

        // Guardar el usuario con la contraseña cifrada (Nunca guardes la clave en texto plano)
        const nuevoUsuario = {
            id: `user_${Math.random().toString(36).substring(2, 9)}`,
            email,
            password: passwordHash,
            role: 'user'
        }

        usuarioDataBase.push(nuevoUsuario);
        logger.info(`🚨 NUEVO USUARIO REGISTRADO: ${nuevoUsuario.id} con contraseña hasheada exitosamente.`);

        res.status(201).json({
            status:'success',
            message:'Usuario registrado exitosamente de forma segura.',
            data:{
                id: nuevoUsuario.id,
                email: nuevoUsuario.email
            }
        })
        console.log(usuarioDataBase)
    } catch (error) {
        logger.error(`Error en registerController: ${error}`);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}