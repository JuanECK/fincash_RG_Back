import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../Config/env';

// Simulación de Base de Datos en memoria
export const mockUsuariosBD = [
  { id: "user_admin_01", email: "admin@fincash.com", passwordHash: "", role: "admin" },
  { id: "user_comun_02", email: "cliente@fincash.com", passwordHash: "", role: "user" }
];

export class AuthService {
  // Inicializador auxiliar para las contraseñas de prueba
  async initHashes(): Promise<void> {
    if (!mockUsuariosBD[0].passwordHash) {
      mockUsuariosBD[0].passwordHash = await bcrypt.hash("Admin123!", 10);
      mockUsuariosBD[1].passwordHash = await bcrypt.hash("User123!", 10);
    }
  }

  async registrarUsuario(email: string, passwordPlain: string): Promise<any> {
    await this.initHashes();
    const existe = mockUsuariosBD.find(u => u.email === email);
    if (existe) throw new Error('EMAIL_EXISTS');

    const passwordHash = await bcrypt.hash(passwordPlain, 10);
    const nuevoUsuario = {
      id: `user_${Math.random().toString(36).substring(2, 11)}`,
      email,
      passwordHash,
      role: 'user'
    };

    mockUsuariosBD.push(nuevoUsuario);
    return { id: nuevoUsuario.id, email: nuevoUsuario.email };
  }

  async verificarCredenciales(email: string, passwordPlain: string): Promise<{ token: string; user: any }> {
    await this.initHashes();
    const usuario = mockUsuariosBD.find(u => u.email === email);
    if (!usuario) throw new Error('INVALID_CREDENTIALS');

    const esValida = await bcrypt.compare(passwordPlain, usuario.passwordHash);
    if (!esValida) throw new Error('INVALID_CREDENTIALS');

    const token = jwt.sign(
      { id: usuario.id, role: usuario.role },
      env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return {
      token,
      user: { id: usuario.id, email: usuario.email, role: usuario.role }
    };
  }
}