import { errorResponse } from "@/helpers/apiResponse";
import { verifyToken } from "@/helpers/jwt";
import User from "@/models/userModel";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";


export async function GET(request: NextRequest) {
    const session = await mongoose.startSession();
    try {
        session.startTransaction();
        const token = request.cookies.get("token")?.value || "";
        if(!token) {
            return errorResponse("Unauthorized", 401);
        }

        const decoded = verifyToken(token);
        const user = await User.findById(decoded.id).select("-password");
        if(!user) {
            return errorResponse("User not found", 404);
        }

        return NextResponse.json({
            message: "User details fetched successfully",
            data: user,
        })

    } catch (error) {
        session.abortTransaction();
        if(error instanceof Error) {
            return NextResponse.json({error: error.message}, {status: 500});
        }
        return NextResponse.json({error: "An unknown error occurred"}, {status: 500});
    }finally {
        session.endSession();
    }
}