import { ReportRepository } from '../Repositories/report.repository';

const reportRepository = new ReportRepository();
// Simulacion de base de dartos para el Test


export class ReportService {

    async procesarTestRoute( email:string ): Promise<{user: any; id:string}> {

        // const existeUser = TestsDatos.find( user => user.user === username )
        const existeUser = await reportRepository.TestRoutePrueba( email )
        if( !existeUser ) throw new Error('Credenciales inválidas');

        return{
            user: { user:existeUser.user, email:existeUser.email},
            id:existeUser.id,
        }
    }

    async procesarActualizacionReporte(mes: string, nuevoBalance: string, estadoLogs: string, adminId: string) {
        // Aquí iría la lógica algorítmica compleja o guardado en Base de Datos

        const resultado = await reportRepository.updateMonthlyReport(mes, nuevoBalance, estadoLogs, adminId);
        return resultado;

        // return {
        // mes,
        // nuevoBalance,
        // estadoLogs,
        // modificadoPor: adminId,
        // fechaActualizacion: new Date()
        // };
    }

    async procesarActualizacionPerfil(telefono: string, direccion: string, userId: string) {
        const resultado = await reportRepository.updateContactProfile(telefono, direccion, userId);
        return resultado;
        // return {
        // usuarioId: userId,
        // telefono,
        // direccion,
        // actualizadoEn: new Date()
        // };
    }
}