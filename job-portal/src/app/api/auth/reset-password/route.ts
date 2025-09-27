// Reset Password Function
import { dbConnect } from "@/db/db";
import { errorResponse, successResponse } from "@/helpers/apiResponse";
import User from "@/models/userModel";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import * as argon2 from "argon2";

dbConnect();

export async function POST(request: NextRequest) {
  const session = await mongoose.startSession();

  try {
    await session.startTransaction();
    
    const { email, token, newPassword, confirmPassword } = await request.json();

    if (!email || !token || !newPassword || !confirmPassword) {
      return errorResponse("Missing required fields", 400);
    }

    if (newPassword !== confirmPassword) {
      return errorResponse("Passwords do not match", 400);
    }
    
    const user = await User.findOne({ email }).session(session);
    
    if (!user) {
      return errorResponse("User not found", 404);
    }
    
    if (!user.forgotPasswordExpiry || !user.forgotPasswordToken) {
      return errorResponse("No reset request found", 400);
    }
    
    if (user.forgotPasswordToken !== token) {
      return errorResponse("Invalid reset token", 400);
    }
    
    if (Date.now() > user.forgotPasswordExpiry.getTime()) {
      return errorResponse("Reset token has expired", 400);
    }

    const isSameOldPassword = await argon2.verify(user.password, newPassword);
    if (isSameOldPassword) {
      return errorResponse(
        "New password cannot be the same as the old password",
        400
      );
    }
    
    const hashedPassword = await argon2.hash(newPassword);
    user.password = hashedPassword;
    user.forgotPasswordExpiry = undefined;
    user.forgotPasswordToken = undefined;
    user.isVerified = true;
    
    // FIXED: Save first, then commit
    await user.save({ session });
    await session.commitTransaction();

    return successResponse("Password reset successfully", 200);
    
  } catch (error) {
    await session.abortTransaction();
    
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // FIXED: Added missing return statement
    return NextResponse.json(
      { error: "An unknown error occurred" },
      { status: 500 }
    );
  } finally {
    await session.endSession();
  }
}