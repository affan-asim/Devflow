import "./loadEnv.js";
import { Worker } from "bullmq";
import { connectionOptions } from "../lib/redis";
import { processEmail } from "../lib/processors/email.processor";

const worker = new Worker(
  "emails",
  processEmail,
  {
    connection: connectionOptions,
    concurrency: 1,
    limiter: {
        duration: 10000,
        max: 9
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
});

worker.on("error", (err) => {
  console.error("Worker Redis Connection Error:", err);
});
