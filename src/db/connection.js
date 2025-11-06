import mongoose, { mongo } from "mongoose";
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/queuectl";

export const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Connected to mongo db");
    } catch (err) {
        console.error("Connection failed: ", err.message);
        process.exit(1);
    }
};

export const closeDB = async () => {
    await mongoose.connection.close();
    console.log("Connection closed");
}