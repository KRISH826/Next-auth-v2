import nodemailer from "nodemailer";

export const verifyCodeGenerater = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const transport = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendverificationCode = async (
  email: string,
  username: string,
  verificationCode: string
) => {
  try {
    const mailOptions = {
      from: `"JobPortal" <${process.env.EMAIL_USERNAME}>`, // sender address
      to: email, // recipient
      subject: "Verify your email address",
      html: `
        <h2>Hello ${username}! 👋</h2>
        <p>Thanks for registering with JobPortal. Use the code below to verify your email:</p>
        <div style="padding:20px; background:#f1f5f9; border-radius:8px; text-align:center; margin:20px 0;">
          <h1 style="color:#6366f1; font-size:32px; letter-spacing:6px;">
            ${verificationCode}
          </h1>
        </div>
        <p style="color:#666; font-size:14px;">
          This code will expire in 10 minutes. Do not share this code with anyone.
        </p>
      `,
    };
    const info = await transport.sendMail(mailOptions);
    console.log("Message sent: %s", info.messageId);
    return true;
  } catch(error) {
    console.log("email not sent", error);
    return false;
  }
};
