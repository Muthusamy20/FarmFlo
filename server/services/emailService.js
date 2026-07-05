require('dotenv').config();
const nodemailer = require('nodemailer');

const isDev = process.env.NODE_ENV !== 'production';

const getTransporter = () => {
  if (!process.env.SMTP_HOST) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
};

const sendEmail = async ({ to, subject, html, text }) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

  if (isDev && !process.env.SMTP_HOST) {
    console.log('\n========== MOCK EMAIL ==========');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${text || html}`);
    console.log('================================\n');
    return { mock: true };
  }

  const transporter = getTransporter();
  if (!transporter) {
    console.log(`[EMAIL FALLBACK] To: ${to} | Subject: ${subject}`);
    return { mock: true };
  }

  await transporter.sendMail({
    from: process.env.MAIL_FROM || 'noreply@farmflo.com',
    to,
    subject,
    html,
    text,
  });
  return { sent: true };
};

const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${process.env.CLIENT_URL}/auth/reset-password?token=${token}`;
  return sendEmail({
    to: email,
    subject: 'FarmFlo - Password Reset',
    text: `Reset your password: ${resetUrl}`,
    html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. Link expires in 1 hour.</p>`,
  });
};

const sendVerificationEmail = async (email, token) => {
  const verifyUrl = `${process.env.CLIENT_URL}/auth/verify-email?token=${token}`;
  return sendEmail({
    to: email,
    subject: 'FarmFlo - Verify Email',
    text: `Verify your email: ${verifyUrl}`,
    html: `<p>Click <a href="${verifyUrl}">here</a> to verify your email.</p>`,
  });
};

module.exports = { sendEmail, sendPasswordResetEmail, sendVerificationEmail };
