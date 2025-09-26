export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: "recruiter" | "candidate";
  phonenumber: string;
  profileImage: {
    public_id: string | null;
    url: string;
  };
  isVerified: boolean;
  isVerifiedExpiry?: Date;
  verificationCode?: string;
  forgotPasswordToken?: string;
  forgotPasswordExpiry?: Date;
  // verifyToken?: string;
  // verifyTokenExpiry?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}