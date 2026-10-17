import { PrismaClient } from "@/generated/prisma/client";
import { redis } from "@/lib/redis";
import { AppError } from "@/utils/AppError";
import { recruiterProfileKey } from "@/utils/redisKeyNames";
import { storageQueue } from "@/lib/queues/s3";
import { checkTempKey } from "@/services/presignedUrl/presignedUrl";

// import prisma from "@/utils/prisma";
const prisma = new PrismaClient()

const RECRUITER_PROFILE_SORT_FIELDS = new Set([
    "createdAt",
    "yearsOfExp",
    "jobTitle",
    "name",
]);

const parseNonNegativeNumber = (value, fieldName) => {
    if (value === undefined || value === null || value === "") return undefined;

    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 0) {
        throw new AppError(`${fieldName} must be a valid non-negative number.`, 400);
    }

    return parsed;
};

const parseBooleanFilter = (value, fieldName) => {
    if (value === undefined || value === null || value === "") return undefined;
    if (value === true || value === "true") return true;
    if (value === false || value === "false") return false;
    throw new AppError(`${fieldName} must be true or false.`, 400);
};

export const getRecuiterProfileList = async (searchParams, userId) => {
    const canViewPrivateData = Boolean(userId);
    const getParam = (key) => searchParams instanceof URLSearchParams
        ? searchParams.get(key)
        : searchParams?.[key];

    const search = getParam("search")?.trim() || "";
    const email = getParam("email")?.trim() || "";
    const jobTitle = getParam("jobTitle")?.trim() || "";
    const companyId = getParam("companyId")?.trim() || "";
    const independentOnly = getParam("independentOnly") === "true";
    const locationPreference = getParam("locationPreference");
    const isActive = parseBooleanFilter(getParam("isActive"), "isActive");
    const isVerified = parseBooleanFilter(getParam("isVerified"), "isVerified");
    const minExp = parseNonNegativeNumber(getParam("minExp"), "minExp");
    const maxExp = parseNonNegativeNumber(getParam("maxExp"), "maxExp");
    const rawPage = getParam("page") ?? 1;
    const rawLimit = getParam("limit") ?? 10;
    const page = Number(rawPage);
    const requestedLimit = Number(rawLimit);

    if (userId) {
        const viewer = await prisma.recruiterProfile.findUnique({
            where: { userId },
            select: { ownedCompany: { select: { isVerified: true } } },
        });
        if (!viewer?.ownedCompany?.isVerified) {
            throw new AppError("Only a verified company owner can explore recruiter profiles.", 403);
        }
    }

    if (!Number.isInteger(page) || page < 1) {
        throw new AppError("page must be a positive integer.", 400);
    }
    if (!Number.isInteger(requestedLimit) || requestedLimit < 1) {
        throw new AppError("limit must be a positive integer.", 400);
    }
    if (minExp !== undefined && maxExp !== undefined && minExp > maxExp) {
        throw new AppError("minExp cannot be greater than maxExp.", 400);
    }
    if (locationPreference && !["REMOTE", "ONSITE", "HYBRID"].includes(locationPreference)) {
        throw new AppError("locationPreference must be REMOTE, ONSITE, or HYBRID.", 400);
    }

    const limit = Math.min(requestedLimit, 100);
    const sortByParam = getParam("sortBy") ?? "createdAt";
    const sortOrderParam = getParam("sortOrder") ?? "desc";
    const sortBy = RECRUITER_PROFILE_SORT_FIELDS.has(sortByParam) ? sortByParam : "createdAt";
    const sortOrder = sortOrderParam === "asc" ? "asc" : "desc";

    const where = {
        user: { role: "RECRUITER" },
        ...(userId ? { userId: { not: userId } } : {}),
    };

    if (canViewPrivateData && companyId) where.companyId = companyId;
    if (independentOnly) where.companyId = null;
    if (locationPreference) where.locationPreference = locationPreference;
    if (jobTitle) where.jobTitle = { contains: jobTitle, mode: "insensitive" };
    if (minExp !== undefined || maxExp !== undefined) {
        where.yearsOfExp = {
            ...(minExp !== undefined ? { gte: minExp } : {}),
            ...(maxExp !== undefined ? { lte: maxExp } : {}),
        };
    }
    // Public directory requests show active accounts only and cannot filter by
    // private contact or account activity data.
    if (canViewPrivateData) {
        if (isActive !== undefined) where.user.isActive = isActive;
    } else {
        where.user.isActive = true;
    }
    if (isVerified !== undefined) where.user.isVerified = isVerified;
    if (canViewPrivateData && email) where.user.email = { contains: email, mode: "insensitive" };
    if (search) {
        where.OR = [
            { bio: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { jobTitle: { contains: search, mode: "insensitive" } },
            { user: { name: { contains: search, mode: "insensitive" } } },
            ...(canViewPrivateData ? [{ user: { email: { contains: search, mode: "insensitive" } } }] : []),
            { company: { name: { contains: search, mode: "insensitive" } } },
        ];
    }

    const orderBy = sortBy === "name"
        ? { user: { name: sortOrder } }
        : { [sortBy]: sortOrder };

    const [profiles, totalCount] = await prisma.$transaction([
        prisma.recruiterProfile.findMany({
            where,
            select: {
                id: true,
                ...(canViewPrivateData ? { userId: true, companyId: true } : {}),
                bio: true,
                jobTitle: true,
                description: true,
                githubUrl: true,
                portfolioUrl: true,
                locationPreference: true,
                yearsOfExp: true,
                user: {
                    select: {
                        name: true,
                        isVerified: true,
                        createdAt: true,
                        ...(canViewPrivateData ? { id: true, email: true, isActive: true } : {}),
                    },
                },
                company: {
                    select: {
                        name: true,
                        logo: true,
                        isVerified: true,
                        ...(canViewPrivateData ? { id: true } : {}),
                    },
                },
            },
            take: limit,
            skip: (page - 1) * limit,
            orderBy: [orderBy, { id: "asc" }],
        }),
        prisma.recruiterProfile.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
        profiles,
        metadata: {
            currentPage: page,
            pageSize: limit,
            totalCount,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
        },
    };
};

export const getRecuiterProfile = async (userId) => {
    // let cachedData = null;

    // try {
    //     const rawData = await redis.get(`${recruiterProfileKey}:${userId}`);
    //     cachedData = rawData ? JSON.parse(rawData) : null;
    // } catch (error) {
    //     console.error("Redis parsing failed, falling back to DB:", error);
    // }

    // if (cachedData && Object.keys(cachedData).length > 0) {
    //     return cachedData;
    // };

    const profile = await prisma.recruiterProfile.findUnique({
        where: {
            userId
        },
        include: {
            company: true,
            resume: {
                select: { id: true, key: true, type: true, status: true },
            },
            recruiterHistory: {
                include: { company: { select: { id: true, name: true } } },
                orderBy: { startDate: "desc" },
            },
            user: {
                omit: {
                    password: true
                }
            },

        }
    })

    // if (profile) {
    //     try {
    //         await redis.set(`${recruiterProfileKey}:${userId}`, JSON.stringify(profile), 'EX', 500);

    //     } catch (error) {
    //         console.error("Failed to save to Redis cache:", error);
    //     }
    // }

    return profile
}

export const getRecruiterProfileDetail = async (viewerUserId, recruiterProfileId) => {
    const canViewPrivateData = Boolean(viewerUserId);
    const viewer = canViewPrivateData ? await prisma.recruiterProfile.findUnique({
        where: { userId: viewerUserId },
        select: { id: true, companyId: true, ownedCompany: { select: { id: true, isVerified: true } } },
    }) : null;

    if (canViewPrivateData && !viewer) throw new AppError("Create your recruiter profile first.", 404);
    if (canViewPrivateData && (!viewer.ownedCompany || !viewer.ownedCompany.isVerified)) throw new AppError("Only a verified company owner can explore recruiter profiles.", 403);

    const profile = await prisma.recruiterProfile.findUnique({
        where: { id: recruiterProfileId },
        select: {
            id: true,
            ...(canViewPrivateData ? { userId: true, companyId: true } : {}),
            bio: true,
            jobTitle: true,
            description: true,
            githubUrl: true,
            portfolioUrl: true,
            locationPreference: true,
            yearsOfExp: true,
            user: {
                select: {
                    name: true,
                    isVerified: true,
                    createdAt: true,
                    ...(canViewPrivateData ? { id: true, email: true, isActive: true } : {}),
                }
            },
            company: {
                select: {
                    name: true,
                    logo: true,
                    isVerified: true,
                    ...(canViewPrivateData ? { id: true } : {}),
                }
            },
            recruiterHistory: {
                orderBy: { startDate: "desc" },
                select: {
                    id: true,
                    roleTitle: true,
                    startDate: true,
                    endDate: true,
                    isCurrent: true,
                    description: true,
                    ...(canViewPrivateData ? { employmentType: true, salary: true, currency: true, isOwner: true } : {}),
                    company: { select: { name: true, ...(canViewPrivateData ? { id: true, logo: true } : {}) } },
                },
            },
        },
    });

    if (!profile || (viewerUserId && profile.userId === viewerUserId)) {
        throw new AppError("Recruiter profile not found.", 404);
    }
    return profile;
};

export const createRecuiterProfile = async (userId, data) => {
    const { yearsOfExp, bio, githubUrl, portfolioUrl, locationPreference, jobTitle, description } = data;

    const existingProfile = await prisma.recruiterProfile.findUnique({
        where: {
            userId
        }
    });

    if (existingProfile) {
        throw new AppError("Recuiter profile already exists for this user.", 403);
    }

    const profile = await prisma.recruiterProfile.create({
        data: {
            userId,
            locationPreference,
            bio,
            description,
            githubUrl,
            jobTitle,
            portfolioUrl,
            yearsOfExp
        }
    })

    return profile;
}

export const updateRecuiterProfile = async (userId, data) => {
    const { yearsOfExp, bio, githubUrl, portfolioUrl, locationPreference, jobTitle, description, tempKey } = data;

    const existingProfile = await prisma.recruiterProfile.findUnique({
        where: {
            userId
        }
    });

    if (!existingProfile) {
        throw new AppError("Recuiter profile is exist for this user.", 400);
    }


    if (tempKey) {
        checkTempKey(tempKey, userId);
    }

    const profile = await prisma.recruiterProfile.update({
        where: {
            userId
        },
        data: {
            locationPreference,
            bio,
            description,
            githubUrl,
            jobTitle,
            portfolioUrl,
            yearsOfExp
        }
    })

    if (tempKey) {
        await storageQueue.add(
            "storage",
            {
                tempKey,
                userId,
                fileType: "RESUME",
                model: "profile",
                recruiterProfileId: existingProfile.id,
            },
            { jobId: `storage-recruiter-profile-${existingProfile.id}-resume-${Date.now()}` }
        );
    }

    await redis.del(`${recruiterProfileKey}:${userId}`);

    return profile;
};

// Dashboard:

export const recruiterDashboard = async (userId, type) => {
    if (type === "CompanyRecuiter") {
        // 1. Fetch primary profile
        const profile = await prisma.recruiterProfile.findUnique({
            where: { userId },
            include: {
                user: {
                    select: { name: true },
                },
            },
        });

        if (!profile) {
            throw new AppError("Recruiter profile not found.", 404);
        }

        // 2. Fetch company
        const company = await prisma.company.findUnique({
            where: { id: profile?.companyId },
        });

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // 3. Execute all remaining read-only queries in parallel with Promise.all
        const [
            activeJobs,
            totalJobs,
            totalApplications,
            pendingApplications,
            reviewApplications,
            acceptedApplications,
            rejectedApplications,
            analyticsResult,
            recentApplications,
            recentActiveJobs,
            recentNotifications,
        ] = await Promise.all([
            prisma.job.count({
                where: { companyId: company?.id, status: "ACTIVE" },
            }),
            prisma.job.count({
                where: { companyId: company?.id },
            }),
            prisma.application.count({
                where: { job: { companyId: company?.id } },
            }),
            prisma.application.count({
                where: { job: { companyId: company?.id }, status: "PENDING" },
            }),
            prisma.application.count({
                where: { job: { companyId: company?.id }, status: "REVIEW" },
            }),
            prisma.application.count({
                where: { job: { companyId: company?.id }, status: "ACCEPTED" },
            }),
            prisma.application.count({
                where: { job: { companyId: company?.id }, status: "REJECTED" },
            }),
            prisma.$queryRaw`
        SELECT 
            TO_CHAR(a."createdAt", 'YYYY-MM-DD') AS date,
            COUNT(a.id)::int AS count
        FROM "Application" a
        INNER JOIN "Job" j ON a."jobId" = j.id  
        WHERE j."companyId" = ${company.id}
            AND a."createdAt" >= ${thirtyDaysAgo}
        GROUP BY TO_CHAR(a."createdAt", 'YYYY-MM-DD')
        ORDER BY date DESC
        `,
            prisma.application.findMany({
                where: { job: { companyId: company?.id } },
                include: {
                    job: {
                        select: {
                            id: true,
                            title: true,
                            currency: true,
                            description: true,
                            deadline: true,
                            createdAt: true,
                            maxSalary: true,
                            minSalary: true,
                            status: true,
                            skills: true,
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
                take: 5,
            }),
            prisma.job.findMany({
                where: { companyId: company?.id, status: "ACTIVE", deadline: { gt: new Date() }, },
                include: {
                    company: {
                        select: {
                            name: true,
                            description: true,
                            isVerified: true,
                            logo: true,
                        },
                    },
                    skills: true,
                },
                orderBy: { createdAt: "desc" },
                take: 5,
            }),
            prisma.notification.findMany({
                where: { recipientId: profile.userId },
                take: 5,
                orderBy: { createdAt: "desc" },
            }),
        ]);

        return {
            profile,
            company,
            stats: {
                totalJobs,
                activeJobs,
                totalApplications,
                pendingApplications,
                reviewApplications,
                acceptedApplications,
                rejectedApplications,
            },
            applicationAnalytics: {
                statusDistribution: {
                    pending: pendingApplications,
                    review: reviewApplications,
                    accepted: acceptedApplications,
                    rejected: rejectedApplications,
                },
                activity: analyticsResult,
            },
            recentApplications,
            recentActiveJobs,
            recentNotifications,
        };
    } else {
        const profile = await prisma.recruiterProfile.findUnique({
            where: { userId },
            include: {
                user: {
                    select: { name: true, email: true },
                },
                _count: {
                    select: {
                        recruiterHistory: true
                    }
                }
            },
        });

        if (!profile) {
            throw new AppError("Recruiter profile not found.", 404);
        }
        if (profile.companyId) {
            throw new AppError("You already attached to the company.", 404);
        }
        const checks = [
            { weight: 10, isComplete: Boolean(profile.bio?.trim()) },
            { weight: 10, isComplete: Boolean(profile.description?.trim()) },
            { weight: 15, isComplete: Boolean(profile.githubUrl) },
            { weight: 10, isComplete: Boolean(profile.portfolioUrl) },
            { weight: 20, isComplete: Boolean(profile.resumeId) },
            { weight: 10, isComplete: Boolean(profile.locationPreference) },
            { weight: 10, isComplete: profile.yearsOfExp !== null },
            { weight: 15, isComplete: profile._count.recruiterHistory > 0 },
        ];

        const completenessPercentage = checks.reduce(
            (score, item) => (item.isComplete ? score + item.weight : score),
            0
        );

        const [invitations, joinRequests, recommendedCompanies, notifications, pendingInvitations, pendingJoinRequests, availableCompanies] = await Promise.all([
            prisma.recruiterInvite.findMany({
                where: {
                    recruiterId: profile.id,
                    status: "PENDING"
                },
                include: {
                    company: true
                },
                orderBy: {
                    createdAt: "desc"
                },
                take: 3
            }),
            prisma.companyJoinRequest.findMany({
                where: {
                    recruiterId: profile.id,
                    status: "PENDING"
                },
                include: {
                    company: true
                },
                orderBy: {
                    createdAt: "desc"
                },
                take: 3
            }),
            prisma.company.findMany({
                where: {
                    isVerified: true
                },
                orderBy: {
                    jobs: {
                        _count: "desc"
                    }
                },
                take: 6
            }),
            prisma.notification.findMany({
                where: {
                    recipientId: userId
                },
                orderBy: {
                    createdAt: "desc"
                },
                take: 5
            }),
            prisma.recruiterInvite.count({ where: { recruiterId: profile.id, status: "PENDING" } }),
            prisma.companyJoinRequest.count({ where: { recruiterId: profile.id, status: "PENDING" } }),
            prisma.company.count({ where: { isVerified: true } }),
        ])

        return {
            profile: {
                ...profile,
                completenessPercentage,
            },
            invitations, joinRequests, recommendedCompanies, notifications, pendingInvitations, pendingJoinRequests, availableCompanies
        }
    }
};
