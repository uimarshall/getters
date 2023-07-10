import app from './app.js';
// import logger from '../logger/logger.js';

import connectDb from './config/db.js';
import logger from './logger/logger.js';

// Connect Db
connectDb();

// const port = process.env.PORT ?? 5000;

const port = process.env.PORT || 5000;

app.listen(port, () => {
  logger.info(`[server]: Server is running at http://localhost:${port} in ${process.env.NODE_ENV} mode`);
});
