import { dbConnect } from "@/db/db";
import { errorResponse } from "@/helpers/apiResponse";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

dbConnect();

export async function GET(request: NextRequest) {
    const session = await mongoose.startSession();
    try {
        session.startTransaction();
        const response = NextResponse.json({
            message: "User logged out successfully",
            success: true,
        })

        response.cookies.set({
            name: "token",
            value: "",
            httpOnly: true,
            expires: new Date(0),
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });
        await session.commitTransaction();
        return response;

    } catch (error) {
        session.abortTransaction();
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ error: "An unknown error occurred" }, { status: 500 });
    } finally {
        session.endSession();
    }
}