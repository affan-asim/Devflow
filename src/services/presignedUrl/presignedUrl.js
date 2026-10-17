// import { AppError } from "@/utils/AppError";
// import { PrismaClient } from "@/generated/prisma/client";
// import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
// import { CopyObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
// import { supabaseAdmin } from "@/utils/supabaseAdmin";

// export const checkTempKey = (tempKey, userId) => {
//     if (!tempKey.startsWith(`temp/${userId}/`)) {
//         throw new AppError("Security Violation: You are not authorized to access this file.");
//     }
// }

// // export const getPutUrl = async (id, data) => {
// //     const { filename, contentType, type } = data;

// //     if (!["RESUME", "COVER_LETTER"].includes(type)) {
// //         throw new AppError("Invalid file type", 400);
// //     }

// //     const user = await prisma.user.findUnique({
// //         where: {
// //             id
// //         }
// //     });

// //     console.log("HELLLO~")

// //     if (!user) {
// //         throw new AppError("User in not authenticated", 401)
// //     }

// //     const fileExtension = filename.split(".").pop();
// //     const prefix =
// //         type === "COVER_LETTER"
// //             ? "cover-letter"
// //             : "resume";

// //     const tempKey =
// //         `temp/${user.id}/${prefix}-${crypto.randomUUID()}.${fileExtension}`;


// //     const command = new PutObjectCommand({
// //         Bucket: process.env.S3_BUCKET_NAME,
// //         Key: tempKey,
// //         ContentType: contentType,
// //     });

// //     const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 });

// //     await prisma.file.create({
// //         data: {
// //             key: tempKey,
// //             userId: id,
// //             type: type,
// //             status: "TEMP",
// //         },
// //     });

// //     return { uploadUrl, tempKey };
// // }

// export const getPutUrl = async (id, data) => {
//   const { filename, contentType, type } = data;

//   if (!["RESUME", "COVER_LETTER"].includes(type)) {
//     throw new AppError("Invalid file type", 400);
//   }

//   const user = await prisma.user.findUnique({
//     where: { id }
//   });

//   if (!user) {
//     throw new AppError("User is not authenticated", 401);
//   }

//   const fileExtension = filename.split(".").pop();
//   const prefix = type === "COVER_LETTER" ? "cover-letter" : "resume";
//   const tempKey = `temp/${user.id}/${prefix}-${crypto.randomUUID()}.${fileExtension}`;

//   const { data: uploadData, error } = await supabaseAdmin.storage
//     .from(process.env.S3_BUCKET_NAME)
//     .createSignedUploadUrl(tempKey);

//   if (error) {
//     throw new AppError(error.message, 500);
//   }

//   await prisma.file.create({
//     data: {
//       key: tempKey,
//       userId: id,
//       type: type,
//       status: "TEMP",
//     },
//   });

//   return { token: uploadData.token, tempKey };
// };

// export async function generatePresignedGetUrl(fileKey) {
//     const command = new GetObjectCommand({
//         Bucket: process.env.S3_BUCKET_NAME,
//         Key: fileKey,
//         ResponseContentDisposition: "inline",
//         ResponseContentType: "application/pdf",
//     });

//     return await getSignedUrl(s3, command, { expiresIn: 600 });
// }

// export async function promoteTempFileToPermanent(tempKey, userId, type) {
//     const bucketName = process.env.S3_BUCKET_NAME;

//     const fileName = tempKey.split('/').pop();

//     const fileType = type === "RESUME" ? "resume" : "coverletter";

//     const permanentKey = `profiles/${userId}/${fileType}/${fileName}`;

//     try {
//         await s3.send(
//             new CopyObjectCommand({
//                 Bucket: bucketName,
//                 CopySource: `${bucketName}/${tempKey}`,
//                 Key: permanentKey,
//             })
//         );

//         await s3.send(
//             new DeleteObjectCommand({
//                 Bucket: bucketName,
//                 Key: tempKey,
//             })
//         );

//         return permanentKey;
//     } catch (error) {
//         console.error('Failed to move file:', error);
//         throw new AppError('File transfer failed', 500);
//     }
// }

// export const getFileUrl = async (currentUserId, currentUserRole, key) => {

//     if (!key) {
//         throw new AppError("Key is required", 400);
//     }

//     if (!currentUserId) {
//         throw new AppError("Unauthorized", 401);
//     }

//     const file = await prisma.file.findUnique({
//         where: { key }
//     });

//     if (!file) {
//         throw new AppError("File not found", 404);
//     }

//     const profile = await prisma.developerProfile.findUnique({
//         where: {
//             userId: currentUserId
//         }
//     })

//     const isOwner = profile.userId === currentUserId;
//     const isRecruiter = currentUserRole === "RECRUITER";

//     if (!isOwner && !isRecruiter) {
//         throw new AppError("Forbidden: You do not have permission to view this resume.", 403);
//     }

//     const downloadUrl = await generatePresignedGetUrl(file.key);

//     return downloadUrl;

// }


import { AppError } from "@/utils/AppError";
import { supabaseAdmin } from "@/utils/supabaseAdmin";

import prisma from "@/utils/prisma";

export const checkTempKey = (tempKey, userId) => {
  if (!tempKey.startsWith(`temp/${userId}/`)) {
    throw new AppError("Security Violation: You are not authorized to access this file.");
  }
};

export const getPutUrl = async (id, data) => {
  const { filename, contentType, type } = data;

  if (!["RESUME", "COVER_LETTER"].includes(type)) {
    throw new AppError("Invalid file type", 400);
  }

  const user = await prisma.user.findUnique({
    where: { id }
  });

  console.log("URL:", process.env.SUPABASE_URL);
  console.log("BUCKET:", process.env.S3_BUCKET_NAME);

  if (!user) {
    throw new AppError("User is not authenticated", 401);
  }

  const fileExtension = filename.split(".").pop();
  const prefix = type === "COVER_LETTER" ? "cover-letter" : "resume";
  const tempKey = `temp/${user.id}/${prefix}-${crypto.randomUUID()}.${fileExtension}`;

  const { data: uploadData, error } = await supabaseAdmin.storage
    .from(process.env.S3_BUCKET_NAME)
    .createSignedUploadUrl(tempKey);

  if (error) {
    throw new AppError(error.message, 500);
  }

  await prisma.file.create({
    data: {
      key: tempKey,
      userId: id,
      type: type,
      status: "TEMP",
    },
  });

  return { token: uploadData.token, tempKey };
};

export async function generatePresignedGetUrl(fileKey, expiresIn = 600) {
  const { data, error } = await supabaseAdmin.storage
    .from(process.env.S3_BUCKET_NAME)
    .createSignedUrl(fileKey, expiresIn, {
      download: false,
    });

  if (error) {
    throw new AppError(error.message, 500);
  }

  return data.signedUrl;
}

export async function promoteTempFileToPermanent(tempKey, userId, type) {
  const bucketName = process.env.S3_BUCKET_NAME;
  const fileName = tempKey.split('/').pop();
  const fileType = type === "RESUME" ? "resume" : "coverletter";
  const permanentKey = `profiles/${userId}/${fileType}/${fileName}`;

  try {
    const { error: copyError } = await supabaseAdmin.storage
      .from(bucketName)
      .copy(tempKey, permanentKey);

    if (copyError) {
      throw copyError;
    }

    const { error: deleteError } = await supabaseAdmin.storage
      .from(bucketName)
      .remove([tempKey]);

    if (deleteError) {
      console.warn('Failed to delete temp file:', deleteError.message);
    }

    return permanentKey;
  } catch (error) {
    console.error('Failed to move file:', error);
    throw new AppError('File transfer failed', 500);
  }
}

export const getFileUrl = async (currentUserId, currentUserRole, key) => {
  if (!key) {
    throw new AppError("Key is required", 400);
  }

  if (!currentUserId) {
    throw new AppError("Unauthorized", 401);
  }

  const file = await prisma.file.findUnique({
    where: { key }
  });

  if (!file) {
    throw new AppError("File not found", 404);
  }

  const recruiterProfile = await prisma.recruiterProfile.findUnique({
    where: { userId: currentUserId },
    select: { id: true },
  });

  const isRecruiter = currentUserRole === "RECRUITER";
  let hasAccess = file.userId === currentUserId;

  // Application documents are owned by the developer, so authorize recruiters
  // through the application and its job's company membership instead.
  if (!hasAccess && isRecruiter && file.type === "RESUME" && recruiterProfile) {
    const application = await prisma.application.findFirst({
      where: {
        resumeId: file.id,
        job: {
          company: {
            OR: [
              { ownerId: recruiterProfile.id },
              { recruiters: { some: { id: recruiterProfile.id } } },
            ],
          },
        },
      },
      select: { id: true },
    });
    hasAccess = Boolean(application);
  }

  if (!hasAccess && isRecruiter && file.type === "COVER_LETTER") {
    if (recruiterProfile) {
      const [application, recruiterEvent, employmentEvent] = await Promise.all([
        prisma.application.findFirst({
          where: {
            coverLetterId: file.id,
            job: {
              company: {
                OR: [
                  { ownerId: recruiterProfile.id },
                  { recruiters: { some: { id: recruiterProfile.id } } },
                ],
              },
            },
          },
          select: { id: true },
        }),
        prisma.recruiterEvent.findFirst({
          where: { letterUrl: file.key },
          include: {
            recruiterHistory: {
              include: { company: { select: { ownerId: true } } },
            },
          },
        }),
        prisma.employementEvent.findFirst({
          where: { letterUrl: file.key },
          include: {
            employmentHistory: {
              include: { company: { select: { ownerId: true } } },
            },
          },
        }),
      ]);

      hasAccess = Boolean(
        application ||
        (recruiterEvent &&
          (recruiterEvent.recruiterHistory.recruiterProfileId === recruiterProfile.id ||
            recruiterEvent.recruiterHistory.company.ownerId === recruiterProfile.id)) ||
        (employmentEvent &&
          (employmentEvent.employmentHistory.hiredByRecruiterId === recruiterProfile.id ||
            employmentEvent.employmentHistory.company.ownerId === recruiterProfile.id))
      );
    }
  }

  if (!hasAccess) {
    throw new AppError("Forbidden: You do not have permission to view this file.", 403);
  }

  const downloadUrl = await generatePresignedGetUrl(file.key);

  return downloadUrl;
};
