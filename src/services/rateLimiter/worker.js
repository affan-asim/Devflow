import { AppError } from "@/utils/AppError";
import Redis from "ioredis";
import fs from 'fs';
import path from "path";

const redis = new Redis();

const luaSorce = fs.readFileSync(path.join(process.cwd(), "src", "services", "rateLimiter", "rateLimiterScript.lua"), "utf8");

redis.defineCommand("leakyBucket", {
    numberOfKeys: 0,
    lua: luaSorce
})

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const leakyWorker = async (workerId, now, interval) => {
    let running = true;

    const [status, data] = await redis.leakyBucket(
        workerId,
        now,
        interval
    )

    const workerStop = () => running = false;
    process.on("SIGINT", workerStop);
    process.on("SIGTERM", workerStop);

    console.log(`Worker ${workerId} started...`);

    while (running) {
        try {
            if (status === "WAITING_FOR_SCHEDULE") {
                const time = parseInt(data, 10);

                await sleep(Math.max(time, 50));
            }

            if (status === "NO_JOB") {
                await sleep(1000)
            }

            if (status === "SUCCESS") {
                const parseData = JSON.parse(data)
                await processJob(parseData)
            }
        } catch (error) {
            console.error(`Worker ${workerId} error:`, error);
            await sleep(2000);
        }
    }
    console.log(`Worker ${workerId} stopped.`);
}

const processJob = async (data) => {
    
}