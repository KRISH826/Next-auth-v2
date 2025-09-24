import mongoose from "mongoose";

let isConnected = false;

export async function dbConnect() {
    if (isConnected) {
        return;
    }
    try {
        const db = await mongoose.connect(process.env.MONGODB_URI!, {
            dbName: process.env.DB_NAME,
        });
        isConnected = db.connections[0].readyState === 1;
        console.log("Database connected successfully");

    } catch (error) {
        console.error("❌ MongoDB connection error:", error);
        throw new Error("Failed to connect to MongoDB");
    }
}