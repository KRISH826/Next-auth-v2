import twilio from "twilio";

const client = twilio(
    process.env.TWILIO_ACCOUNT_SID as string,
    process.env.TWILIO_AUTH_TOKEN as string
);

export const sendVerificationSms = async (phonenumber: string, verificationCode: string) => {
    try {
        const message = await client.messages.create({
            body: `Your verification code is ${verificationCode}`,
            from: process.env.TWILIO_PHONE_NUMBER as string,
            to: `${phonenumber}`
        })
        console.log('Sms sent', message.sid);
        return true;
    } catch (error) {
        console.log("sms not sent", error);
        return false;
    }
}