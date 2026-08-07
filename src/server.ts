import app from './app';
import { logger } from './Config/logger';
import { env } from './Config/env';

// const PORT = env.PORT;

// app.listen(PORT, () => {
//   logger.info(`🚀 Servidor seguro corriendo en http://localhost:${PORT}`);
// });


const server = app.listen(env.PORT, () => {
  logger.info(`🚀 Servidor seguro corriendo en http://localhost:${env.PORT}`);
});

// 🛡️ CAPA 1: Captura errores en código asíncrono o promesas sin try/catch
process.on('unhandledRejection', (reason: any, promise) => {
  logger.error(`🚨 RECHAZO DE PROMESA NO MANEJADO: Interceptado con éxito para evitar la caída del servidor.`);
  logger.error(`   Detalles del motivo: ${reason?.stack || reason}`);
  // El servidor no se cae, el error se registra de forma privada y el sistema sigue operando.
});

// 🛡️ CAPA 2: Captura errores críticos síncronos imprevistos en el hilo principal
process.on('uncaughtException', (error) => {
  logger.error(`🚨 EXCEPCIÓN NO CAPTURADA CRÍTICA: Interceptada en el hilo principal.`);
  logger.error(`   Trazado del error: ${error.stack}`);
  
// 🛡️ Capturamos la señal SIGTERM (Cuando la nube o PM2 nos ordena apagarnos)
process.on('SIGTERM', () => {
  logger.info('Señal SIGTERM recibida. Iniciando cierre limpio del servidor...');
  
  // 🚪 Usamos la constante 'server' para cerrar las puertas de inmediato
  server.close(() => {
    logger.info('🚫 El servidor Express ya no acepta nuevas peticiones de red.');
    
    // Aquí cierras de forma segura la conexión a SQL Server antes de morir por completo
    // await sqlServerPool.close();
    
    logger.info('✅ Conexiones a bases de datos cerradas. Backend apagado con éxito.');
    process.exit(0); // Terminación exitosa sin errores
  });
});

  // Opcional en producción: Si el error es extremadamente grave (ej. nos quedamos sin memoria RAM),
  // se recomienda hacer un cierre limpio (Graceful Shutdown) en lugar de un congelamiento:
  /*
  server.close(() => {
    logger.info('Servidor Express cerrado de forma limpia.');
    process.exit(1);
  });
  */
});