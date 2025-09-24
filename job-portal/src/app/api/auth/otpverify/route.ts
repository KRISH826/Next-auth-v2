import { dbConnect } from "@/db/db";
import { errorResponse, successResponse } from "@/helpers/apiResponse";
import { generateToken } from "@/helpers/jwt";
import User from "@/models/userModel";
import { NextRequest } from "next/server";

dbConnect();

export async function POST(request: NextRequest) {
    try {
        const {email, verificationCode} = await request.json();
        const existingUser = await User.findOne({email});
        if(!existingUser) {
            return errorResponse("User not found", 404);
        }

        if(existingUser.isVerified) {
            return errorResponse("User is already verified", 400);
        }

        if(!existingUser.verificationCode || existingUser.verificationCode !== verificationCode) {
            return errorResponse("Invalid verification code", 400);
        }

        if(Date.now() > existingUser.isVerifiedExpiry?.getTime()!) {
            return errorResponse("Verification code has expired", 400);
        }
        
        existingUser.isVerified = true;
        existingUser.verificationCode = undefined;
        existingUser.isVerifiedExpiry = undefined;
        await existingUser.save();

        const token = generateToken({
            id: existingUser._id.toString(),
            email: existingUser.email,
            username: existingUser.username
        });

        return successResponse({
            message: "User verified successfully",
            token,
            user: {
                id: existingUser._id.toString(),
                email: existingUser.email,
                username: existingUser.username,
                role: existingUser.role
            }
        })
    } catch (error) {
        console.log(error);
        return errorResponse("Something went wrong", 500);
    }
}