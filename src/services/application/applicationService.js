import { PrismaClient } from "@/generated/prisma/client";
import { AppError } from "@/utils/AppError";
import { JobStatus } from "@/generated/prisma/client";
import { getDeveloperProfile } from "../profile/developerService";
import { getRecuiterProfile } from "../profile/recuiterService";
import { STATUS } from "@/generated/prisma/client";
import { ActionType } from "@/generated/prisma/client";
import { ReferenceType } from "@/generated/prisma/client";
import { notificationQueue } from "@/lib/queues/notification.queue";
import { emailQueue } from "@/lib/queues/email.queue";
import { checkTempKey, promoteTempFileToPermanent } from "../presignedUrl/presignedUrl";
import { storageQueue } from "@/lib/queues/s3";
import { developerProfileKey } from "@/utils/redisKeyNames";
import { redis } from "@/lib/redis";
import crypto from "crypto";

import prisma from "@/utils/prisma";
const newPirsma = new PrismaClient()

const ADMIN_APPLICATION_SORT_FIELDS = new Set([
    "createdAt",
    "updatedAt",
    "status",
]);

const APPLICATION_STATUSES = new Set([
    "PENDING",
    "REVIEW",
    "ACCEPTED",
    "REJECTED",
]);

export const createApplication = async (userId, data) => {
    const { jobId, resumeTempKey, coverLetterTempKey } = data;

    const [profile, jobExist] = await Promise.all([
        getDeveloperProfile(userId),
        prisma.job.findUnique({
            where: { id: jobId },
            include: {
                company: {
                    include: { owner: { select: { userId: true } } },
                },
                recruiter: { select: { userId: true } },
            },
        }),
    ]);

    if (!profile) throw new AppError("Create your profile first!", 404);
    if (!jobExist) throw new AppError("Job does not exist!", 404);

    const alreadyApplied = await prisma.application.findFirst({
        where: {
            jobId,
            devProfileId: profile.id
        }
    })

    if (alreadyApplied) throw new AppError("You have already applied to this job!", 400);

    if (jobExist.status !== JobStatus.ACTIVE) throw new AppError("Job is not active!", 403);
    if (new Date(jobExist.deadline) < new Date()) throw new AppError("Job deadline has passed!", 403);

    const company = jobExist.company;
    if (!company) throw new AppError("Company does not exist!", 404);
    if (!company.isVerified) throw new AppError("Company is not verified!", 403);

    const currentEmploymentAtCompany = await prisma.employmentHistory.findFirst({
        where: {
            devProfileId: profile.id,
            companyId: company.id,
            isCurrent: true,
        },
        select: { id: true },
    });

    if (currentEmploymentAtCompany) {
        throw new AppError("You cannot apply to a job at a company where you currently work.", 403);
    }

    const application = await prisma.application.create({
        data: {
            jobId,
            devProfileId: profile.id,
        }
    });

    const queuePromises = [];

    if (resumeTempKey) {
        checkTempKey(resumeTempKey, userId);
        queuePromises.push(
            storageQueue.add(
                "storage",
                {
                    tempKey: resumeTempKey,
                    userId,
                    fileType: "RESUME",
                    model: "application",
                    applicationId: application.id,
                },
                { jobId: `storage-app-${application.id}-resume` }
            )
        );
    }

    if (coverLetterTempKey) {
        checkTempKey(coverLetterTempKey, userId);
        queuePromises.push(
            storageQueue.add(
                "storage",
                {
                    tempKey: coverLetterTempKey,
                    userId,
                    fileType: "COVER_LETTER",
                    model: "application",
                    applicationId: application.id,
                },
                { jobId: `storage-app-${application.id}-cover` }
            )
        );
    }

    queuePromises.push(
        notificationQueue.add(
            "application-submitted",
            {
                message: "Application Submitted!",
                recipientId: profile.userId,
                referenceId: application.id,
                actionType: ActionType.APPLICATION_SUBMITTED,
                referenceType: ReferenceType.APPLICATION,
            },
            { jobId: `notif-app-${application.id}` }
        )
    );

    const recruiterRecipients = new Set([
        jobExist.recruiter?.userId,
        jobExist.company.owner?.userId,
    ].filter(Boolean));

    for (const recipientId of recruiterRecipients) {
        queuePromises.push(
            notificationQueue.add(
                "application-received",
                {
                    id: crypto.randomUUID(),
                    message: `A developer applied for ${jobExist.title}.`,
                    recipientId,
                    referenceId: application.id,
                    actionType: ActionType.APPLICATION_RECEIVED,
                    referenceType: ReferenceType.APPLICATION,
                },
                { jobId: `notif-app-received-${application.id}-${recipientId}` }
            )
        );
    }

    await Promise.all(queuePromises);

    return application;
};

export const getApplicationsForDeveloper = async (
    searchParams,
    userId
) => {
    const status = searchParams.get("status");
    const sort = searchParams.get("sort");
    const search = searchParams.get("search");

    const page = Number(
        searchParams.get("page") || 1
    );

    const pageSize = Number(
        searchParams.get("limit") || 10
    );

    const currentPage = Math.max(1, page);
    const limit = Math.max(1, pageSize);

    const profile = await getDeveloperProfile(userId);

    if (!profile) {
        throw new AppError(
            "Create Your profile first!",
            404
        );
    }

    const where = {
        devProfileId: profile.id,
    };

    if (status) {
        where.status = status;
    }

    if (search) {
        where.job = {
            OR: [
                {
                    title: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
                {
                    description: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
                {
                    company: {
                        name: {
                            contains: search,
                            mode: "insensitive",
                        },
                    },
                },
                {
                    company: {
                        description: {
                            contains: search,
                            mode: "insensitive",
                        },
                    },
                },
            ],
        };
    }

    /*
     * SORT
     */
    let orderBy = {
        createdAt: "desc",
    };

    if (sort === "oldest") {
        orderBy = {
            createdAt: "asc",
        };
    }

    if (sort === "newest") {
        orderBy = {
            createdAt: "desc",
        };
    }

    const [applications, totalCount] =
        await prisma.$transaction([
            prisma.application.findMany({
                where,

                select: {
                    id: true,
                    coverLetterId: true,
                    createdAt: true,
                    devProfileId: true,
                    jobId: true,
                    rejectionReason: true,
                    resumeId: true,
                    status: true,
                    updatedAt: true,

                    job: {
                        select: {
                            id: true,
                            title: true,
                            description: true,
                            employmentType: true,
                            experienceLevel: true,
                            locationPreference: true,
                            status: true,
                            minSalary: true,
                            maxSalary: true,
                            currency: true,
                            isFeatured: true,
                            deadline: true,
                            createdAt: true,
                            publishedAt: true,

                            company: {
                                select: {
                                    id: true,
                                    name: true,
                                    logo: true,
                                    websiteUrl: true,
                                    description: true,
                                    industry: true,
                                    country: true,
                                    isVerified: true,
                                },
                            },
                        },
                    },
                },

                take: limit,

                skip:
                    (currentPage - 1) * limit,

                orderBy,
            }),

            prisma.application.count({
                where,
            }),
        ]);

    const totalPages = Math.ceil(
        totalCount / limit
    );

    const metadata = {
        currentPage,
        pageSize: limit,
        totalCount,
        totalPages,

        hasNextPage:
            currentPage < totalPages,

        hasPreviousPage:
            currentPage > 1,
    };

    return {
        applications,
        metadata,
    };
};

export const getApplicationsForRecuiter = async (searchParams, userId) => {
    const status = searchParams.get("status");
    const sort = searchParams.get("sort");
    const jobId = searchParams.get("jobId");
    const search = searchParams.get("search");

    const page = Number(searchParams.get("page") || 1);
    const pageSize = Number(searchParams.get("limit") || 10);

    const currentPage = Math.max(1, page);
    const limit = Math.max(1, pageSize);

    const profile = await getRecuiterProfile(userId);

    if (!profile || !profile.companyId) {
        throw new AppError(
            "Create your recruiter profile and attach it to a company first!",
            404
        );
    }

    const company = await prisma.company.findUnique({
        where: {
            id: profile.companyId,
        },
    });

    if (!company) {
        throw new AppError("Company not found!", 404);
    }

    if (!company.isVerified) {
        throw new AppError("Your company is not verified!", 403);
    }

    const where = {
        job: {
            companyId: company.id,
            ...(jobId ? { id: jobId } : {}),
        },
        ...(status ? { status } : {}),
    };

    if (search) {
        where.OR = [
            { job: { title: { contains: search, mode: "insensitive" } } },
            { job: { description: { contains: search, mode: "insensitive" } } },
            {
                developerProfile: {
                    user: {
                        name: { contains: search, mode: "insensitive" },
                    },
                },
            },
        ];
    }

    let orderBy = {
        createdAt: "desc",
    };

    if (sort === "oldest") {
        orderBy = {
            createdAt: "asc",
        };
    }

    if (sort === "newest") {
        orderBy = {
            createdAt: "desc",
        };
    }

    const [applications, totalCount] = await prisma.$transaction([
        prisma.application.findMany({
            where,

            orderBy,

            take: limit,

            skip: (currentPage - 1) * limit,

            include: {
                job: {
                    include: {
                        company: {
                            select: {
                                id: true,
                                name: true,
                                logo: true,
                                websiteUrl: true,
                                description: true,
                                industry: true,
                                country: true,
                                isVerified: true,
                            },
                        },
                    },
                },

                developerProfile: {
                    include: {
                        skills: true,
                        user: true
                    },

                },

                resume: true,
                coverLetter: true,
            },
        }),

        prisma.application.count({
            where,
        }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
        applications,
        metadata: {
            currentPage,
            pageSize: limit,
            totalCount,
            totalPages,
            hasNextPage: currentPage < totalPages,
            hasPreviousPage: currentPage > 1,
        },
    };
};

export const getApplicationForDeveloper = async (id, userId) => {
    const profile = await getDeveloperProfile(userId)

    if (!profile) {
        throw new AppError("Create Your profile first!", 404)
    }


    const application = await prisma.application.findFirst({
        where: {
            id,
            devProfileId: profile.id
        },
        include: {
            job: {
                include: {
                    company: true
                }
            },
            developerProfile: {
                include: {
                    skills: true
                },
            },
            coverLetter: true,
            resume: true,
        }
    })

    if (!application) {
        throw new AppError("Application not found!", 404);
    }

    const jobExist = await prisma.job.findUnique({
        where: {
            id: application.jobId
        }
    })

    if (!jobExist) {
        throw new AppError("Job is not exist!", 404)
    }

    const company = await prisma.company.findUnique({
        where: {
            id: jobExist.companyId,
            isVerified: true
        }
    });

    if (!company) {
        throw new AppError("Company is not exist or not verified!", 404)
    }

    return application;
}

export const getApplicationForRecuiter = async (
    id,
    userId,
    searchParams
) => {
    const profile = await getRecuiterProfile(userId);

    if (!profile || !profile.companyId) {
        throw new AppError(
            "Create your recruiter profile and attach it to a company first!",
            404
        );
    }

    const company = await prisma.company.findUnique({
        where: {
            id: profile.companyId,
        },
    });

    if (!company) {
        throw new AppError("Company not found!", 404);
    }

    if (!company.isVerified) {
        throw new AppError("Your company is not verified!", 403);
    }

    const application = await prisma.application.findFirst({
        where: {
            id,
            job: {
                companyId: company.id,
            },
        },
        include: {
            job: {
                include: {
                    company: {
                        select: {
                            id: true,
                            name: true,
                            logo: true,
                            websiteUrl: true,
                            description: true,
                            industry: true,
                            country: true,
                            isVerified: true,
                        },
                    },
                },
            },

            developerProfile: {
                include: {
                    skills: true,
                },
            },

            resume: true,
            coverLetter: true,
        },
    });

    if (!application) {
        throw new AppError("Application not found!", 404);
    }

    return application;
};

export const updateApplication = async (id, data, userId) => {
    const { resumeTempKey, coverLetterTempKey } = data;

    const profile = await getDeveloperProfile(userId);
    if (!profile) throw new AppError("Create your profile first!", 404);

    const application = await prisma.application.findUnique({
        where: {
            id,
            devProfileId: profile.id,
        },
        include: {
            job: true,
        },
    });

    if (!application) throw new AppError("Application not found!", 404);
    if (application.status !== "PENDING") {
        throw new AppError("Application cannot be changed because it is not in pending state", 403);
    }

    const { job } = application;
    if (!job) throw new AppError("Job not found!", 404);
    if (new Date(job.deadline) < new Date()) throw new AppError("Job deadline has passed!", 403);
    if (job.status !== "ACTIVE") throw new AppError("Job is not active!", 403);

    const queuePromises = [];

    if (resumeTempKey) {
        checkTempKey(resumeTempKey, userId);
        queuePromises.push(
            storageQueue.add(
                "storage",
                {
                    tempKey: resumeTempKey,
                    userId,
                    fileType: "RESUME",
                    model: "application",
                    applicationId: application.id,
                },
                { jobId: `storage-app-${application.id}-resume` }
            )
        );
    }

    if (coverLetterTempKey) {
        checkTempKey(coverLetterTempKey, userId);
        queuePromises.push(
            storageQueue.add(
                "storage",
                {
                    tempKey: coverLetterTempKey,
                    userId,
                    fileType: "COVER_LETTER",
                    model: "application",
                    applicationId: application.id,
                },
                { jobId: `storage-app-${application.id}-cover` }
            )
        );
    }

    await Promise.all(queuePromises);

    return { message: "Update Completed!" };
};

export const deleteApplication = async (id, userId) => {
    const profile = await getDeveloperProfile(userId)

    if (!profile) {
        throw new AppError("Create Your profile first!")
    }

    const application = await prisma.application.findUnique({
        where: {
            id,
            devProfileId: profile.id
        }
    })

    if (!application) {
        throw new AppError("Application not found!", 404)
    }

    if (application.status !== STATUS.PENDING) {
        throw new AppError("Application cannot be deleted because iit is not in pending state", 403)
    }

    const applicationDeleted = await prisma.application.delete({
        where: {
            id: application.id
        }
    });

    return applicationDeleted;
}

export const updateApplicationStatus = async (id, data, userId) => {
    const { status, roleTitle, employmentType, salary, currency, description, startDate, rejectionReason } = data;

    const profile = await getRecuiterProfile(userId)

    if (!profile) {
        throw new AppError("Create Your profile first!", 404)
    }

    const company = await prisma.company.findUnique({
        where: {
            id: profile.companyId
        }
    });

    if (!company) {
        throw new AppError("Company not found!", 404)
    }

    if (!company.isVerified) {
        throw new AppError("Company is not verified!", 403)
    }

    const application = await prisma.application.findUnique({
        where: {
            id
        },
        include: {
            job: {
                include: {
                    company: true
                }
            }
        }
    })

    // Check for job as well

    if (!application) {
        throw new AppError("Application not found!", 404)
    }

    if (application.job.companyId !== company.id) {
        throw new AppError("You cannot update other company application!", 403)
    }

    const alreadyEmployeed = await prisma.employmentHistory.findFirst({
        where: {
            devProfileId: application.devProfileId,
            isCurrent: true
        }
    });

    if (alreadyEmployeed) {
        throw new AppError("You are already employeed!", 403)
    }

    const job = await prisma.job.findFirst({
        where: {
            id: application.jobId,
            companyId: company.id
        }
    })

    if (!job) {
        throw new AppError("Job is not found!", 404)
    }

    if (application.status === "PENDING") {
        if (status !== "REVIEW") {
            throw new AppError("Application status is pending and can only be updated to reviewed!", 403)
        }
    }

    if (application.status === "REVIEW") {
        if (status !== "ACCEPTED" && status !== "REJECTED") {
            throw new AppError("Application status is recviewed and can only be updated to either accepted or rejected!", 403)
        }
    }

    if (application.status === "ACCEPTED" || application.status === "REJECTED") {
        throw new AppError(`Application status is ${application.status} and cannot be updated to ${status}!`, 403)
    }

    const res = await prisma.$transaction(async (tx) => {
        if (status === "ACCEPTED") {
            // Serialize acceptances for this job so concurrent requests cannot
            // both pass the check and create active employments.
            await tx.$queryRaw`SELECT "id" FROM "Job" WHERE "id" = ${job.id} FOR UPDATE`;

            const acceptedApplication = await tx.application.findFirst({
                where: {
                    jobId: job.id,
                    status: "ACCEPTED",
                    NOT: { id: application.id },
                },
                select: { id: true },
            });

            if (acceptedApplication) {
                throw new AppError("This job already has an accepted application.", 409);
            }
        }

        const updatedApplication = await tx.application.update({
            where: {
                id: application.id
            },
            data: {
                status,
                ...(rejectionReason && { rejectionReason })
            }, include: {
                developerProfile: {
                    include: { user: true },
                }
            }
        });

        let employmentHistory = {};

        if (status === "ACCEPTED") {
            employmentHistory = await tx.employmentHistory.create({
                data: {
                    roleTitle,
                    companyId: job.companyId,
                    description,
                    devProfileId: application.devProfileId,
                    startDate,
                    isCurrent: true,
                    hiredByRecruiterId: profile.id,
                    employmentType,
                    salary,
                    currency
                }
            });

            await tx.notification.create({
                data: {
                    id: crypto.randomUUID(),
                    message: `Congratulations! ${company.name} accepted your application for ${roleTitle}.`,
                    recipientId: updatedApplication.developerProfile.userId,
                    referenceId: employmentHistory.id,
                    actionType: ActionType.EMPLOYMENT_CREATED,
                    referenceType: ReferenceType.EMPLOYMENT,
                },
            });

            try {
                const uuid = crypto.randomUUID();
                const developerUser = updatedApplication.developerProfile.user;
                await emailQueue.add("application-accepted-email", {
                    uuid,
                    email: developerUser.email,
                    recipientName: developerUser.name,
                    companyName: company.name,
                    roleTitle,
                    startDate: startDate.toISOString(),
                }, { jobId: uuid });
            } catch (error) {
                console.error("Failed to queue application acceptance email:", error);
            }

            await redis.del(`${developerProfileKey}:${userId}`);
        }

        if (status === "REJECTED") {
            const uuid = crypto.randomUUID();
            const developerUser = updatedApplication.developerProfile.user;
            try {
                await emailQueue.add("application-rejected-email", {
                    uuid,
                    email: developerUser.email,
                    recipientName: developerUser.name,
                    companyName: company.name,
                    roleTitle: job.title,
                    rejectionReason: updatedApplication.rejectionReason,
                }, { jobId: uuid });
            } catch (error) {
                console.error("Failed to queue application rejection email:", error);
            }
        }

        try {
            redis.del(`${developerProfileKey}:${userId}`)
        } catch (error) {
            console.log("redis error:", error)
        }

        if (status !== "ACCEPTED") {
            const uuid = crypto.randomUUID();
            try {
                await notificationQueue.add("application-status-updated", {
                    message: `Application status is ${status}`,
                    recipientId: updatedApplication.developerProfile.userId,
                    referenceId: updatedApplication.id,
                    actionType: ActionType.APPLICATION_STATUS_CHANGED,
                    referenceType: ReferenceType.APPLICATION
                }, {
                    jobId: uuid
                })

            } catch (error) {
                console.log("Bullmq error:", error)
            }
        }

        return {
            updatedApplication,
            employmentHistory
        };
    })

    return res;
};

export const getAdminApplicationsList = async (queryParams = {}) => {
    const {
        page = 1,
        limit = 20,
        status,
        jobId,
        companyId,
        recruiterId,
        developerId,
        search,
        sortBy = "createdAt",
        sortOrder = "desc",
    } = queryParams;

    const parsedPage = Math.max(1, Number.parseInt(page, 10) || 1);
    const parsedLimit = Math.min(
        100,
        Math.max(1, Number.parseInt(limit, 10) || 20)
    );

    const safeSortBy = ADMIN_APPLICATION_SORT_FIELDS.has(sortBy)
        ? sortBy
        : "createdAt";

    const safeSortOrder = sortOrder === "asc" ? "asc" : "desc";
    const normalizedStatus = String(status || "").toUpperCase().trim();

    if (normalizedStatus && !APPLICATION_STATUSES.has(normalizedStatus)) {
        throw new AppError("Invalid application status filter", 400);
    }

    const where = {};

    if (normalizedStatus) where.status = normalizedStatus;
    if (jobId) where.jobId = String(jobId);
    if (developerId) where.devProfileId = String(developerId);

    if (companyId || recruiterId) {
        where.job = {
            ...(companyId ? { companyId: String(companyId) } : {}),
            ...(recruiterId ? { recruiterId: String(recruiterId) } : {}),
        };
    }

    const term = String(search || "").trim().slice(0, 120);

    if (term) {
        where.OR = [
            {
                developerProfile: {
                    user: { name: { contains: term, mode: "insensitive" } },
                },
            },
            {
                developerProfile: {
                    user: { email: { contains: term, mode: "insensitive" } },
                },
            },
            {
                job: { title: { contains: term, mode: "insensitive" } },
            },
            {
                job: {
                    company: { name: { contains: term, mode: "insensitive" } },
                },
            },
        ];
    }

    const skip = (parsedPage - 1) * parsedLimit;

    const [applications, total] = await prisma.$transaction([
        prisma.application.findMany({
            where,
            skip,
            take: parsedLimit,
            orderBy: [
                { [safeSortBy]: safeSortOrder },
                { id: "desc" },
            ],
            select: {
                id: true,
                status: true,
                rejectionReason: true,
                createdAt: true,
                updatedAt: true,
                developerProfile: {
                    select: {
                        id: true,
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                isVerified: true,
                                isActive: true,
                            },
                        },
                    },
                },
                job: {
                    select: {
                        id: true,
                        title: true,
                        company: {
                            select: {
                                id: true,
                                name: true,
                                logo: true,
                                isVerified: true,
                            },
                        },
                        recruiter: {
                            select: {
                                id: true,
                                user: {
                                    select: {
                                        id: true,
                                        name: true,
                                        email: true,
                                    },
                                },
                            },
                        },
                    },
                },
                resume: {
                    select: {
                        id: true,
                        type: true,
                        status: true,
                        createdAt: true,
                    },
                },
                coverLetter: {
                    select: {
                        id: true,
                        type: true,
                        status: true,
                        createdAt: true,
                    },
                },
            },
        }),
        prisma.application.count({ where }),
    ]);

    const totalPages = Math.ceil(total / parsedLimit);

    return {
        applications,
        pagination: {
            total,
            page: parsedPage,
            limit: parsedLimit,
            totalPages,
            hasNextPage: parsedPage < totalPages,
            hasPreviousPage: parsedPage > 1,
        },
    };
};

export const getAdminApplicationById = async (id) => {
    const application = await prisma.application.findUnique({
        where: { id },
        include: {
            developerProfile: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            isVerified: true,
                            isActive: true,
                            createdAt: true,
                        },
                    },
                },
            },
            job: {
                include: {
                    company: {
                        select: {
                            id: true,
                            name: true,
                            logo: true,
                            websiteUrl: true,
                            country: true,
                            industry: true,
                            isVerified: true,
                        },
                    },
                    recruiter: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                    isVerified: true,
                                    isActive: true,
                                },
                            },
                        },
                    },
                },
            },
            resume: {
                select: {
                    id: true,
                    type: true,
                    status: true,
                    createdAt: true,
                },
            },
            coverLetter: {
                select: {
                    id: true,
                    type: true,
                    status: true,
                    createdAt: true,
                },
            },
        },
    });

    if (!application) {
        throw new AppError("Application not found", 404);
    }

    const statusCounts = await prisma.application.groupBy({
        by: ["status"],
        where: { jobId: application.jobId },
        _count: { _all: true },
    });

    const jobApplicationStats = {
        total: statusCounts.reduce((sum, item) => sum + item._count._all, 0),
        breakdown: {
            PENDING: 0,
            REVIEW: 0,
            ACCEPTED: 0,
            REJECTED: 0,
        },
    };

    for (const item of statusCounts) {
        jobApplicationStats.breakdown[item.status] = item._count._all;
    }

    // Never return application.resume.key or coverLetter.key here.
    // The document route should authorize access and create a short-lived URL.
    return {
        ...application,
        jobApplicationStats,
    };
};
