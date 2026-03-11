import nodemailer from "nodemailer";

export async function sendOTP(email: string, otp: string) {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    const mailOptions = {
        from: process.env.SMTP_USER,
        to: email,
        subject: "Kode OTP Login / Registrasi Stockify",
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
        <h2 style="color: #1e293b; text-align: center;">Kode OTP Stockify</h2>
        <p style="color: #475569; font-size: 16px;">Gunakan kode berikut untuk masuk atau mendaftar ke akun Anda:</p>
        <div style="background-color: #f1f5f9; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <strong style="font-size: 32px; letter-spacing: 4px; color: #2563eb;">${otp}</strong>
        </div>
        <p style="color: #64748b; font-size: 14px;">Kode ini hanya berlaku selama 5 menit. Jangan bagikan kode ini kepada siapa pun.</p>
        <hr style="border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">Tim Stockify &copy; ${new Date().getFullYear()}</p>
      </div>
    `,
    };

    await transporter.sendMail(mailOptions);
}
