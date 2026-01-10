import dotenv from 'dotenv';
import app from './app.js';
import mongoose from 'mongoose';
import {DB_NAME} from './constants.js';
import connectDB from './db/index.js';

dotenv.config({
    path: './.env'
})

const PORT = process.env.PORT || 5000;

connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running on port ${PORT}`);
    })
    // console.log("Database connection established successfully.");
})
.catch((error) => {
    console.error("Failed to connect to the database:", error);
});


