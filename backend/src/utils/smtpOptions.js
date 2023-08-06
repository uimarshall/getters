import dotenv from 'dotenv';
import logger from '../logger/logger.js';

dotenv.config({ path: 'backend/src/config/.env' });
logger.debug(process.env.SMTP_PORT_GMAIL);
const smtpOptions = {
  host: process.env.SMTP_HOST_GMAIL,
  port: process.env.SMTP_PORT_GMAIL,
  secure: false, // use SSL instead of TLS for backwards compatibility with old browsers (https://github.com/Facebook /nodemailer/issues/906) or port number 465.
  auth: {
    user: process.env.SMTP_EMAIL_SENDER_GMAIL,
    pass: process.env.SMTP_EMAIL_SENDER_PASSWORD,
  },
};

export default smtpOptions;
