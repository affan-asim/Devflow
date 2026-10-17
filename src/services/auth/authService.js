import { VerificationType } from "@/generated/prisma";
import { PrismaClient } from "@/generated/prisma/client";
import { AppError } from "@/utils/AppError";
import { hashedPassword } from "@/utils/auth";
import { sendVerificationEmail } from "./emailNotifications";
import Redis from "ioredis";
import { otpKey } from "@/utils/redisKeyNames";
import { notificationQueue } from "@/lib/queues/notification.queue";
import { emailQueue } from "../../lib/queues/email.queue";
import { connectionOptions, redis } from "@/lib/redis";

import prisma from "@/utils/prisma";

export async function registerUser(userData) {
    const { name, email, password, role } = userData;

    const userExist = await prisma.user.findUnique({
        where: {
            email
        }
    });

    if (userExist) {
        throw new AppError("User Already Exist", 400);
    }

    const hashedPass = await hashedPassword(password);
    const plainOtp = generateDigitCode();
    const hashedOtp = await hashedPassword(plainOtp);
    const uuid = crypto.randomUUID();
    const OTP_EXPIRATION_SECONDS = 300;

    console.log(plainOtp)

    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPass,
            role
        },
        omit: {
            password: true
        }
    });

    try {
        await redis.set(`${otpKey}:${user.email}`, hashedOtp, "EX", 300, "NX")

    } catch (error) {
        console.warn("Redis Down! Falling back to Postgres Database...", error);

        await prisma.verificationOtp.create({
            data: {
                otp: hashedOtp,
                email,
                expiresAt: new Date(Date.now() + OTP_EXPIRATION_SECONDS * 1000),
                type: VerificationType.EMAIL_VERIFICATION,
                createdAt: new Date(Date.now())
            }
        })
    }

    try {
        await emailQueue.add("send-verification-email", { email, name, plainOtp, uuid }, { jobId: uuid, removeOnComplete: { age: 3600 } });
        console.log(`Verification email queued for ${email}`);

    } catch (error) {
        console.error("Failed to enqueue email job:", queueError);
        await sendVerificationEmail(email, name, plainOtp, uuid);
    }

    return {
        ...user,
        plainOtp
    };
}

export function generateDigitCode() {
    return String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
}