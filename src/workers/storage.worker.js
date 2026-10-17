import "./loadEnv.js";
import { Worker } from "bullmq";
import { connectionOptions } from "../lib/redis";
import { processStorage } from "@/lib/processors/processStorage.processor";

const worker = new Worker(
  "storage",
  processStorage,
  {
    connection: connectionOptions,
    concurrency: 10,
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
  console.log(`Storage job ${job.id} completed`);
});

worker.on("failed", (job, error) => {
  console.error(`Storage job ${job?.id} failed`, error);
});

worker.on("error", (err) => {
  console.error("Worker Redis Connection Error:", err);
});
