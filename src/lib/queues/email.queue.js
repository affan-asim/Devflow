import { Queue } from "bullmq";
import { connectionOptions } from "@/lib/redis";

export const emailQueue = new Queue("emails", {
  connection: connectionOptions,
  defaultJobOptions: {
  attempts: 3,
  backoff: {
    type: "exponential",
    delay: 2000,
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