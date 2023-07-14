import nodemailer from 'nodemailer';

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

export default sendEmail;
