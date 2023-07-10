import winston, { format, createLogger, transports, addColors } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const { combine, timestamp, label, printf, colorize } = format;

// Label
const CATEGORY = 'Custom format';

// Using the printf format.
const customFormat = printf(({ level, message, label, timestamp }) => `${timestamp} [${label}] ${level}: ${message}`);

// Define different colors for each level.
// Colors make the log message more visible,
// adding the ability to focus or ignore messages.
const colors = {
  error: 'red',
  warn: 'orange',
  info: 'green',
  http: 'blue',
  debug: 'white',
};

// Tell winston that you want to link the colors
// defined above to the severity levels.
addColors(colors);

// DailyRotateFile func()

const fileRotateTransport = new DailyRotateFile({
  filename: 'logger/logs/application-%DATE%.log',
  datePattern: 'YYYY-MM-DD-HH',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '15d',
});

// Create logger
const logger = createLogger({
  level: 'debug',
  format: combine(
    label({ label: CATEGORY }),
    timestamp({
      format: 'MMM-DD-YYYY HH:mm:ss',
    }),
    // Tell Winston that the logs must be colored
    colorize({ all: true }),
    customFormat
    // prettyPrint()
  ),
  transports: [
    // new transports.File({
    //   filename: 'logger/logs/all.log',
    // }),
    // new transports.File({
    //   level: 'error',
    //   filename: 'logger/logs/error.log',
    // }),
    fileRotateTransport,
    new transports.Console(),
  ],
});

// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV !== 'PRODUCTION') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

export default logger;
