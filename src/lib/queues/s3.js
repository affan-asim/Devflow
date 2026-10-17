import { Queue } from "bullmq";
import { connectionOptions } from "@/lib/redis";

export const storageQueue = new Queue("storage", {
  connection: connectionOptions,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
        type: "exponential",
        delay: 1000
    }
  }
});