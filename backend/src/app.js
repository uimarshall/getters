import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import morganMiddleware from './logger/morganMiddleware.js';
import { errorMiddleware, notFound } from './middlewares/errorsMiddleware.js';
import userRoutes from './routes/userRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import tagRoutes from './routes/tagRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import commentRoutes from './routes/commentRoutes.js';

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

// Route middleware

app.use('/api/v1/users', userRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/tags', tagRoutes);
app.use('/api/v1/blogs', blogRoutes);
app.use('/api/v1/comments', commentRoutes);

// Custom Error Middleware to handle error
app.use(notFound);
app.use(errorMiddleware);

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
