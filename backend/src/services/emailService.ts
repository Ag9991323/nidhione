import nodemailer from 'nodemailer';
import { config } from '../config';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: config.smtp.user,
    pass: config.smtp.pass,
  },
});

export async function sendOtpEmail(email: string, otp: string) {
  await transporter.sendMail({
    from: `"NidhiOne" <${config.smtp.user}>`,
    to: email,
    subject: 'Your NidhiOne Registration OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #1e3a8a; margin-bottom: 8px;">Verify your email</h2>
        <p style="color: #444;">Use the OTP below to complete your NidhiOne registration:</p>
        <div style="font-size: 36px; font-weight: bold; letter-spacing: 12px; color: #1e3a8a; padding: 20px 0;">
          ${otp}
        </div>
        <p style="color: #888; font-size: 13px;">This OTP is valid for 10 minutes. Do not share it with anyone.</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, otp: string) {
  await transporter.sendMail({
    from: `"NidhiOne" <${config.smtp.user}>`,
    to: email,
    subject: 'Reset your NidhiOne password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #1e3a8a; margin-bottom: 8px;">Reset your password</h2>
        <p style="color: #444;">Use the OTP below to reset your NidhiOne password:</p>
        <div style="font-size: 36px; font-weight: bold; letter-spacing: 12px; color: #1e3a8a; padding: 20px 0;">
          ${otp}
        </div>
        <p style="color: #888; font-size: 13px;">This OTP is valid for 10 minutes. If you did not request a password reset, please ignore this email.</p>
      </div>
    `,
  });
}
