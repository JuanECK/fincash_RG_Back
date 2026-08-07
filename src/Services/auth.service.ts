import bcrypt from 'bcrypt';
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../Config/env';
import { EmailService } from './email.service';
import { UserRepository } from '../Repositories/user.repository';
import { TokenRepository } from '../Repositories/token.repository';

// Estructura temporal para guardar los tokens de recuperación en memoria (Simulando tabla DB)
export const mockPasswordResetTokens: any[] = [];

// Simulación de Base de Datos en memoria
// export const mockUsuariosBD = [
//   { id: "user_admin_01", email: "j.soto@oncecapital.mx", passwordHash: "", role: "admin" },
//   { id: "user_comun_02", email: "cliente@fincash.com", passwordHash: "", role: "user" }
// ];

const emailService = new EmailService(); // Instanciamos
const userRepository = new UserRepository(); // Instanciamos
const tokenRepository = new TokenRepository(); // Instanciamos

export class AuthService {

  // Inicializador auxiliar para las contraseñas de prueba
  // async initHashes(): Promise<void> {
  //   if (!mockUsuariosBD[0].passwordHash) {
  //     mockUsuariosBD[0].passwordHash = await bcrypt.hash("Admin123!", 10);
  //     mockUsuariosBD[1].passwordHash = await bcrypt.hash("User123!", 10);
  //   }
  // }

  async registrarUsuario(email: string, passwordPlain: string): Promise<any> {
    // await this.initHashes();
    // const existe = mockUsuariosBD.find(u => u.email === email);
    const existe = await userRepository.findByEmail( email )
    if (existe) throw new Error('EMAIL_EXISTS');

    const passwordHash = await bcrypt.hash(passwordPlain, 10);

    const resultado = await userRepository.create({
      email,
      passwordHash,
      role:'user'
    })

    return resultado

    // const nuevoUsuario = {
    //   id: `user_${Math.random().toString(36).substring(2, 11)}`,
    //   email,
    //   passwordHash,
    //   role: 'user'
    // };

    // mockUsuariosBD.push(nuevoUsuario);
    // return { id: nuevoUsuario.id, email: nuevoUsuario.email };
  }

  async verificarCredenciales(email: string, passwordPlain: string): Promise<{ token: string; user: any }> {
    // await this.initHashes();
    // const usuario = mockUsuariosBD.find(u => u.email === email);
     const usuario = await userRepository.findByEmail(email);
     console.log(usuario)
    if (!usuario) throw new Error('INVALID_CREDENTIALS');

    const esValida = await bcrypt.compare(passwordPlain, usuario.passwordHash);
    console.log({
      plain:passwordPlain,
      BasePass:usuario.password
    })
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

  async generarTokenRecuperacion(email: string): Promise<void> {
    // const usuario = mockUsuariosBD.find(u => u.email === email);
    const usuario = await userRepository.findByEmail(email);
    
    console.log({email:email})
    // 🛡️ REGLA DE ORO: Si el usuario NO existe, salimos en silencio sin lanzar error.
    if (!usuario) {
      // Simulamos un retraso aleatorio en milisegundos para engañar los ataques de tiempo (Timing Attacks)
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));
      return; 
    }

    console.log('pase el validador')
    // Si existe, creamos un token criptográfico seguro aleatorio (no JWT, para que sea de un solo uso)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutos

    // Guardamos el token asociado al usuario con una expiración de 15 minutos
    // mockPasswordResetTokens.push({
    //   usuarioId: usuario.id,
    //   tokenHash,
    //   expiresAt: Date.now() + 15 * 60 * 1000 // 15 minutos
    // });

      await tokenRepository.saveToken(usuario.id, tokenHash, expiresAt);
    // console.log('continuo la operacion', mockPasswordResetTokens )
    // 📧 Aquí iría tu servicio de envío de correos (ej. Nodemailer)
    //  console.log(`[EMAIL SIMULADO] Enviar a ${email} el enlace: /reset-password?token=${resetToken}`);
     console.log(`📧 [EMAIL SIMULADO] Enlace enviado a ${email} -> http://localhost:3000/api/v1/auth/reset-password?token=${resetToken}`);
     emailService.sendPasswordResetEmail(usuario.email, resetToken);
  }

  async cambiarContrasenaConToken(tokenPlain: string, passwordPlain: string): Promise<void> {
    const tokenHash = crypto.createHash('sha256').update(tokenPlain).digest('hex');
    
    // Buscar el token que no haya expirado
    // const registroToken = mockPasswordResetTokens.find(
    //   t => t.tokenHash === tokenHash && t.expiresAt > Date.now()
    // );
     const registroToken = await tokenRepository.findValidToken(tokenHash);

    if (!registroToken) {
      throw new Error('TOKEN_INVALID_OR_EXPIRED');
    }

    // Buscar al usuario dueño del token
    // const usuario = mockUsuariosBD.find(u => u.id === registroToken.usuarioId);
    const usuario = await userRepository.findById(registroToken.usuarioId);
    if (!usuario) throw new Error('USER_NOT_FOUND');

    // Hashear la nueva contraseña con bcrypt
    // usuario.passwordHash = await bcrypt.hash(passwordPlain, 10);
    const nuevoPasswordHash = await bcrypt.hash(passwordPlain, 10);

    // 🔥 Destruir el token para que jamás pueda volverse a usar (Single Use Token)
    await userRepository.updatePassword(usuario.id, nuevoPasswordHash);
    await tokenRepository.deleteToken(tokenHash);
    // const index = mockPasswordResetTokens.indexOf(registroToken);
    // if (index > -1) mockPasswordResetTokens.splice(index, 1);
  }

}