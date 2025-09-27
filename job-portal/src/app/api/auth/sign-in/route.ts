import { errorResponse, successResponse } from "@/helpers/apiResponse";
import User from "@/models/userModel";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import * as argon2 from "argon2";
import { generateToken, verifyToken } from "@/helpers/jwt";
import { dbConnect } from "@/db/db";


dbConnect();

export async function POST(request: NextRequest) {
    const session = await mongoose.startSession();
    try {
        session.startTransaction();
        const { email, phonenumber, password } = await request.json();
        const existingUser = await User.findOne({
            $or: [
                { email },
                { phonenumber }
            ]
        });
        if (!existingUser) {
            return errorResponse("User not found", 404);
        }
        const vereifyPassword = await argon2.verify(existingUser.password, password);
        if (!vereifyPassword) {
            return errorResponse("Invalid password", 400);
        }
        const isVerified = existingUser.isVerified;
        if(!isVerified) {
            return errorResponse("Please Verify your account", 400);
        }
        const token = generateToken({
            id: existingUser._id.toString(),
            email: existingUser.email,
            username: existingUser.username,
        });

        await session.commitTransaction();

        const userResponse = {
            _id: existingUser._id,
            email: existingUser.email,
            username: existingUser.username,
            phonenumber: existingUser.phonenumber,
            role: existingUser.role,
            profileImage: existingUser.profileImage,
        };

        const response = NextResponse.json({
            message: "User signed in successfully",
            success: true,
            data: userResponse,
            token,
        });

        response.cookies.set({
            name: "token",
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60,
        });
        
        return response;


    } catch (error) {
        session.abortTransaction();
        if (error instanceof Error) {
            return errorResponse(error.message, 500);
        }
    } finally {
        session.endSession();
    }
}