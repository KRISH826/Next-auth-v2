import { dbConnect } from "@/db/db";
import { errorResponse, successResponse } from "@/helpers/apiResponse";
import { processImageUpload } from "@/helpers/imageUploader";
import User from "@/models/userModel";
import registerSchema from "@/types/userSchema";
import mongoose from "mongoose";
import { NextRequest } from "next/server";
import * as argon2 from "argon2";
import { sendverificationCode, verifyCodeGenerater } from "@/helpers/mail";
import { sendVerificationSms } from "@/helpers/sms";

dbConnect();
export async function POST(request: NextRequest) {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const formData = await request.formData();
    const username = formData.get("username") as string;
    const email = formData.get("email") as string;
    const phonenumber = formData.get("phonenumber") as string;
    const password = formData.get("password") as string;
    const role = formData.get("role") as string;
    const profileImage = formData.get("profileImage") as File | null;

    const validationData = {
      username,
      email,
      phonenumber,
      password,
      role,
      profileImage: profileImage ? URL.createObjectURL(profileImage) : null,
    };

    const validateResult = registerSchema.safeParse(validationData);
    if (!validateResult.success) {
      await session.abortTransaction();
      return errorResponse(validateResult.error.issues[0].message, 400);
    }

    let existingUser = await User.findOne({ email }).session(session);
    if (existingUser) {
      await session.abortTransaction();
      return errorResponse("User already exists", 400);
    }

    let existingPhonenumber = await User.findOne({ phonenumber }).session(
      session
    );
    if (existingPhonenumber) {
      await session.abortTransaction();
      return errorResponse("Phone number already exists", 400);
    }

    let ProfileImageData = null;
    if (profileImage && profileImage.size > 0) {
      ProfileImageData = await processImageUpload(profileImage, username);
    }
    const hashedPassword = await argon2.hash(password);

    const newUser = new User({
      username,
      email,
      phonenumber,
      password: hashedPassword,
      role,
      profileImage: ProfileImageData,
    });

    await newUser.save({ session });
    const verificationCode = verifyCodeGenerater();
    const emailsent = await sendverificationCode(
      email,
      username,
      verificationCode
    );
    // const smssent = await sendVerificationSms(phonenumber, verificationCode);

    if (!emailsent) {
      await session.abortTransaction();
      return errorResponse("Failed to send verification code", 500);
    }
    await session.commitTransaction();

    const userResponse = {
      _id: newUser._id,
      username: newUser.username,
      password: newUser.password,
      phonenumber: newUser.phonenumber,
      email: newUser.email,
      role: newUser.role,
      profileImage: newUser.profileImage,
    };

    return successResponse(
      {
        user: userResponse,
        message: "User registered successfully",
      },
      201
    );
  } catch (error) {
    console.log(error);
    await session.abortTransaction();
    return errorResponse("Failed to register user", 500);
  } finally {
    await session.endSession();
  }
}
