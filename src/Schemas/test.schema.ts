import { z } from 'zod';
// Validacion para un Test Normal
export const createTestSchema = z.object({
    body: z.object({
        // campos obligatorios 
        username: z.string({ error: 'El nombre de usuario es obligatorio' }).min(1, 'No puede estar vacío').min(3, 'Mínimo 3 caracteres'),
        email: z.email({error:'Formato de correo electrónico inválido'}),

    })
});
//Validacion para el Login 
export const loginSchema = z.object({
  body: z.object({
        //campos para el login
        email: z.email({error:'Formato de correo electrónico inválido'}),
        password: z.string({ error: 'La contraseña debe tener al menos 6 caracteres' }).min(1, 'No puede estar vacío').min(6, 'Mínimo 6 caracteres')
  }),
});
//Validacion para el registro de un nuevo usuario
export const registerSchema = z.object({
  body: z.object({
        //campos para el login
        email: z.email({error:'Formato de correo electrónico inválido'}),
        password: z.string({ error: 'La contraseña debe tener al menos 6 caracteres' }).min(1, 'No puede estar vacío').min(6, 'Mínimo 6 caracteres')
  }),
});
// Validacion para actualizar el reporte financiero
export const updateReportSchema = z.object({
  body: z.object({
    mes: z.string({ error: 'El mes del reporte es obligatorio.' }),
    nuevoBalance: z.string({ error: 'El monto del nuevo balance es obligatorio.' }),
    estadoLogs: z.enum(['Estables', 'Mantenimiento', 'Criticos']),
  }),
});

// Validacion para actualizar el perfil del cliente
export const updateProfileSchema = z.object({
  body: z.object({
    telefono: z.string().min(10, 'El teléfono debe tener mínimo 10 dígitos.'),
    direccion: z.string().min(5, 'La dirección es demasiado corta.'),
  }),
});