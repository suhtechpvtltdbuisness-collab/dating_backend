import nodemailer from "nodemailer";
import { env } from "../config/env";

function getTransporter() {
  const { host, port, user, pass } = env.mail;

  return nodemailer.createTransport({
    host,
    port,
    auth: {
      user,
      pass,
    },
  });
}

export async function sendOtpMail(email: string, otp: string): Promise<void> {
  const transporter = getTransporter();

  await transporter.sendMail({
    from: env.mail.from,
    to: email,
    subject: "Your OTP code",
    text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
    html: `<p>Your OTP is <strong>${otp}</strong>.</p><p>It will expire in 5 minutes.</p>`,
  });
}
