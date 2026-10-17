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
    failedReason: job.failedReason,
    stacktrace: job.stacktrace,
    attemptsMade: job.attemptsMade,
    timestamp: job.timestamp,
    finishedOn: job.finishedOn,
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