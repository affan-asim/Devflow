import prisma from "@/utils/prisma";
import { AppError } from "@/utils/AppError";
import { getRecuiterProfile } from "@/services/profile/recuiterService";
import { emailQueue } from "@/lib/queues/email.queue";
import crypto from "crypto";
import { redis } from "@/lib/redis";
import { userKey } from "@/utils/redisKeyNames";

const requestInclude = {
  company: { select: { id: true, name: true, logo: true, industry: true, country: true, isVerified: true, websiteUrl: true } },
  recruiter: {
    select: {
      id: true, companyId: true, jobTitle: true, bio: true,
      resume: { select: { id: true, key: true } },
      user: { select: { id: true, name: true, email: true, isVerified: true } },
    },
  },
};

const getProfile = async (userId) => {
  const profile = await getRecuiterProfile(userId);
  if (!profile) throw new AppError("Create your recruiter profile first.", 404);
  return profile;
};

export const createCompanyJoinRequest = async (userId, data) => {
  const profile = await getProfile(userId);
  if (profile.companyId) throw new AppError("You are already attached to a company.", 403);

  const company = await prisma.company.findUnique({ where: { id: data.companyId } });
  if (!company) throw new AppError("Company not found.", 404);
  if (!company.isVerified) throw new AppError("You can only request to join a verified company.", 403);

  const prior = await prisma.companyJoinRequest.findUnique({
    where: { recruiterId_companyId: { recruiterId: profile.id, companyId: company.id } },
  });
  if (prior) {
    if (prior.status !== "CANCELLED") throw new AppError("You already have a request for this company.", 409);
    return prisma.companyJoinRequest.update({
      where: { id: prior.id }, data: { status: "PENDING", message: data.message ?? null }, include: requestInclude,
    });
  }

  try {
    return await prisma.companyJoinRequest.create({
      data: { recruiterId: profile.id, companyId: company.id, message: data.message ?? null },
      include: requestInclude,
    });
  } catch (error) {
    if (error?.code === "P2002") {
      throw new AppError("You already have a request for this company.", 409);
    }
    throw error;
  }
};

export const getCompanyJoinRequests = async (userId, searchParams) => {
  const profile = await getProfile(userId);
  const type = searchParams.get("type") || "received";
  if (!["received", "sent"].includes(type)) throw new AppError("type must be received or sent.", 400);
  const page = Number(searchParams.get("page") || 1);
  const requestedLimit = Number(searchParams.get("limit") || 10);
  if (!Number.isInteger(page) || page < 1) throw new AppError("page must be a positive integer.", 400);
  if (!Number.isInteger(requestedLimit) || requestedLimit < 1) throw new AppError("limit must be a positive integer.", 400);
  const limit = Math.min(requestedLimit, 100);
  const where = type === "received" ? { company: { ownerId: profile.id } } : { recruiterId: profile.id };
  const companyId = searchParams.get("companyId")?.trim();
  if (companyId) where.companyId = companyId;
  const status = searchParams.get("status");
  if (status) {
    if (!["PENDING", "ACCEPTED", "REJECTED", "CANCELLED"].includes(status)) throw new AppError("Invalid company join request status.", 400);
    where.status = status;
  }
  const search = searchParams.get("search")?.trim();
  if (search) {
    where.OR = type === "received"
      ? [{ recruiter: { user: { name: { contains: search, mode: "insensitive" } } } }, { recruiter: { user: { email: { contains: search, mode: "insensitive" } } } }, { company: { name: { contains: search, mode: "insensitive" } } }]
      : [{ company: { name: { contains: search, mode: "insensitive" } } }];
  }
  const [requests, totalCount] = await prisma.$transaction([
    prisma.companyJoinRequest.findMany({ where, include: requestInclude, take: limit, skip: (page - 1) * limit, orderBy: [{ createdAt: "desc" }, { id: "asc" }] }),
    prisma.companyJoinRequest.count({ where }),
  ]);
  const totalPages = Math.ceil(totalCount / limit);
  return { requests, metadata: { currentPage: page, pageSize: limit, totalCount, totalPages, hasNextPage: page < totalPages, hasPreviousPage: page > 1 } };
};

export const getCompanyJoinRequestDetail = async (userId, id) => {
  const profile = await getProfile(userId);
  const request = await prisma.companyJoinRequest.findFirst({
    where: { id, OR: [{ recruiterId: profile.id }, { company: { ownerId: profile.id } }] },
    include: requestInclude,
  });
  if (!request) throw new AppError("Company join request not found.", 404);
  return request;
};

export const updateCompanyJoinRequest = async (userId, id, data) => {
  const profile = await getProfile(userId);
  const request = await prisma.companyJoinRequest.findFirst({ where: { id, recruiterId: profile.id } });
  if (!request) throw new AppError("Company join request not found.", 404);
  if (request.status !== "PENDING") throw new AppError("Only pending requests can be edited.", 409);
  return prisma.companyJoinRequest.update({ where: { id }, data: { message: data.message ?? null }, include: requestInclude });
};

export const updateCompanyJoinRequestStatus = async (userId, id, data) => {
  const profile = await getProfile(userId);
  const request = await prisma.companyJoinRequest.findUnique({
    where: { id },
    include: { company: true, recruiter: { include: { user: true } } },
  });
  if (!request) throw new AppError("Company join request not found.", 404);
  if (request.company.ownerId !== profile.id) throw new AppError("Only the company owner can decide this request.", 403);
  if (!request.company.isVerified) throw new AppError("Company must be verified to manage join requests.", 403);
  if (request.status !== "PENDING") throw new AppError("Only pending requests can be accepted or rejected.", 409);

  const status = data.status;
  const updated = await prisma.$transaction(async (tx) => {
    const freshProfile = await tx.recruiterProfile.findUnique({ where: { id: request.recruiterId } });
    if (!freshProfile) throw new AppError("Recruiter profile not found.", 404);
    if (status === "ACCEPTED" && freshProfile.companyId) throw new AppError("This recruiter is already attached to a company.", 409);
    const requestUpdate = await tx.companyJoinRequest.updateMany({
      where: { id, status: "PENDING" },
      data: { status },
    });
    if (requestUpdate.count !== 1) throw new AppError("This request has already been decided.", 409);
    if (status === "ACCEPTED") {
      const recruiterUpdate = await tx.recruiterProfile.updateMany({
        where: { id: freshProfile.id, companyId: null },
        data: { companyId: request.companyId },
      });
      if (recruiterUpdate.count !== 1) throw new AppError("This recruiter is already attached to a company.", 409);
      await tx.recruiterHistory.create({
        data: {
          recruiterProfileId: freshProfile.id,
          companyId: request.companyId,
          roleTitle: data.roleTitle,
          employmentType: data.employmentType,
          salary: data.salary ?? null,
          currency: data.currency ?? null,
          description: data.description ?? null,
          startDate: data.startDate ?? new Date(),
          isCurrent: true,
          isOwner: false,
        },
      });
    }
    return { id };
  });

  if (status === "ACCEPTED") {
    // Invalidate the recruiter's cached /api/auth/me response so their
    // updated companyId is reflected immediately on the next request.
    try {
      await redis.del(`${userKey}:${request.recruiter.user.id}`);
    } catch (cacheError) {
      console.error("Failed to invalidate user cache after join request accept:", cacheError);
    }
  }

  try {
    const id = crypto.randomUUID();
    await emailQueue.add("company-join-request-status-email", {
      email: request.recruiter.user.email,
      recruiterName: request.recruiter.user.name,
      companyName: request.company.name,
      status,
      roleTitle: status === "ACCEPTED" ? data.roleTitle : undefined,
      uuid: id,
    },{ jobId: id });
  } catch (error) {
    console.error("FAILED TO QUEUE COMPANY JOIN REQUEST EMAIL:", error);
  }
  return prisma.companyJoinRequest.findUnique({ where: { id: updated.id }, include: requestInclude });
};
