import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const session = await mongoose.startSession();

    try {
        await session.startTransaction();
        
    } catch (error) {
        await session.abortTransaction();
        if(error instanceof Error) {
            return NextResponse.json({error: error.message}, {status: 500});
        }
    }finally {
       await session.endSession();
    }
}