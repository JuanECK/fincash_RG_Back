import { z } from 'zod';

export const createTestSchema = z.object({
    body: z.object({
        // campos obligatorios 
        username: z.string({ error: 'El nombre de usuario es obligatorio' }).min(1, 'No puede estar vacío').min(3, 'Mínimo 3 caracteres'),
        email: z.email({error:'Formato de correo electrónico inválido'}),
    })
});