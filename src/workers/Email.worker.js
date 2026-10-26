import "./loadEnv.js";
import { Worker } from "bullmq";
import { connectionOptions } from "../lib/redis";
import { processEmail } from "../lib/processors/email.processor";

const worker = new Worker(
  "emails",
  processEmail,
  {
    connection: connectionOptions,
    concurrency: 5,
    limiter: {
        duration: 1000,
        max: 2
    },
    
  }
);

worker.on("ready", () => {
  console.log("Worker is connected to Redis and ready to process jobs.");
});

worker.on("active", (job) => {
  console.log(`Job ${job.id} of type ${job.name} has started processing.`);
});

worker.on("completed", (job) => {
  console.log(`Email job ${job.id} completed`);
});

worker.on("failed", (job, error) => {
  console.error(`Email job ${job?.id} failed`, error);
    if (job.attemptsMade >= job.opts.attempts) {
    console.error(`ALERT: Job ${job.id} exhausted all retries!`);
    // Send to Sentry, Discord/Slack webhook, or DLQ table
  }
});

worker.on("error", (err) => {
  console.error("Worker Redis Connection Error:", err);
});

const shutdown = async (signal) => {
  console.log(`Received ${signal}, closing worker gracefully...`);
  await worker.close();
  process.exit(0);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
