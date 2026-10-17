import { redis } from "@/lib/redis";
// import { s3Queue } from "@/lib/queues/s3";
import { emailQueue } from "@/lib/queues/email.queue";
import { notificationQueue } from "@/lib/queues/notification.queue";
import prisma from "@/utils/prisma";
import { AppError } from "@/utils/AppError";
import { storageQueue } from "@/lib/queues/s3";
import { supabaseAdmin } from "@/utils/supabaseAdmin";


const ALLOWED_SORT_FIELDS = new Set([
  "id",
  "createdAt",
  "status",
  "type",
  "email",
]);

const ALLOWED_SORT_ORDERS = new Set(["asc", "desc"]);

function parsePositiveInteger(value, fallback, maximum = Number.MAX_SAFE_INTEGER) {
  const parsed = Number(value);

  if (!Number.isSafeInteger(parsed) || parsed < 1) {
    return fallback;
  }

  return Math.min(parsed, maximum);
}

export const getEmailLogsList = async (queryParams = {}) => {
  const {
    status,
    type,
    email,
    sortBy: requestedSortBy = "createdAt",
    sortOrder: requestedSortOrder = "desc",
  } = queryParams;

  const page = parsePositiveInteger(queryParams.page, 1);
  const limit = parsePositiveInteger(queryParams.limit, 20, 100);

  const sortBy = ALLOWED_SORT_FIELDS.has(requestedSortBy)
    ? requestedSortBy
    : "createdAt";

  const sortOrder = ALLOWED_SORT_ORDERS.has(requestedSortOrder)
    ? requestedSortOrder
    : "desc";

  const where = {};

  if (status) where.status = status;
  if (type) where.type = type;

  if (email?.trim()) {
    where.email = {
      contains: email.trim(),
      mode: "insensitive",
    };
  }

  const [logs, total] = await prisma.$transaction([
    prisma.emailLog.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    }),
    prisma.emailLog.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    logs,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1 && total > 0,
    },
  };
};

export const deleteEmailLogByAdmin = async (emailLogId) => {
  const emailLog = await prisma.emailLog.findUnique({
    where: { id: emailLogId },
    select: { id: true },
  });

  if (!emailLog) {
    throw new AppError("Email log not found", 404);
  }

  await prisma.emailLog.delete({ where: { id: emailLogId } });

  return { id: emailLogId };
};

const CHECK_TIMEOUT_MS = 5000;

function withTimeout(promise, timeoutMs = CHECK_TIMEOUT_MS) {
  let timer;

  const timeout = new Promise((_, reject) => {
    timer = setTimeout(
      () => reject(new Error("Health check timed out")),
      timeoutMs
    );
  });

  return Promise.race([promise, timeout]).finally(() =>
    clearTimeout(timer)
  );
}

async function checkDependency(check) {
  const startedAt = Date.now();

  try {
    await withTimeout(check());

    return {
      connected: true,
      latencyMs: Date.now() - startedAt,
      error: null,
    };
  } catch (error) {
    console.error("[SystemHealth] Dependency check failed:", error);

    return {
      connected: false,
      latencyMs: null,
      error:
        error?.message === "Health check timed out"
          ? "Health check timed out"
          : "Dependency check failed",
    };
  }
}

async function checkQueue(queue) {
  try {
    const counts = await withTimeout(
      queue.getJobCounts(
        "active",
        "completed",
        "failed",
        "delayed",
        "waiting",
        "paused",
        "waiting-children"
      )
    );

    return {
      connected: true,
      counts: {
        active: counts.active ?? 0,
        completed: counts.completed ?? 0,
        failed: counts.failed ?? 0,
        delayed: counts.delayed ?? 0,
        waiting: counts.waiting ?? 0,
        paused: counts.paused ?? 0,
        waitingChildren: counts["waiting-children"] ?? 0,
      },
      error: null,
    };
  } catch (error) {
    console.error("[SystemHealth] Queue check failed:", error);

    return {
      connected: false,
      counts: null,
      error:
        error?.message === "Health check timed out"
          ? "Queue check timed out"
          : "Queue check failed",
    };
  }
}

async function checkStorage() {
  const startedAt = Date.now();

  try {
    const bucket = process.env.S3_BUCKET_NAME;

    if (!bucket) {
      throw new Error("S3_BUCKET_NAME is not configured");
    }

    const { error } = await withTimeout(
      supabaseAdmin.storage.getBucket(bucket)
    );

    if (error) throw error;

    return {
      reachable: true,
      latencyMs: Date.now() - startedAt,
      error: null,
    };
  } catch (error) {
    console.error("[SystemHealth] Storage check failed:", error);

    return {
      reachable: false,
      latencyMs: null,
      error:
        error?.message === "Health check timed out"
          ? "Storage check timed out"
          : "Storage is unreachable or access was denied",
    };
  }
}

export const getSystemHealthMetrics = async () => {
  const timestamp = new Date().toISOString();

  const [database, redisStatus, email, notification, storageQueueStatus, storage] =
    await Promise.all([
      checkDependency(() => prisma.$queryRaw`SELECT 1`),
      checkDependency(async () => {
        const result = await redis.ping();

        if (result !== "PONG") {
          throw new Error("Unexpected Redis ping response");
        }
      }),
      checkQueue(emailQueue),
      checkQueue(notificationQueue),
      checkQueue(storageQueue),
      checkStorage(),
    ]);

  const queues = {
    email,
    notification,
    storage: storageQueueStatus,
  };

  const dependenciesHealthy =
    database.connected &&
    redisStatus.connected &&
    storage.reachable;

  const queuesHealthy = Object.values(queues).every(
    (queue) => queue.connected
  );

  const status =
    dependenciesHealthy && queuesHealthy ? "HEALTHY" : "DEGRADED";

  return {
    timestamp,
    status,
    services: {
      database,
      redis: redisStatus,
      queues,
      storage,
    },
  };
};
