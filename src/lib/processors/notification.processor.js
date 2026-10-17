import { createNotification } from "@/services/notifications/notificationService";
import { PrismaClient } from "../../generated/prisma/client";

import prisma from "@/utils/prisma";

export async function processNotification(job) {
  try {
    console.log(`Notification processing starting for ${job.name}...`);
    await createNotification(job.data);
    console.log(`Notification job ${job.name} processed successfully.`);
  } catch (error) {
    console.error(`Failed to process notification job ${job.name}:`, error);
    throw error;
  }
}
