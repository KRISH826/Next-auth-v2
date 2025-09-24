import { dbConnect } from "@/db/db";
import { errorResponse, successResponse } from "@/helpers/apiResponse";
import { processImageUpload } from "@/helpers/imageUploader";
import User from "@/models/userModel";
import registerSchema from "@/types/userSchema";
import mongoose from "mongoose";
import { NextRequest } from "next/server";
import * as argon2 from "argon2";

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

    const [existingUser, ProfileImageData] = await Promise.all([
      User.findOne({ email }).session(session),
      profileImage && profileImage.size > 0
        ? processImageUpload(profileImage, username)
        : new Promise<null>(resolve => resolve(null)),
    ]);

    if (existingUser) {
      await session.abortTransaction();
      return errorResponse("User already exists", 400);
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
