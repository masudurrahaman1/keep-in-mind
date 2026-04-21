const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER, // e.g. yourmail@gmail.com
      pass: process.env.SMTP_PASS, // e.g. App Password
    },
  });
};

const sendVerificationEmail = async (toEmail, code) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('⚠️ SMTP user/pass not configured in .env. Falling back to console logging.');
    console.log(`\n\n========================\n📧 MOCK EMAIL to ${toEmail}\nKeep In Mind Verification Code: ${code}\n========================\n\n`);
    return;
  }

  const transporter = createTransporter();

  const mailOptions = {
    from: `"Keep In Mind" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: `Your Keep In Mind Verification Code: ${code}`,
    html: `
      <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #4F46E5;">Welcome to Keep In Mind!</h2>
        <p>Thank you for signing up. Please use the following 6-digit code to verify your email address and complete your registration:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; text-align: center; padding: 20px; margin: 20px 0; background: #f3f4f6; border-radius: 8px;">
          ${code}
        </div>
        <p style="color: #666; font-size: 14px;">This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

module.exports = {
  sendVerificationEmail
};
