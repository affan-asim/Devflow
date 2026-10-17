import { PrismaClient } from "@/generated/prisma/client";
import { AppError } from "@/utils/AppError";
import { getRecuiterProfile } from "../profile/recuiterService";
import { cacheInvalidate, getCacheKey } from "@/utils/helper";
import { companyDetail, companyList, recruiterProfileKey } from "@/utils/redisKeyNames";
import Redis from "ioredis";
// import prisma from "@/utils/prisma";
const prisma = new PrismaClient()
const redis = new Redis();


export const getCompany = async (id, { isAdmin = false } = {}) => {
    // Keep the expanded admin payload in a separate cache namespace so it can
    // never be returned to a general company detail request.
    const cacheKey = `${companyDetail}:team-details-v2:${isAdmin ? "admin:" : ""}${id}`;
    let cachedData = null;

    try {
        const rawData = await redis.get(cacheKey);
        cachedData = rawData ? JSON.parse(rawData) : null;
    } catch (error) {
        console.error("Redis parsing failed, falling back to DB:", error);
    }

    if (cachedData && Object.keys(cachedData).length > 0) {
        return cachedData;
    };

    const company = await prisma.company.findUnique({
        where: { id },
        include: isAdmin ? {
            owner: {
                include: {
                    user: { select: { name: true, email: true } },
                },
            },
            recruiters: {
                include: {
                    user: { select: { name: true, email: true } },
                },
            },
            jobs: {
                select: { id: true, title: true, status: true, createdAt: true },
                orderBy: { createdAt: "desc" },
            },
            employmentHistory: {
                include: {
                    developer: {
                        include: {
                            user: { select: { name: true } },
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
            },
            recruiterHistory: {
                include: {
                    recruiter: {
                        include: {
                            user: { select: { name: true, email: true } },
                        },
                    },
                },
                orderBy: { startDate: "desc" },
            },
            _count: { select: { jobs: true } },
        } : {
            owner: true,
            recruiters: {
                include: {
                    user: { select: { name: true, email: true } },
                },
            },
            jobs: true,
            employmentHistory: {
                include: {
                    developer: {
                        include: {
                            user: { select: { name: true } },
                        },
                    },
                },
            },
            recruiterHistory: true,
        },
    });

    try {
        if (company) {
            await redis.set(cacheKey, JSON.stringify(company), 'EX', 600, 'NX');
        }

    } catch (error) {
        console.error("Failed to save to Redis cache:", error);
    }

    return company;
}

export const getCompanies = async (searchParams, searchParamsObject) => {
    const industry = searchParams.get("industry");
    const country = searchParams.get("country");
    const name = searchParams.get("name");
    const sort = searchParams.get("sort");
    const isVerified = searchParams.get("isVerified");

    const page = Number(searchParams.get("page") || 1);
    const pageSize = Number(searchParams.get("limit") || 10);

    const currentPage = Math.max(1, page);
    const limit = Math.max(1, pageSize);

    const where = {};

    if (isVerified === "true" || isVerified === "false") {
        where.isVerified = isVerified === "true"
    }

    if (name) {
        where.name = {
            contains: name,
            mode: 'insensitive'
        }
    };

    if (industry) {
        where.industry = industry
    }

    if (country) {
        where.country = country
    }

    let orderBy = {
        createdAt: "desc"
    }

    if (sort) {
        if (sort === "desc") {
            orderBy = {
                createdAt: "desc"
            }
        }

        if (sort === "asc") {
            orderBy = {
                createdAt: "asc"
            }
        }

        if (sort === "country") {
            orderBy = {
                country: "asc"
            }
        }
    }

    const cacheKey = await getCacheKey(companyList, searchParamsObject);

    let cachedData = null;

    try {
        const rawData = await redis.get(cacheKey);
        cachedData = rawData ? JSON.parse(rawData) : null;
    } catch (error) {
        console.error("Redis parsing failed, falling back to DB:", error);
    }

    if (cachedData && cachedData.comapanies && cachedData.metadata) {
        return {
            comapanies: cachedData.comapanies,
            metadata: cachedData.metadata
        };
    }

    const [comapanies, totalCount] = await prisma.$transaction([
        prisma.company.findMany({
            where,
            select:{
                country: true,
                createdAt: true,
                id: true,
                industry: true,
                isVerified: true,
                employmentHistory: true,
                name: true,
                logo: true,
                websiteUrl: true,
                ownerId: true,
                _count: {
                    select: {
                        jobs: true
                    }
                }
            },
            take: limit,
            skip: (currentPage - 1) * limit,
            orderBy
        }),
        prisma.company.count({
            where
        })
    ])

    const totalPages = Math.ceil(totalCount / limit);

    const metadata = {
        currentPage,
        pageSize: limit,
        totalCount,
        totalPages,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
    }

    const responseData = { comapanies, metadata };

    try {
        await redis.set(cacheKey, JSON.stringify(responseData), 'EX', 600, 'NX');

    } catch (error) {
        console.error("Failed to save to Redis cache:", error);
    }

    return responseData;
}

export const createCompany = async (userId, data) => {
    const { name, logo, websiteUrl, industry, country, roleTitle, description, salary, currency, employmentType } = data;

    const profile = await getRecuiterProfile(userId)

    if (!profile) {
        throw new AppError("You cannot create company, without creating the profile. Please create your profile first!", 404)
    }

    if (profile.companyId) {
        throw new AppError("You cannot create company, because you already in another company!", 403)
    }

    const alreadyOwned = await prisma.company.findFirst({
        where: {
            ownerId: profile.id
        }
    });

    if (alreadyOwned) {
        throw new AppError("You already own a company!", 403)
    }

    const companyExist = await prisma.company.findFirst({
        where: {
            OR: [
                { name },
                { websiteUrl }
            ]
        }
    })

    if (companyExist) {
        throw new AppError("You cannot create a duplicate company which is already exist", 400)
    }

    const comapany = await prisma.$transaction(async (tx) => {
        const companyCreated = await tx.company.create({
            data: {
                ownerId: profile.id,
                name,
                websiteUrl,
                industry,
                country,
                logo
            },
            include: {
                owner: true
            }
        })

        await tx.recruiterProfile.update({
            where: {
                id: profile.id
            },
            data: {
                companyId: companyCreated.id
            }
        })

        const recruiterHistory = await tx.recruiterHistory.create({
            data: {
                isOwner: true,
                companyId: companyCreated.id,
                startDate: new Date(),
                isCurrent: true,
                roleTitle,
                description,
                employmentType,
                salary,
                currency,
                recruiterProfileId: profile.id
            }
        })

        return {
            companyCreated,
            recruiterHistory
        };
    })

    await redis.del(`${recruiterProfileKey}:${userId}`);

    await cacheInvalidate(companyList)

    return comapany;
}

export const updateCompany = async (userId, data) => {
    const { name, logo, websiteUrl, industry, country } = data;

    const profile = await getRecuiterProfile(userId)

    const companyOwned = await prisma.company.findUnique({
        where: {
            ownerId: profile.id
        }
    });

    if (!companyOwned) {
        throw new AppError("Please update your owned company or create a new company")
    };

    const companyUnique = await prisma.company.findFirst({
        where: {
            OR: [
                { name },
                { websiteUrl }
            ],
            NOT: {
                id: companyOwned.id
            }
        }
    });

    if (companyUnique) {
        throw new AppError("Please change a name or websiteUrl and Provide a unique name and url")
    }

    const company = await prisma.company.update({
        where: {
            ownerId: profile.id
        },
        data: {
            name,
            websiteUrl,
            logo,
            industry,
            country
        }
    });

    await cacheInvalidate(companyList)
    await redis.del(`${companyDetail}:${company.id}`);
    await redis.del(`${companyDetail}:admin:${company.id}`);

    return company
}

export const updateCompanyStatus = async (id, data) => {
    const { isVerified } = data;

    const companyExist = await prisma.company.findUnique({
        where: {
            id
        }
    });

    if (!companyExist) {
        throw new AppError("Comapny is not exist!", 404)
    };

    const updateCompany = await prisma.company.update({
        where: {
            id: companyExist.id
        },
        data: {
            isVerified
        }
    });

    await cacheInvalidate(companyList)
    await redis.del(`${companyDetail}:${updateCompany.id}`);
    await redis.del(`${companyDetail}:admin:${updateCompany.id}`);

    return updateCompany;
}

export const updateCompanyVerification = async (companyId, isVerified) => {
    const company = await prisma.company.findUnique({
        where: { id: companyId },
        include: {
            owner: {
                include: {
                    user: {
                        select: { id: true, name: true, email: true },
                    },
                },
            },
        },
    });

    if (!company) {
        throw new AppError("Company not found", 404);
    }

    const updated = await prisma.company.update({
        where: { id: companyId },
        data: { isVerified },
    });

    const uuid = crypto.randomUUID();

    try {
        await notificationQueue.add("send-notification-event", {
            recipientId: company.owner.user.id,
            actionType: ActionType.COMPANY_VERIFIED,
            referenceType: ReferenceType.COMPANY,
            referenceId: company.id,
            message: isVerified
                ? `Congratulations! Your company "${company.name}" has been verified by an admin.`
                : `Notice: Verification status for "${company.name}" has been revoked.`,
        });

        await emailQueue.add("send-company-verification-email", {
            email: company.owner.user.email,
            name: company.owner.user.name,
            companyName: company.name,
            isVerified,
            uuid
        });
    } catch (queueError) {
        console.error("FAILED TO ENQUEUE VERIFICATION JOBS:", queueError);
    }

    return updated;
};
