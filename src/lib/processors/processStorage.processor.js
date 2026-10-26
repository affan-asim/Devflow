import { promoteTempFileToPermanent } from "@/services/presignedUrl/presignedUrl";
import { PrismaClient } from "@/generated/prisma/client";
import { supabaseAdmin } from "@/utils/supabaseAdmin";
import { redis } from "@/lib/redis";
import { recruiterProfileKey } from "@/utils/redisKeyNames";

import prisma from "@/utils/prisma";

export async function processStorage(job) {

  if (job.name === "delete-storage-file") {
    const bucketName = process.env.S3_BUCKET_NAME;
    const { fileKey, fileId } = job.data;

    if (!fileKey) {
      console.warn(`[Storage Worker] delete-storage-file job ${job.id} missing fileKey. Skipping.`);
      return;
    }

    try {
      const { error } = await supabaseAdmin.storage
        .from(bucketName)
        .remove([fileKey]);

      if (error) throw error;
      console.log(`[Storage Worker] File ${fileKey} deleted via Supabase storage.`);
    } catch (error) {
      console.error(`[Storage Worker] Supabase deletion failed for key ${fileKey}:`, error);
      throw new Error(`Error deleting file ${fileKey} from storage: ${error.message}`);
    }

    if (fileId) {
      await prisma.file.deleteMany({
        where: { id: fileId },
      }).catch((dbErr) => {
        console.warn(`[Storage Worker] File record ${fileId} could not be removed:`, dbErr.message);
      });
    }
  }
  else {
    const { tempKey, userId, fileType, model, applicationId, developerProfileId, recruiterProfileId } = job.data;

    const fileRecord = await prisma.file.findUnique({
      where: { key: tempKey },
    });

    if (!fileRecord || fileRecord.status === "PERMANENT") {
      console.log(`[Idempotency] File ${tempKey} is already permanent or missing. Skipping.`);
      return;
    }

    const permanentKey = await promoteTempFileToPermanent(tempKey, userId, fileType);

    await prisma.$transaction(async (tx) => {
      const updatedFile = await tx.file.update({
        where: { key: tempKey },
        data: {
          key: permanentKey,
          status: "PERMANENT",
        },
      });

      const targetField = fileType === "RESUME" ? "resumeId" : "coverLetterId";

      if (model === "application" && applicationId) {
        await tx.application.update({
          where: { id: applicationId },
          data: { [targetField]: updatedFile.id },
        });
      } else if (model === "profile" && developerProfileId) {
        await tx.developerProfile.update({
          where: { id: developerProfileId },
          data: { [targetField]: updatedFile.id },
        });
      } else if (model === "profile" && recruiterProfileId) {
        await tx.recruiterProfile.update({
          where: { id: recruiterProfileId },
          data: { [targetField]: updatedFile.id },
        });
        await redis.del(`${recruiterProfileKey}:${userId}`);
      }
    });

    console.log(`[Storage Queue] Successfully promoted ${fileType} for ${model}`);
  }
}
