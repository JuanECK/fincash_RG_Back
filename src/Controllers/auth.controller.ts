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
    //respeuesta Enmascarada con un HTTP 200 uniforme 
    if (error.message === 'EMAIL_EXISTS') {
      res.status(200).json({
          atatus:400,
          error: {
            code:'REGISTRO FALLIDO',
            message:'El correo electrónico ya está registrado.' 
          }
        });
      return;
    }
    logger.error(`Error en registerController: ${error}`);
    res.status(200).json({
        ststus:500,
        error: {
          code:'ERROR INTERNO DEL SERVIDOR',
          message: 'No se pudo procesar el registro.'
        } 
      });
  }
};

export const loginController = async (req: Request, res: Response): Promise<void> => {
  try {
    res.clearCookie('access_token'); // 🧼 Limpieza preventiva antes de generar la nueva cookie
    const { email, password } = req.body;
    const { token, user } = await authService.verificarCredenciales(email, password);

    // Inyectamos la cookie HttpOnly firmada
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      // ==========================================================================================================
      // sameSite: 'lax', // Permite que viaje entre subdominios controlados
      // domain: '.fincash.com', // 👈 Crucial: El punto inicial permite que comparta la cookie con subdominios
      // ==========================================================================================================
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
      res.status(200).json({ 
        status:401,
        error: {
          code:'AUTENTICACION FALLIDA',
          message:'Credenciales inválidas' 
        }
      });
      return;
    }
    logger.error(`Error en loginController: ${error}`);
    res.status(200).json({ 
      status:500,
      error: {
        code:'ERROR INTERNO DEL SERVIDOR',
        message:'Ocurrió un inconveniente al validar el acceso.'
      } 
    });
  }
};

export const logoutController = async (req: Request, res: Response): Promise<void> => {
  res.clearCookie('access_token');
  logger.info('Sesión cerrada y cookie eliminada de forma segura.');
  res.status(200).json({ 
    status: 'success', 
    message: 'Sesión cerrada correctamente' });
};

export const forgotPasswordController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    
    // El servicio se encarga de discriminar si existe o no internamente
    await authService.generarTokenRecuperacion(email);

    // 🛡️ RESPUESTA OPACA: El mensaje es exactamente igual para correos reales y falsos
    res.status(200).json({
      status: 'success',
      message: 'El correo electrónico está registrado, recibirás un enlace de recuperación en los próximos minutos.'
    });
  } catch (error) {
    logger.error(`Error en forgotPasswordController: ${error}`);
    res.status(200).json({ 
      status: 409, 
      error: { 
        ode: 'ERROR INTERNO DEL SERVIDOR', 
        message: 'No se pudo procesar la solicitud.' } });
  }
};

export const resetPasswordController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    await authService.cambiarContrasenaConToken(token, newPassword);

    res.status(200).json({
      status: 'success',
      message: 'Tu contraseña ha sido actualizada con éxito. Ya puedes iniciar sesión.'
    });
  } catch (error: any) {
    if (error.message === 'TOKEN_INVALID_OR_EXPIRED') {
      res.status(200).json({
        status: 409,
        error: { 
          code: 'SOLICITUD INCORRECTA', 
          message: 'El enlace de recuperación es inválido o ha expirado.' }
      });
      return;
    }
    logger.error(`Error en resetPasswordController: ${error}`);
    res.status(200).json({ 
      status: 500, 
      error: { 
        code: 'ERROR INTERNO DEL SERVIDOR', 
        message: 'Inconveniente al actualizar la credencial.' } });
  }
};
