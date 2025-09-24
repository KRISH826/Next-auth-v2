import jwt, { JwtPayload as DefaultJwtPayload, SignOptions } from "jsonwebtoken";

const JWT_SECRET = process.env.TOKEN_SECRET;
const JWT_EXPIRES_IN = process.env.TOKEN_EXPIRES_IN || "7d"; // fallback

if (!JWT_SECRET) {
  throw new Error("❌ Missing TOKEN_SECRET in .env");
}

export interface AppJwtPayload extends DefaultJwtPayload {
  id: string;
  email: string;
  username: string;
}

// ✅ Generate JWT
export const generateToken = (payload: AppJwtPayload): string => {
  const options: SignOptions = {
    expiresIn: JWT_EXPIRES_IN as SignOptions["expiresIn"], // 👈 fixed cast
  };
  return jwt.sign(payload, JWT_SECRET as string, options);
};

// ✅ Verify JWT
export const verifyToken = (token: string): AppJwtPayload => {
  try {
    return jwt.verify(token, JWT_SECRET as string) as AppJwtPayload;
  } catch (err) {
    throw new Error("Invalid or expired token");
  }
};
