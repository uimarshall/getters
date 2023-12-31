import nodemailer from 'nodemailer';
import ErrorHandler from './errorHandler.js';
import logger from '../logger/logger.js';

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
      host: process.env.SMTP_HOST_GMAIL,
      port: process.env.SMTP_PORT_GMAIL,
      secure: false, // use SSL instead of TLS for backwards compatibility with old browsers (https://github.com/Facebook /nodemailer/issues/906) or port number 465.
      auth: {
        user: process.env.SMTP_EMAIL_SENDER_GMAIL,
        pass: process.env.SMTP_EMAIL_SENDER_PASSWORD,
      },
    });

    // verify connection configuration
    transporter.verify((error, success) => {
      if (error) {
        logger.error(error);
      } else {
        logger.info('Email Server is ready to take our messages');
      }
    });

    const message = {
      from: `${process.env.SMTP_EMAIL_SENDER_NAME} <${process.env.SMTP_EMAIL_SENDER}>`,
      to,
      subject: 'GetHub Password Recovery',
      html: `<p>You are receiving this email because you (or someone else) have requested the reset of a password. </p>
             <p>Please click on the following link, or paste this into your browser to complete the process within half an hour of receiving it: </p> 
             <p>${process.env.CLIENT_URL}/reset-password/${resetToken}</p>
              <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>`,
    };
    // Send the actual email to the user
    await transporter.sendMail(message);
  } catch (error) {
    ErrorHandler(error.message, error.statusCode);
  }
};

class EmailSender {
  // Initialization with SMTP options
  constructor(smtpOptions) {
    this.transporter = nodemailer.createTransport(smtpOptions);
  }

  // Method for sending emails
  async sendEmail(from, to, subject, html) {
    await this.transporter.sendMail({ from, to, subject, html });
  }
}

export { sendEmail, sendEmailByGmail, EmailSender };
