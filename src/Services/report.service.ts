
// Simulacion de base de dartos para el Test
export const TestsDatos = [
    {id:'user_id_test_01', email:'juan@fincash.com', user:'Juan Soto'}
]

export class ReportService {

    async procesarTestRoute( username:string ): Promise<{user: any; id:string}> {

        const existeUser = TestsDatos.find( user => user.user === username )
        if( !existeUser ) throw new Error('Usuario no Existe');

        return{
            user: { user:existeUser.user, email:existeUser.email},
            id:existeUser.id,
        }
    }

    async procesarActualizacionReporte(mes: string, nuevoBalance: string, estadoLogs: string, adminId: string) {
        // Aquí iría la lógica algorítmica compleja o guardado en Base de Datos
        return {
        mes,
        nuevoBalance,
        estadoLogs,
        modificadoPor: adminId,
        fechaActualizacion: new Date()
        };
    }

    async procesarActualizacionPerfil(telefono: string, direccion: string, userId: string) {
        return {
        usuarioId: userId,
        telefono,
        direccion,
        actualizadoEn: new Date()
        };
    }
}