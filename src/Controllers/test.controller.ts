import { Request, Response } from 'express';
import { logger } from '../Config/logger';
import { ReportService } from '../Services/report.service';

const reportService = new ReportService();

export const handleTestRoute = async ( req:Request, res:Response ):Promise<void> =>{
    try{
        const { username, email } = req.body;
        const authenticatedUser = req.user?.id; // Extraído del JWT por verifyJWT

        logger.info(`Ruta accedida por el usuario JWT: ${authenticatedUser.id || 'Anón'} - Data: ${username}`);
    
        res.status(200).json({
        status: 'success',
        message: 'Petición completamente segura (JWT + HMAC + Zod + Rate Limit).',
        data: { username, email },
        author: authenticatedUser || null,
        fechaActualizacion: new Date()
        });

    }catch(error){
        logger.error(`Error en test.controller: ${error}`);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

export const handleUpdateReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { mes, nuevoBalance, estadoLogs } = req.body;
    const adminId = req.user?.id; // Extraído del JWT por verifyJWT

    const reporteActualizado = await reportService.procesarActualizacionReporte(mes, nuevoBalance, estadoLogs, adminId);

    res.status(200).json({
      status: 'success',
      message: 'Reporte financiero actualizado con éxito.',
      updatedData: reporteActualizado
    });
  } catch (error) {
    logger.error(`Error en handleUpdateReport: ${error}`);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const handleUpdateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { telefono, direccion } = req.body;
    const userId = req.user?.id; // Extraído del JWT por verifyJWT

    const perfilActualizado = await reportService.procesarActualizacionPerfil(telefono, direccion, userId);

    res.status(200).json({
      status: 'success',
      message: 'Perfil actualizado con éxito.',
      data: perfilActualizado
    });
  } catch (error) {
    logger.error(`Error en handleUpdateProfile: ${error}`);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};






// Controlador para la actualización de reportes (Solo Admins)
// export const handleUpdateReport = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { mes, nuevoBalance, estadoLogs } = req.body;
//     const adminId = req.user?.id; // Extraído del JWT por verifyJWT

//     logger.info(`🚨 [ADMIN ACTION] El administrador ${adminId} modificó el reporte financiero del mes: ${mes}`);

//     res.status(200).json({
//       status: 'success',
//       message: 'Reporte financiero actualizado con éxito en el sistema.',
//       updatedData: {
//         mes,
//         nuevoBalance,
//         estadoLogs,
//         modificadoPor: adminId,
//         fechaActualizacion: new Date()
//       }
//     });
//   } catch (error) {
//     logger.error(`Error en handleUpdateReport: ${error}`);
//     res.status(500).json({ error: 'Error interno del servidor' });
//   }
// };

// // Controlador para actualizar el perfil del cliente (Users y Admins)
// export const handleUpdateProfile = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { telefono, direccion } = req.body;
//     const userId = req.user?.id; // Extraído del JWT por verifyJWT

//     logger.info(`👤 [USER ACTION] El usuario ${userId} actualizó sus datos de contacto.`);

//     res.status(200).json({
//       status: 'success',
//       message: 'Perfil de usuario actualizado correctamente.',
//       data: {
//         usuarioId: userId,
//         telefono,
//         direccion
//       }
//     });
//   } catch (error) {
//     logger.error(`Error en handleUpdateProfile: ${error}`);
//     res.status(500).json({ error: 'Error interno del servidor' });
//   }
// };