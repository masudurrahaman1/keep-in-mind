const nodemailer = require('nodemailer');

// We'll store the test account here so we don't recreate it on every email
let testAccount = null;

const createTransporter = async () => {
  // If user provided real credentials in .env, use them
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Otherwise, automatically generate a test account!
  if (!testAccount) {
    console.log('⏳ Generating a free Test Email Account (Ethereal) since no SMTP_USER was found in .env...');
    testAccount = await nodemailer.createTestAccount();
  }

  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
};

const sendVerificationEmail = async (toEmail, code) => {
  try {
    const transporter = await createTransporter();

    const mailOptions = {
      from: process.env.SMTP_USER ? `"Keep In Mind" <${process.env.SMTP_USER}>` : '"Keep In Mind (Test)" <test@keepinmind.local>',
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

    const info = await transporter.sendMail(mailOptions);

    // If we are using the test account, provide a clickable link to view the email!
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('\n======================================================');
      console.log('✅ TEST EMAIL SENT SUCCESSFULLY!');
      console.log(`📧 View the email here: ${nodemailer.getTestMessageUrl(info)}`);
      console.log('======================================================\n');
    }
  } catch (err) {
    console.error('❌ Failed to send email:', err.message);
  }
};

module.exports = {
  sendVerificationEmail
};
