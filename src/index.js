import dotenv from 'dotenv';

import mongoose from 'mongoose';
import {DB_NAME} from './constants.js';
import connectDB from './db/index.js';

dotenv.config({
    path: './env'
})

connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running on port ${process.env.PORT || 8000}`);
    })
    // console.log("Database connection established successfully.");
})
.catch((error) => {
    console.error("Failed to connect to the database:", error);
});import app from './app.js';

const PORT = process.env.PORT || 5000;