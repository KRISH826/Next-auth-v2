import z from "zod";

const registerSchema = z.object({
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  email: z.string()
    .email("Please provide a valid email address")
    .toLowerCase(),
  password: z.string()
    .min(6, "Password must be at least 6 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one uppercase letter, one lowercase letter, and one number"),
  role: z.enum(["recruiter", "candidate"]).default("candidate"),
  phonenumber: z.string().regex(/^\+\d{1,2}\s?\d{3}\s?\d{3}\s?\d{4}$/, "Please provide a valid phone number"),
  profileImage: z.string().optional() // Base64 image data or file
});

export default registerSchema;