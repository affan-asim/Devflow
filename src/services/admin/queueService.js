import { emailQueue } from "@/lib/queues/email.queue";
import { notificationQueue } from "@/lib/queues/notification.queue";
import { s3Queue } from "@/lib/queues/s3";
import { AppError } from "@/utils/AppError";

const QUEUE_MAP = {
  email: emailQueue,
  notification: notificationQueue,
  storage: s3Queue,
};

export const getQueuesSummary = async () => {
  const [emailCounts, notificationCounts, storageCounts] = await Promise.all([
    emailQueue.getJobCounts("waiting", "active", "completed", "failed", "delayed"),
    notificationQueue.getJobCounts("waiting", "active", "completed", "failed", "delayed"),
    s3Queue.getJobCounts("waiting", "active", "completed", "failed", "delayed"),
  ]);

  return {
    email: emailCounts,
    notification: notificationCounts,
    storage: storageCounts,
  };
};

export const getFailedJobsByQueue = async (queueName, page = 1, limit = 20) => {
  const targetQueue = QUEUE_MAP[queueName.toLowerCase()];

  if (!targetQueue) {
    throw new AppError(`Queue '${queueName}' not found. Valid queues are: email, notification, storage`, 404);
  }

  const parsedPage = Math.max(1, parseInt(page, 10));
  const parsedLimit = Math.max(1, Math.min(100, parseInt(limit, 10)));
  const start = (parsedPage - 1) * parsedLimit;
  const end = start + parsedLimit - 1;

  const failedJobs = await targetQueue.getFailed(start, end);
  const totalFailed = await targetQueue.getFailedCount();

  const formattedJobs = failedJobs.map((job) => ({
    id: job.id,
    name: job.name,
    data: job.data,
    opts: job.opts,
    failedReason: job.failedReason,
    stacktrace: job.stacktrace,
    attemptsMade: job.attemptsMade,
    maxAttempts: job.opts?.attempts || 3,
    timestamp: job.timestamp,
    processedOn: job.processedOn,
    finishedOn: job.finishedOn,
    delay: job.delay,
  }));

  return {
    jobs: formattedJobs,
    pagination: {
      total: totalFailed,
      page: parsedPage,
      limit: parsedLimit,
      totalPages: Math.ceil(totalFailed / parsedLimit),
    },
  };
};

export const retryFailedJob = async (queueName, jobId) => {
  const targetQueue = QUEUE_MAP[queueName?.toLowerCase()];

  if (!targetQueue) {
    throw new AppError(`Queue '${queueName}' not found. Valid queues are: email, notification, storage`, 404);
  }

  const job = await targetQueue.getJob(jobId);

  if (!job) {
    throw new AppError(`Job '${jobId}' not found in queue '${queueName}'`, 404);
  }

  const state = await job.getState();
  if (state !== "failed") {
    throw new AppError(`Job '${jobId}' cannot be retried because its status is '${state}', not 'failed'`, 400);
  }

  await job.retry();

  return {
    jobId: job.id,
    name: job.name,
    status: "retried",
  };
};

export const retryAllFailedJobs = async (queueName, limit = 100) => {
  const targetQueue = QUEUE_MAP[queueName.toLowerCase()];

  if (!targetQueue) {
    throw new AppError(`Queue '${queueName}' not found. Valid queues are: email, notification, storage`, 404);
  }

  const parsedLimit = Math.max(1, Math.min(500, parseInt(limit, 10) || 100));
  const failedCount = await targetQueue.getFailedCount();

  if (failedCount === 0) {
    return {
      queue: queueName,
      retriedCount: 0,
      totalFailed: 0,
    };
  }

  const retriedJobs = await targetQueue.retryJobs({ count: parsedLimit });

  return {
    queue: queueName,
    retriedCount: retriedJobs.length || Math.min(failedCount, parsedLimit),
    totalFailedRemaining: Math.max(0, failedCount - (retriedJobs.length || Math.min(failedCount, parsedLimit))),
  };
};