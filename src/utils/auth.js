import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers';
import { PrismaClient } from "@/generated/prisma/client";
import { createHash } from 'crypto';
import { UAParser } from "ua-parser-js";

import prisma from "@/utils/prisma";
const secert_key = process.env.SECRET_KEY;

export const hashedPassword = async (password) => {
    return await bcrypt.hash(password, 10)
}

export const verifyPassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword)
}

export const generateToken = (userId, role, type, email) => {
    return jwt.sign({ userId, role, email }, secert_key, { expiresIn: type === 'access' ? '1d' : '7d' })
}

export const verifyToken = (token) => {
    return jwt.verify(token, secert_key)
}

export const hashedToken = (token) => {
    return createHash('sha256').update(token).digest('hex');
};

export const getCurrentUser = async () => {
    const cookieStore = await cookies();
    const token = cookieStore.get("access-token")?.value;
    if (!token) return null;

    const decodedInfoFromToken = verifyToken(token);
    if (!decodedInfoFromToken) return null;

    try {
        const user = await prisma.user.findUnique({
            where: {
                id: decodedInfoFromToken.userId
            },
            omit: {
                password: true
            }
        });

        if (!user) return null;

        return user;
    } catch (error) {
        console.error('Error in auth getCurrentUser', error);
        return null;
    }
}

export const getRefreshTableInfo = (req) => {
    const userAgent = req.headers.get("user-agent");
    const forwarded = req.headers.get("x-forwarded-for");
    const ipAddress = forwarded ? forwarded.split(",")[0] : "unknown"

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    const parser = new UAParser(userAgent)
    const deviceName = `${(parser.getBrowser()?.name || "Unknown Browser")} ${parser.getOS()?.name || "Unknown OS"}`;

    return {
        userAgent,
        ipAddress,
        expiresAt,
        deviceName
    }
}
