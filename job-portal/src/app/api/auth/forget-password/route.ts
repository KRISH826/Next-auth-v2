// Forgot Password Function
import { dbConnect } from "@/db/db";
import { errorResponse } from "@/helpers/apiResponse";
import User from "@/models/userModel";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { sendForgetPasswordMail } from "@/helpers/mail";

dbConnect();

export async function POST(request: NextRequest) {
  const session = await mongoose.startSession();
  
  try {
    await session.startTransaction();
    
    const { email } = await request.json();
    const user = await User.findOne({ email }).session(session);
    
    if (!user) {
      return errorResponse("User not found", 404);
    }

    const token = crypto.randomBytes(32).toString("hex");
    user.forgotPasswordToken = token;
    user.forgotPasswordExpiry = new Date(Date.now() + 10 * 60 * 1000);
    
    await user.save({ session });
    await session.commitTransaction();
    
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}&email=${email}`;
    await sendForgetPasswordMail(email, user.username, resetUrl);
    console.log(token);

    return NextResponse.json({
      message: "Email sent successfully",
      success: true,
    });
  } catch (error) {
    await session.abortTransaction();
    
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "An unknown error occurred" },
      { status: 500 }
    );
  } finally {
    await session.endSession();
  }
}