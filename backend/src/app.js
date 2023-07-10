import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
// import morganMiddleware from './logger/morganMiddleware';
import cookieParser from 'cookie-parser';
import morganMiddleware from './logger/morganMiddleware.js';

// Load the environment variables
dotenv.config({ path: 'backend/src/config/.env' });

const app = express();

// Middleware
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morganMiddleware);
app.use(cors()); // Make sure you Enable CORS correctly, or you will get CORS errors.

app.get('/', (req, res) => {
  res.send('Express + Linting + found solution, better');
});
app.get('/greet', (req, res) => {
  res.send('Hello Guys');
});
app.get('/time', (req, res) => {
  res.json({ time: new Date().toISOString() });
});

export default app;
