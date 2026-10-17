import "./loadEnv.js";
import { Queue, Worker } from "bullmq";
import { connectionOptions } from "../lib/redis";
import { processJobExpiration } from "../lib/processors/jobExpiration.processor";

const queueName = "job-expiration";
const queue = new Queue(queueName, { connection: connectionOptions });

const startWorker = async () => {
  await queue.upsertJobScheduler(
    "daily-job-expiration",
    { pattern: "0 0 * * *", tz: "Asia/Karachi" },
    { name: "expire-past-deadline-jobs", data: {} }
  );

  console.log("Daily job expiration scheduled for midnight Asia/Karachi.");
  await processJobExpiration({ name: "expire-past-deadline-jobs" });

  const worker = new Worker(queueName, processJobExpiration, {
    connection: connectionOptions,
    concurrency: 1,
  });

  worker.on("completed", (job) => {
    console.log(`Job expiration task ${job.id} completed.`);
  });

  worker.on("failed", (job, error) => {
    console.error(`Job expiration task ${job?.id} failed.`, error);
  });

  worker.on("error", (error) => {
    console.error("Job expiration worker error:", error);
  });
};

startWorker().catch(async (error) => {
  console.error("Failed to start job expiration worker:", error);
  await queue.close();
  process.exitCode = 1;
});
