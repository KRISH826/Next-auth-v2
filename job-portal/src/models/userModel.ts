// i want user name user email, user roles (recruiter, candidate), password and image

import { IUser } from "@/types/api";
import mongoose, { Model, Schema } from "mongoose";

const UserSchema: Schema<IUser> = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "user name is required"],
        minlength: [3, "user name must be at least 3 characters"],
        maxlength: [20, "user name must be at most 20 characters"],
    },
    email: {
        type: String,
        required: [true, "email is required"],
        unique: true,
        lowercase: true,
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            "Please provide a valid email",
        ],
    },
    phonenumber: {
        type: String,
        required: [true, "phone number is required"],
        unique: true,
        match: [
            /^(\+\d{1,2}\s?)?1?\-?\.?\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/,
            "Please provide a valid phone number",
        ], 
    },
    password: {
        type: String,
        required: [true, "password is required"],
        minlength: [6, "password must be at least 6 characters"],
    },
    profileImage: {
        public_id: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: true,
        },
    },
    role: {
        type: String,
        enum: ["recruiter", "candidate"],
        default: "candidate",
    },
}, { timestamps: true });

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;



