import nodemailer from 'nodemailer';
import ErrorHandler from './errorHandler.js';

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const message = {
    from: `${process.env.SMTP_EMAIL_SENDER_NAME} <${process.env.SMTP_EMAIL_SENDER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  await transporter.sendMail(message);
};

// send email using Gmail as transporter and OAuth2  as authentication mechanism
const sendEmailByGmail = async (to, resetToken) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // use SSL instead of TLS for backwards compatibility with old browsers (https://github.com/Facebook /nodemailer/issues/906) or port number 465.
      auth: {
        user: process.env.SMTP_EMAIL_SENDER_GMAIL,
        pass: process.env.SMTP_EMAIL_SENDER_PASSWORD,
      },
    });

    const message = {
      from: `${process.env.SMTP_EMAIL_SENDER_NAME} <${process.env.SMTP_EMAIL_SENDER}>`,
      to,
      subject: 'Password reset',
      html: `<p>You are receiving this email because you (or someone else) have requested the reset of a password. </p>
    <p>Please click on the following link, or paste this into your browser to complete the process within one hour of receiving it: </p> 
    <p>http://localhost:3000/reset-password/${resetToken}</p>
    <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>`,
    };
    await transporter.sendMail(message);
  } catch (error) {
    ErrorHandler(error.message, error.statusCode);
  }
};

export { sendEmail, sendEmailByGmail };
