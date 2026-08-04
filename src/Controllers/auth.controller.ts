import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { logger } from '../Config/logger';
import { env } from '../Config/env';

const JWT_SECRET = env.JWT_SECRET;

// Simulación de base de datos con dos usuarios de roles distintos para tus pruebas
const mockUsuariosBD = [
  {
    id: "user_admin_01",
    email: "admin@fincash.com",
    passwordHash: "", // Se llena abajo
    role: "admin"
  },
  {
    id: "user_comun_02",
    email: "cliente@fincash.com",
    passwordHash: "", // Se llena abajo
    role: "user"
  }
];

export const loginController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Inicialización rápida de hashes para la prueba en memoria
    mockUsuariosBD[0].passwordHash = await bcrypt.hash("Admin123!", 10);
    mockUsuariosBD[1].passwordHash = await bcrypt.hash("User123!", 10);

    // 1. Buscar al usuario en nuestro arreglo
    const usuarioEncontrado = mockUsuariosBD.find(u => u.email === email);
    if (!usuarioEncontrado) {
       res.status(401).json({ error: 'Credenciales de usuario inválidas' });
       return;
    }

    // 2. Validar la contraseña con bcrypt
    const isPasswordValid = await bcrypt.compare(password, usuarioEncontrado.passwordHash);
    if (!isPasswordValid) {
       res.status(401).json({ error: 'Credenciales de password inválidas' });
       return;
    }

    // 3. Generar el token con su rol correspondiente
    const token = jwt.sign(
      { id: usuarioEncontrado.id, role: usuarioEncontrado.role },
      env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // 4. Inyectar la cookie HTTP-Only firmada y segura
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      signed: true,
      maxAge: 60 * 60 * 1000
    });

    logger.info(`🔑 Sesión iniciada con éxito. ID: ${usuarioEncontrado.id} [Rol: ${usuarioEncontrado.role}]`);

    // =========================================================================
    // LÓGICA DE SEGUIMIENTO INMEDIATA: RESPUESTA DEPENDIENDO DEL ROL
    // =========================================================================
    if (usuarioEncontrado.role === 'admin') {
      res.status(200).json({
        status: 'success',
        message: 'Bienvenido Administrador. Acceso total.',
        user: { id: usuarioEncontrado.id, email: usuarioEncontrado.email, role: usuarioEncontrado.role },
        redirectTo: '/admin/dashboard', // Indica al frontend a dónde enviarlo
        dashboardData: {
          logsSistema: 'Estables',
          balanceFinancieroGlobal: '$1,500,000.00 MXN',
          usuariosActivos: 142
        }
      });
      return;
    } 

    if (usuarioEncontrado.role === 'user') {
      res.status(200).json({
        status: 'success',
        message: 'Bienvenido Cliente. Acceso estándar concedido.',
        user: { id: usuarioEncontrado.id, email: usuarioEncontrado.email, role: usuarioEncontrado.role },
        redirectTo: '/user/home', // Redirección diferente para usuarios comunes
        profileData: {
          misCuentas: ['Ahorros', 'Débito'],
          saldoDisponible: '$4,250.00 MXN',
          ultimasTransacciones: ['Retiro OXXO', 'Transferencia SPEI']
        }
      });
      return;
    }

    // rol no contemplado Extra
    res.status(200).json({
      status: 'success',
      message: 'Inicio de sesión exitoso.',
      user: { role: usuarioEncontrado.role }
    });

// =============================================================================================
    // SIMULACIÓN: Aquí buscarías al usuario en tu Base de Datos
    // Supongamos que encontramos este usuario con su contraseña ya encriptada en la BD
    // const mockUser = {
    //   id: "user_bc123",
    //   email: "carlos@example.com",
    //   passwordHash: await bcrypt.hash("PasswordSegura123!", 10), // Encriptada con bcrypt
    //   role: "admin"
    // };

    // if (email !== mockUser.email) {
    //    res.status(401).json({ error: 'Credenciales inválidas' });
    //    return;
    // }

    // // Validar contraseña usando bcrypt
    // const isPasswordValid = await bcrypt.compare(password, mockUser.passwordHash);
    // if (!isPasswordValid) {
    //    res.status(401).json({ error: 'Credenciales inválidas' });
    //    return;
    // }

    // // Generar el token JWT con los datos esenciales
    // const token = jwt.sign(
    //   { id: mockUser.id, role: mockUser.role },
    //   JWT_SECRET,
    //   { expiresIn: '1h' }
    // );

    // // 🍪 ENVIAR COOKIE ALTAMENTE SEGURA Y FIRMADA
    // res.cookie('access_token', token, {
    //   httpOnly: true,
    //   secure: env.NODE_ENV === 'production', // true solo en producción (HTTPS)
    //   sameSite: 'strict', // Mitiga ataques CSRF
    //   signed: true, // Firma la cookie para evitar manipulaciones en el cliente
    //   maxAge: 60 * 60 * 1000 // Expira en 1 hora (coincide con el JWT)
    // });

    // logger.info(`Sesión iniciada exitosamente para el usuario: ${mockUser.id}`);

    // res.status(200).json({
    //   status: 'success',
    //   message: 'Inicio de sesión exitoso. Sesión guardada en cookie segura.'
    // });

  // =============================================================================================
  } catch (error) {
    logger.error(`Error en loginController: ${error}`);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const logoutController = async (req: Request, res: Response): Promise<void> => {
  // Para cerrar sesión simplemente borramos la cookie del navegador
  res.clearCookie('access_token');
  logger.info('Sesión cerrada y cookie eliminada de forma segura.');
  res.status(200).json({ status: 'success', message: 'Sesión cerrada correctamente' });
};
