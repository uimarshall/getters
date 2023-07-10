import mongoose from 'mongoose';
import logger from '../logger/logger.js';
// import logger from '../../logger/logger.js';

const connectDb = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    logger.info(`MongoDb Database Successfully Connected with HOST: ${conn.connection.host}`);
  } catch (error) {
    logger.error(error);
    process.exit(1);
  }
};

export default connectDb;
