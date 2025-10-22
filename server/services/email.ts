import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter | null = null;

export function initializeEmailService() {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPassword = process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser || !gmailPassword) {
    console.warn('⚠️ Gmail credentials not configured. Email service disabled.');
    console.warn('Set GMAIL_USER and GMAIL_APP_PASSWORD in .env to enable emails.');
    return;
  }

  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: gmailUser,
      pass: gmailPassword,
    },
  });

  console.log('✅ Email service initialized with Gmail SMTP');
}

export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  if (!transporter) {
    console.warn('Email service not initialized');
    return false;
  }

  try {
    const gmailUser = process.env.GMAIL_USER;
    await transporter.sendMail({
      from: gmailUser,
      to,
      subject,
      html,
    });
    console.log(`✅ Email sent to ${to}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    return false;
  }
}

export function generatePasswordResetTemplate(resetLink: string, username: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; }
          .header { text-align: center; margin-bottom: 20px; }
          .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
          .content { line-height: 1.6; color: #333; }
          .button { display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; border-radius: 4px; text-decoration: none; margin: 20px 0; }
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Géant Casino</div>
          </div>
          <div class="content">
            <p>Bonjour ${username},</p>
            <p>Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour continuer :</p>
            <a href="${resetLink}" class="button">Réinitialiser mon mot de passe</a>
            <p>Ce lien expire dans 1 heure.</p>
            <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Géant Casino. Tous droits réservés.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function generateOrderConfirmationTemplate(
  orderNumber: string,
  customerName: string,
  items: Array<{ productName: string; quantity: number; price: number }>,
  total: number,
  tempPickupCode: string,
  pickupDate: string,
  pickupTime: string
): string {
  const itemsHtml = items
    .map(item => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.productName}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">×${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${(item.price * item.quantity).toLocaleString()} FCFA</td>
      </tr>
    `)
    .join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; }
          .header { text-align: center; margin-bottom: 20px; background-color: #f0f0f0; padding: 20px; border-radius: 4px; }
          .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
          .order-number { font-size: 14px; color: #666; margin-top: 5px; }
          .content { line-height: 1.6; color: #333; }
          table { width: 100%; margin: 20px 0; border-collapse: collapse; }
          .pickup-info { background-color: #e3f2fd; padding: 15px; border-radius: 4px; margin: 20px 0; }
          .pickup-code { background-color: #fff3cd; padding: 15px; border-radius: 4px; margin: 20px 0; text-align: center; }
          .pickup-code strong { font-size: 24px; letter-spacing: 2px; }
          .total-row { font-weight: bold; font-size: 18px; background-color: #f0f0f0; }
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Géant Casino</div>
            <div class="order-number">Commande n° ${orderNumber}</div>
          </div>
          <div class="content">
            <p>Bonjour ${customerName},</p>
            <p>Merci pour votre commande! Voici les détails de votre commande:</p>
            
            <table>
              <thead>
                <tr style="background-color: #f0f0f0;">
                  <th style="padding: 8px; text-align: left;">Produit</th>
                  <th style="padding: 8px; text-align: right;">Quantité</th>
                  <th style="padding: 8px; text-align: right;">Prix</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
                <tr class="total-row">
                  <td colspan="2" style="padding: 12px; text-align: right;">Total:</td>
                  <td style="padding: 12px; text-align: right;">${total.toLocaleString()} FCFA</td>
                </tr>
              </tbody>
            </table>

            <div class="pickup-info">
              <h3 style="margin-top: 0;">Informations de retrait</h3>
              <p><strong>Date:</strong> ${pickupDate}</p>
              <p><strong>Heure:</strong> ${pickupTime}</p>
              <p style="color: #d32f2f; font-weight: bold;">⚠️ Politique de retrait: 24h pour produits périssables, 48h pour non périssables</p>
            </div>

            <div class="pickup-code">
              <p style="margin-bottom: 10px;">Votre code de retrait temporaire:</p>
              <strong>${tempPickupCode}</strong>
              <p style="font-size: 12px; color: #666; margin-top: 10px;">Présentez ce code au moment du retrait</p>
            </div>

            <p>Votre paiement sera traité lors du retrait en magasin.</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Géant Casino. Tous droits réservés.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function generateTwoFactorCodeTemplate(code: string, username: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; }
          .header { text-align: center; margin-bottom: 20px; }
          .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
          .content { line-height: 1.6; color: #333; }
          .code-box { background-color: #f0f0f0; padding: 20px; border-radius: 4px; text-align: center; margin: 20px 0; }
          .code { font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #2563eb; font-family: monospace; }
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Géant Casino</div>
          </div>
          <div class="content">
            <p>Bonjour ${username},</p>
            <p>Voici votre code de vérification pour accéder à votre compte:</p>
            <div class="code-box">
              <div class="code">${code}</div>
            </div>
            <p>Ce code expire dans 10 minutes.</p>
            <p>Si vous n'avez pas demandé ce code, ignorez cet email.</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Géant Casino. Tous droits réservés.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
