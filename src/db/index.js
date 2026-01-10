import mongoose from 'mongoose';
import {DB_NAME} from '../constants.js';

const connectDB = async () => {
  try {
    // console.log("MONGODB_URI =", process.env.MONGODB_URI);
    const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
    console.log(`\nMongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection error:", error);  
    process.exit(1);
    // throw error;
  }
};

export default connectDB;