import { logger } from '../Config/logger';

// Simulación de la tabla [dbo].[Usuarios] en SQL Server
const mockTablaUsuarios: any[] = [
    { id: "user_admin_01", email: "j.soto@oncecapital.mx", passwordHash: "$2b$10$GO4At85YOfN2kvuezmiDgOF6xgy4sk.ktcNlxd4XSK9ws4GnnPwEi", role: "admin" },
    { id: "user_comun_02", email: "cliente@fincash.com", passwordHash: "$2b$10$5vGwyMnsoCpDRjxh2D2OcuR5WcaM3CUIndRDv9KlnNjH939fcY/o.", role: "user" }
];

export class UserRepository {
  
  async findByEmail(email: string): Promise<any | null> {
    // 🛡️ SIMULACIÓN DE CONSULTA PARAMETRIZADA (Sanitizada contra Inyección SQL)
    // En SQL Server real esto se ejecutaría internamente como:
    // exec sp_executesql N'SELECT * FROM Usuarios WHERE email = @p0', N'@p0 nvarchar(256)', @p0=N'email@test.com'
    
    logger.info(`[SQL SERVER] Ejecutando: SELECT * FROM [dbo].[Usuarios] WHERE [email] = @p0 | Parámetros: @p0='${email}'`);
    
    const usuario = mockTablaUsuarios.find(u => u.email === email);
    return usuario || null;
  }

  async findById(id: string): Promise<any | null> {
    logger.info(`[SQL SERVER] Ejecutando: SELECT * FROM [dbo].[Usuarios] WHERE [id] = @p0 | Parámetros: @p0='${id}'`);
    const usuario = mockTablaUsuarios.find(u => u.id === id);
    return usuario || null;
  }

  async create(user: { email: string; passwordHash: string; role: string }): Promise<any> {
    const nuevoUsuario = {
      id: `usr_${Math.random().toString(36).substring(2, 11)}`,
      email: user.email,
      passwordHash: user.passwordHash,
      role: user.role,
      createdAt: new Date()
    };

    // 🛡️ SIMULACIÓN DE INSERCIÓN PARAMETRIZADA
    logger.info(`[SQL SERVER] Ejecutando: INSERT INTO [dbo].[Usuarios] ([id], [email], [password_hash], [role]) VALUES (@p0, @p1, @p2, @p3)`);
    logger.info(`             Parámetros: @p0='${nuevoUsuario.id}', @p1='${nuevoUsuario.email}', @p2='[PROTECTED_HASH]', @p3='${nuevoUsuario.role}'`);

    mockTablaUsuarios.push(nuevoUsuario);
    return { id: nuevoUsuario.id, email: nuevoUsuario.email, role: nuevoUsuario.role };
  }

  async updatePassword(usuarioId: string, nuevoPasswordHash: string): Promise<void> {
    logger.info(`[SQL SERVER] Ejecutando: UPDATE [dbo].[Usuarios] SET [password_hash] = @p0 WHERE [id] = @p1`);
    logger.info(`             Parámetros: @p0='[PROTECTED_HASH]', @p1='${usuarioId}'`);
    
    const usuario = mockTablaUsuarios.find(u => u.id === usuarioId);
    if (usuario) {
      usuario.passwordHash = nuevoPasswordHash;
    }
  }
}