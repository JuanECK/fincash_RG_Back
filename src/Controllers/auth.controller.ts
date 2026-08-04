import { Request, Response } from 'express';
import { AuthService } from '../Services/auth.service';
import { logger } from '../Config/logger';
import { env } from '../Config/env';

const authService = new AuthService();

export const registerController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const resultado = await authService.registrarUsuario(email, password);

    logger.info(`🚨 NUEVO USUARIO REGISTRADO: ${resultado.id} con contraseña hasheada exitosamente.`);
    res.status(201).json({ 
      status: 'success', 
      message: 'Usuario registrado con éxito.', 
      data: resultado });

  } catch (error: any) {
    if (error.message === 'EMAIL_EXISTS') {
      res.status(400).json({ error: 'El correo electrónico ya está registrado.' });
      return;
    }
    logger.error(`Error en registerController: ${error}`);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const loginController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const { token, user } = await authService.verificarCredenciales(email, password);

    // Inyectamos la cookie HttpOnly firmada
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      signed: true,
      maxAge: 60 * 60 * 1000
    });

    logger.info(`🔑 Login exitoso. Usuario: ${user.id} [Rol: ${user.role}]`);

    // =========================================================================
    // Lógica de respuesta según el rol del usuario devuelto por el servicio
    // =========================================================================
    if (user.role === 'admin') {
      res.status(200).json({
        status: 'success',
        user,
        redirectTo: '/admin/dashboard',
        dashboardData: { logsSistema: 'Estables', balanceFinancieroGlobal: '$1,500,000.00 MXN' }
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      user,
      redirectTo: '/user/home',
      profileData: { saldoDisponible: '$4,250.00 MXN', cuentas: ['Ahorros'], ultimasTransacciones: ['Retiro OXXO', 'Transferencia SPEI'] }
    });


  } catch (error: any) {
    if (error.message === 'INVALID_CREDENTIALS') {
      res.status(401).json({ error: 'Credenciales inválidas' });
      return;
    }
    logger.error(`Error en loginController: ${error}`);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const logoutController = async (req: Request, res: Response): Promise<void> => {
  res.clearCookie('access_token');
    logger.info('Sesión cerrada y cookie eliminada de forma segura.');
  res.status(200).json({ status: 'success', message: 'Sesión cerrada correctamente' });
};




// import { Request, Response } from 'express';
// import { AuthService } from '../Services/auth.service';
// import { logger } from '../Config/logger';
// import { env } from '../Config/env';
// // import jwt from 'jsonwebtoken';
// // import bcrypt from 'bcrypt';

// // const JWT_SECRET = env.JWT_SECRET;

// // Simulación de base de datos con dos usuarios de roles distintos para tus pruebas
// // const mockUsuariosBD = [
// //   {
// //     id: "user_admin_01",
// //     email: "admin@fincash.com",
// //     passwordHash: "", // Se llena abajo
// //     role: "admin"
// //   },
// //   {
// //     id: "user_comun_02",
// //     email: "cliente@fincash.com",
// //     passwordHash: "", // Se llena abajo
// //     role: "user"
// //   }
// // ];

// const authService = new AuthService();

// export const loginController = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { email, password } = req.body;
//     const { token, user } = await authService.verificarCredenciales(email, password);


//     // Inicialización rápida de hashes para la prueba en memoria
//     // mockUsuariosBD[0].passwordHash = await bcrypt.hash("Admin123!", 10);
//     // mockUsuariosBD[1].passwordHash = await bcrypt.hash("User123!", 10);

//     // 1. Buscar al usuario en nuestro arreglo
//     const usuarioEncontrado = mockUsuariosBD.find(u => u.email === email);
//     if (!usuarioEncontrado) {
//        res.status(401).json({ error: 'Credenciales de usuario inválidas' });
//        return;
//     }

//     // 2. Validar la contraseña con bcrypt
//     const isPasswordValid = await bcrypt.compare(password, usuarioEncontrado.passwordHash);
//     if (!isPasswordValid) {
//        res.status(401).json({ error: 'Credenciales de password inválidas' });
//        return;
//     }

//     // 3. Generar el token con su rol correspondiente
//     const token = jwt.sign(
//       { id: usuarioEncontrado.id, role: usuarioEncontrado.role },
//       env.JWT_SECRET,
//       { expiresIn: '1h' }
//     );

//     // 4. Inyectar la cookie HTTP-Only firmada y segura
//     res.cookie('access_token', token, {
//       httpOnly: true,
//       secure: env.NODE_ENV === 'production',
//       sameSite: 'strict',
//       signed: true,
//       maxAge: 60 * 60 * 1000
//     });

//     logger.info(`🔑 Sesión iniciada con éxito. ID: ${usuarioEncontrado.id} [Rol: ${usuarioEncontrado.role}]`);

//     // =========================================================================
//     // LÓGICA DE SEGUIMIENTO INMEDIATA: RESPUESTA DEPENDIENDO DEL ROL
//     // =========================================================================
//     if (usuarioEncontrado.role === 'admin') {
//       res.status(200).json({
//         status: 'success',
//         message: 'Bienvenido Administrador. Acceso total.',
//         user: { id: usuarioEncontrado.id, email: usuarioEncontrado.email, role: usuarioEncontrado.role },
//         redirectTo: '/admin/dashboard', // Indica al frontend a dónde enviarlo
//         dashboardData: {
//           logsSistema: 'Estables',
//           balanceFinancieroGlobal: '$1,500,000.00 MXN',
//           usuariosActivos: 142
//         }
//       });
//       return;
//     } 

//     if (usuarioEncontrado.role === 'user') {
//       res.status(200).json({
//         status: 'success',
//         message: 'Bienvenido Cliente. Acceso estándar concedido.',
//         user: { id: usuarioEncontrado.id, email: usuarioEncontrado.email, role: usuarioEncontrado.role },
//         redirectTo: '/user/home', // Redirección diferente para usuarios comunes
//         profileData: {
//           misCuentas: ['Ahorros', 'Débito'],
//           saldoDisponible: '$4,250.00 MXN',
//           ultimasTransacciones: ['Retiro OXXO', 'Transferencia SPEI']
//         }
//       });
//       return;
//     }

//     // rol no contemplado Extra
//     res.status(200).json({
//       status: 'success',
//       message: 'Inicio de sesión exitoso.',
//       user: { role: usuarioEncontrado.role }
//     });

//   } catch (error) {
//     logger.error(`Error en loginController: ${error}`);
//     res.status(500).json({ error: 'Error interno del servidor' });
//   }
// };

