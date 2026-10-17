import { PrismaClient } from "@/generated/prisma/client";
import { AppError } from "@/utils/AppError";
import { storageQueue } from "@/lib/queues/s3";
import { generatePresignedGetUrl } from "@/services/presignedUrl/presignedUrl";

import prisma from "@/utils/prisma";

const ALLOWED_SORT_FIELDS = new Set([
  "id",
  "createdAt",
  "type",
  "status",
]);

const ALLOWED_SORT_ORDERS = new Set(["asc", "desc"]);

function parsePositiveInteger(value, fallback, maximum = Number.MAX_SAFE_INTEGER) {
  const parsed = Number(value);

  if (!Number.isSafeInteger(parsed) || parsed < 1) {
    return fallback;
  }

  return Math.min(parsed, maximum);
}

export const getAdminFilesList = async (queryParams = {}) => {
  const {
    status,
    type,
    userId,
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
  if (userId) where.userId = userId;

  const [files, total] = await prisma.$transaction([
    prisma.file.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    }),
    prisma.file.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    files,
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

export const getAdminFileUrl = async (fileId) => {
  const file = await prisma.file.findUnique({
    where: { id: fileId },
    select: { key: true },
  });

  if (!file) {
    throw new AppError("File record not found", 404);
  }

  return generatePresignedGetUrl(file.key);
};

export const deleteFileByAdmin = async (fileId) => {
  const file = await prisma.file.findUnique({
    where: { id: fileId },
  });

  if (!file) {
    throw new AppError("File record not found", 404);
  }

  await prisma.file.delete({
    where: { id: fileId },
  });

  try {
    await storageQueue.add("delete-storage-file", {
      fileKey: file.key,
      fileId: file.id
    }, {
      jobId: `file-delete-${fileId}`
    }
  );
  } catch (queueError) {
    console.error("FAILED TO ENQUEUE S3 CLEANUP JOB:", queueError);
  }

  return true;
};
