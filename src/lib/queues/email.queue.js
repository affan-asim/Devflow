import { Queue } from "bullmq";
import { connectionOptions } from "@/lib/redis";

export const emailQueue = new Queue("emails", {
  connection: connectionOptions,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
        type: "exponential",
        delay: 1000
    }
  }
});