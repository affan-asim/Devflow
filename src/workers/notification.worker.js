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

    if (job.attemptsMade >= job.opts.attempts) {
    console.error(`ALERT: Job ${job.id} exhausted all retries!`);
  }
});

const shutdown = async (signal) => {
  console.log(`Received ${signal}, closing worker gracefully...`);
  await worker.close();
  process.exit(0);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
