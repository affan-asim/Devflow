import { Queue } from "bullmq";
import { connectionOptions } from "@/lib/redis";

export const storageQueue = new Queue("storage", {
  connection: connectionOptions,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
        type: "exponential",
        delay: 1000
    },
     removeOnComplete: {
    age: 3600 * 24, 
    count: 1000,   
  },
  removeOnFail: {
    age: 3600 * 24 * 7, 
  },
  }
});

export const s3Queue = storageQueue;