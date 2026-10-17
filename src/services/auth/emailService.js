import { PrismaClient } from "@/generated/prisma/client";
import { AppError } from "@/utils/AppError";
import { hashedPassword, verifyPassword } from "@/utils/auth";
import { otpKey, userKey } from "@/utils/redisKeyNames";
import Redis from "ioredis";
import { generateDigitCode } from "./authService";
import { sendVerificationEmail } from "./emailNotifications";
import { emailQueue } from "@/lib/queues/email.queue";

import prisma from "@/utils/prisma";
const redis = new Redis();

export async function emailService(data) {
    const { email, otp } = data;

    let otpRecord;

    try {
      otpRecord = await redis.get(`${otpKey}:${email}`);
      
    } catch (error) {
      console.warn("Redis Down! Falling back to Postgres Database...", error);
      
      const dbOtp = await prisma.verificationOtp.findFirst({
        where: { 
            email, 
            expiresAt: { 
                gt: new Date() 
            },
            type: "EMAIL_VERIFICATION"
        }
      });
      if (dbOtp) otpRecord = dbOtp.otp;
    }

    if (!otpRecord) {
        throw new AppError('Otp not found or being expired. Please request a new one', 404);
    };

    const isOptCorrect = await verifyPassword(otp, otpRecord);

    if (!isOptCorrect) {
        throw new AppError('Invalid OTP code.', 400);
    }; 

    const user = await prisma.user.update({
        where: {
            email
        },
        data: {
            isVerified: true
        }
    });

    await redis.del(`${otpKey}:${email}`)
    await redis.del(`${userKey}:${user.id}`)
        
    return { message: "Email verified successfully." };
};

export async function resendOtp({ email }) {

    const user = await prisma.user.findUnique({
        where: { email }
    });

    if (!user) {
        throw new AppError("User not found", 404);
    }

    if (user.isVerified) {
        throw new AppError("Email is already verified", 400);
    }

    const plainOtp = generateDigitCode();
    const hashedOtp = await hashedPassword(plainOtp);
    const uuid = crypto.randomUUID();
    const OTP_EXPIRATION_SECONDS = 300;

    console.log(plainOtp)

    try {
        await redis.set(`${otpKey}:${email}`, hashedOtp, "EX", OTP_EXPIRATION_SECONDS);
    } catch (error) {
        console.warn("Redis Down! Falling back to Postgres Database...", error);

        await prisma.verificationOtp.deleteMany({
            where: { email, type: VerificationType.EMAIL_VERIFICATION }
        });

        await prisma.verificationOtp.create({
            data: {
                otp: hashedOtp,
                email,
                expiresAt: new Date(Date.now() + OTP_EXPIRATION_SECONDS * 1000),
                type: VerificationType.EMAIL_VERIFICATION,
                createdAt: new Date()
            }
        });
    }

    try {
        await emailQueue.add(
            "send-verification-email",
            { email, name: user.name, plainOtp, uuid },
            { jobId: uuid, removeOnComplete: { age: 3600 } }
        );
    } catch (error) {
        console.error("Failed to enqueue email job:", error);
        await sendVerificationEmail(email, user.name, plainOtp, uuid);
    }

    return { message: "Verification OTP resent successfully." };
}


// export async function emailService(data, type) {
//     const { email, otp } = data;

//     const otpRecord = await prisma.verificationOtp.findFirst({
//         where: {
//             email,
//             type
//         }
//     });

//     if (!otpRecord) {
//         throw new AppError('Otp not found', 404);
//     };

//     if (new Date() > otpRecord.expiresAt) {
//         await prisma.verificationOtp.delete({
//             where: {
//                 id: otpRecord.id
//             }
//         });

//         throw new AppError('OTP has expired. Please request a new one', 400);
//     };

//     const isOptCorrect = await verifyPassword(otp, otpRecord.otp);

//     if (!isOptCorrect) {
//         throw new AppError('Invalid OTP code.', 400);
//     };

//     await prisma.$transaction(async (tx) => {

//         await tx.user.update({
//             where: {
//                 email
//             },
//             data: {
//                 isVerified: true
//             }
//         });
    
//         await tx.verificationOtp.delete({
//             where: {
//                 id: otpRecord.id
//             },
//         });
//     });

//     return { message: "Email verified successfully." };
// };