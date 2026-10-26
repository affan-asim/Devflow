import { PrismaClient } from "@/generated/prisma/client";
import { AppError } from "@/utils/AppError";
import Redis from "ioredis";
import fs from 'fs';
import path from "path";
import { rateLimiterUserKey } from "@/utils/redisKeyNames";

import prisma from "@/utils/prisma";
const redis = new Redis();

const luaSorce = fs.readFileSync(path.join(process.cwd(), "src", "services", "rateLimiter", "rateLimiterScript.lua"), "utf8");

redis.defineCommand("tokenBucket", {
    numberOfKeys: 1,
    lua: luaSorce
})

// export const fixedWindow = async (userId) => {
//     const windowSizeInSeconds = 60;
//     const maxReq = 5;
//     const currentWindow = Math.floor(Date.now() / (windowSizeInSeconds * 1000));

//     const key = `ratelimiter:${userId}:${currentWindow}`;

//     const pipeline = redis.pipeline();

//     let res;
//     let error;

//     try {
//         res = await pipeline.incr(key).expire(key, windowSizeInSeconds, "NX").exec();
//     } catch (error) {
//         console.error("Redis error, bypassing rate limit:", error.message);
//         error = error;
//     }

//     if (res[0][1] > maxReq && !error) {
//         // so this is basically a architecture desicion whether to process the request if redis is unavailble or completely drop the request
//         throw new AppError("Too many requests", 429);
//     }

//     // Do some processing or db queries etc... then

//     return {
//         message: "Data is updated successfully!"
//     }
// };

// export const slidingWindow = async (userId) => {
//     const key = `ratelimiter:log:${userId}`;
//     const windowSizeInSeconds = 60;
//     const currentTime = Date.now()
//     const cleanBeforeWindow = currentTime / (windowSizeInSeconds * 1000);
//     const maxReq = 5;

//     const pipeline = redis.pipeline();
//     let res;
//     let error;

//     try {
//         pipeline.zremrangebyscore(key, 0, cleanBeforeWindow)
//         pipeline.zadd(key, currentTime, `${currentTime}${Math.random()}`)
//         pipeline.zcard(key)
//         pipeline.expire(key, 60, "NX")

//         res = await pipeline.exec();
//     } catch (error) {
//         console.error("Redis error, bypassing rate limit:", error.message);
//         error = error;
//     }

//     const requests = res?.[2]?.[1] || 0;

//     if (requests > maxReq && !error) {
//         throw new AppError("Too many requests", 429)
//     }

//     return {
//         message: "Data is updated successfully!"
//     }
// }

// export const slidingWindowCounter = async (userId) => {
//     const windowSizeInSeconds = 60;
//     const maxReq = 5;
//     const now = Date.now();
//     const currentWindowId = Math.floor(now / (windowSizeInSeconds * 1000));
//     const previousWindowId = currentWindowId - 1;
//     const currentCount = `ratelimiter:counter:${userId}:${currentWindowId}`;
//     const previousCount = `ratelimiter:counter:${userId}:${previousWindowId}`;

//     const timePassedInCurrentWindow = now % 60000;
//     const weightOfPreviousWindow = (60000 - timePassedInCurrentWindow) / 60000;

//     const pipeline = redis.pipeline();
//     let res;
//     let redisError;

//     try {
//         pipeline.get(currentCount)
//         pipeline.get(previousCount)

//         res = await pipeline.exec();
//     } catch (error) {
//         console.error("Redis error, bypassing rate limit:", error.message);
//         redisError = error;
//     }

//     const estimatedRequests = parseInt(res?.[0]?.[1] || "0", 10) + (parseInt(res?.[1]?.[1] || "0", 10) * weightOfPreviousWindow);

//     if (!redisError && estimatedRequests >= maxReq) {
//         throw new AppError("Too many requests", 429)
//     }

//     await redis.pipeline().incr(currentCount).expire(currentCount, 120, "NX").exec();

//     return {
//         message: "Data is updated successfully!"
//     }
// }

// export const tokenBucket = async (userId) => {
//     const bucketSize = 10;
//     const refillRatePerSec = 1;
//     const now = Date.now();

//     const data = await redis.hgetall(`ratelimiter:token_bucket:${userId}`);
//     const token = data.tokens ? parseInt(data.tokens) : bucketSize;
//     const lastRefillTime = data.lastRefill ? parseInt(data.lastRefill) : now;

//     const timePassed = (now - lastRefillTime) / 1000;
//     const tokenAdded = timePassed * refillRatePerSec;
//     let updatedToken = Math.min(bucketSize, token + tokenAdded);

//     if (updatedToken < 1) {
//         throw new AppError("Too many requests", 429)
//     }

//     updatedToken -= 1;
//     const neededTokens = bucketSize - updatedToken;
//     const timeToFillInSeconds = Math.ceil(neededTokens / refillRatePerSec);
//     const ttl = timeToFillInSeconds + 60;

//     await redis.pipeline().hset(`ratelimiter:token_bucket:${userId}`, "tokens", updatedToken, "lastRefill", now).expire(`ratelimiter:token_bucket:${userId}`, ttl).exec();

//     return {
//         message: "Data is updated successfully!"
//     }
// }

export const tokenBucket = async (id) => {
    const bucketSize = 10;
    const refillRatePerSec = 1;
    const now = Date.now();
    const key = `${rateLimiterUserKey}:${id}`;

    const res = await redis.tokenBucket(
        key,
        bucketSize,
        refillRatePerSec,
        now
    );

    console.log(res)

    return res;
}

// leaky bucket:
// in this algorithm, max reqs is supported according to the bucket size reqs leak out (processed) in a specific rate and when bucket is full so the reqs came after it will overflow by the bucket, while leak out reqs are processed the other reqs is placed in queue so that they can wait which increases the latency

// bucket capacity, leak per sec, 


// export const leakyBucket = async () => {
//     const now = Date.now();
//     const interval = 500;

// }