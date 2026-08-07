import nodemailer from 'nodemailer';
import { env } from '../Config/env';
import { logger } from '../Config/logger';

export class EmailService {
  private async createTransporter() {
    // ⚙️ SI ESTAMOS EN PRODUCCIÓN: Usamos el servidor SMTP real configurado en el .env
    if (env.NODE_ENV === 'production') {
      return nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_PORT === 465, // true para puerto 465, false para otros
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        },
      });
    }

    // 🧪 SI ESTAMOS EN DESARROLLO (LOCAL): Generamos un servidor SMTP de prueba etéreo (Ethereal)
    // No necesitas configurar nada, Nodemailer se encarga de crear credenciales falsas en segundos.
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    try {
      const transporter = await this.createTransporter();
      
      const resetLink = `${env.ALLOWED_ORIGIN}/reset-password?token=${token}`;

      const mailOptions = {
        from: env.EMAIL_FROM,
        to: to,
        subject: 'Recuperación de Contraseña - Fincash RG',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 8px;">
            <h2 style="color: #333;">Solicitud de recuperación de contraseña</h2>
            <p>Has recibido una solicitud para restablecer la contraseña de tu cuenta en Fincash RG.</p>
            <p>Este enlace es válido por 15 minutos y es de un solo uso:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Restablecer mi contraseña</a>
            </div>
            <p style="color: #666; font-size: 12px;">Si tú no solicitaste este cambio, puedes ignorar este correo de forma segura.</p>
          </div>
        `,
      };

      const info = await transporter.sendMail(mailOptions);

      // En desarrollo, Nodemailer nos regala una URL para ver el correo renderizado
      if (env.NODE_ENV !== 'production') {
        logger.info(`✉️ Correo de prueba enviado con éxito.`);
        logger.info(`🔗 URL de previsualización web: ${nodemailer.getTestMessageUrl(info)}`);
      } else {
        logger.info(`✉️ Correo de recuperación real enviado a: ${to}`);
      }
    } catch (error) {
      logger.error(`Error crítico enviando correo electrónico: ${error}`);
      // No lanzamos el error hacia arriba para mantener la "Respuesta Opaca" y evitar Information Disclosure
    }
  }
}