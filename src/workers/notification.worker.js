import "./loadEnv.js";
import { Worker } from "bullmq";
import { connectionOptions } from "../lib/redis";
import { processNotification } from "../lib/processors/notification.processor";

const worker = new Worker(
  "notifications",
  processNotification,
  {
    connection: connectionOptions,
    concurrency: 10,
    limiter: {
        duration: 10000,
        max: 9
    },
    
  }
);

worker.on("completed", (job) => {
  console.log(`Notification job ${job.id} completed`);
});

worker.on("failed", (job, error) => {
  console.error(
    `Notification job ${job?.id} failed`,
    error
  );
});
