import { logger } from '../Config/logger';

// Simulación de la tabla de tokens en SQL Server
const mockTablaTokens: any[] = [];

export class TokenRepository {
  
  async saveToken(usuarioId: string, tokenHash: string, expiresAt: number): Promise<void> {
    const nuevoRegistro = { usuarioId, tokenHash, expiresAt };
    
    // 🛡️ Simulación de inserción parametrizada
    logger.info(`[SQL SERVER] Ejecutando: INSERT INTO [dbo].[PasswordResetTokens] ([usuario_id], [token_hash], [expires_at]) VALUES (@p0, @p1, @p2)`);
    logger.info(`             Parámetros: @p0='${usuarioId}', @p1='[PROTECTED_HASH]', @p2=${expiresAt}`);
    
    mockTablaTokens.push(nuevoRegistro);
  }

  async findValidToken(tokenHash: string): Promise<any | null> {
    // Busca un token que coincida con el hash y cuya fecha de expiración sea mayor al tiempo actual (Date.now())
    logger.info(`[SQL SERVER] Ejecutando: SELECT TOP 1 * FROM [dbo].[PasswordResetTokens] WHERE [token_hash] = @p0 AND [expires_at] > @p1`);
    logger.info(`             Parámetros: @p0='[PROTECTED_HASH]', @p1=${Date.now()}`);
    
    const registro = mockTablaTokens.find(t => t.tokenHash === tokenHash && t.expiresAt > Date.now());
    return registro || null;
  }

  async deleteToken(tokenHash: string): Promise<void> {
    logger.info(`[SQL SERVER] Ejecutando: DELETE FROM [dbo].[PasswordResetTokens] WHERE [token_hash] = @p0`);
    logger.info(`             Parámetros: @p0='[PROTECTED_HASH]'`);
    
    const registro = mockTablaTokens.find(t => t.tokenHash === tokenHash);
    if (registro) {
      const index = mockTablaTokens.indexOf(registro);
      if (index > -1) mockTablaTokens.splice(index, 1);
    }
  }
}