import { logger } from '../Config/logger';

export const TestsDatos: any[] = [
    {id:'user_id_test_01', email:'j.soto@oncecapital.mx', user:'Juan Soto'}
]

export class ReportRepository {

    async TestRoutePrueba( email:string ):Promise<any>{
        logger.info(`[SQL SERVER] Ejecutando: SELECT * FROM [dbo].[Usuarios] WHERE [email] = @p0 | Parámetros: @p0='${email}'`);
        const usuario = TestsDatos.find(u => u.email === email);
        return usuario || null;
    }
  
    async updateMonthlyReport(mes: string, nuevoBalance: string, estadoLogs: string, adminId: string): Promise<any> {
    // 🛡️ Simulación de UPDATE parametrizado contra inyección SQL
        logger.info(`[SQL SERVER] Ejecutando: UPDATE [dbo].[ReportesFinancieros] SET [balance] = @p0, [estado_logs] = @p1, [modificado_por] = @p2, [updated_at] = GETDATE() WHERE [mes] = @p3`);
        logger.info(`             Parámetros: @p0='${nuevoBalance}', @p1='${estadoLogs}', @p2='${adminId}', @p3='${mes}'`);

    // Simulamos el objeto de retorno de la base de datos afectando las filas
        return {
        mes,
        nuevoBalance,
        estadoLogs,
        modificadoPor: adminId,
        fechaActualizacion: new Date()
        };
  }

    async updateContactProfile(telefono: string, direccion: string, userId: string): Promise<any> {
        logger.info(`[SQL SERVER] Ejecutando: UPDATE [dbo].[ClientesInfo] SET [telefono] = @p0, [direccion] = @p1, [updated_at] = GETDATE() WHERE [usuario_id] = @p2`);
        logger.info(`             Parámetros: @p0='${telefono}', @p1='${direccion}', @p2='${userId}'`);

        return {
        usuarioId: userId,
        telefono,
        direccion,
        actualizadoEn: new Date()
        };
  }
}