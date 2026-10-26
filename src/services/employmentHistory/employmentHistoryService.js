import { PrismaClient } from "@/generated/prisma/client";
import { AppError } from "@/utils/AppError";
import { getRecuiterProfile } from "../profile/recuiterService";
import { getDeveloperProfile } from "../profile/developerService";
import { developerProfileKey } from "@/utils/redisKeyNames";
import { redis } from "@/lib/redis";
import prisma from "@/utils/prisma";


export const getEmploymentHistoryList = async (searchParams, userId) => {
    const employmentType = searchParams.get("employmentType");
    const companyId = searchParams.get("companyId");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort");

    const page = Number(searchParams.get("page") || 1);
    const pageSize = Number(searchParams.get("limit") || 10);

    const currentPage = Math.max(1, page);
    const limit = Math.max(1, pageSize);

    const profile = await getDeveloperProfile(userId)

    if (!profile) {
        throw new AppError("Create Your profile first!", 404)
    }

    const where = {
        devProfileId: profile.id
    };

    if (employmentType) {
        where.employmentType = employmentType
    }

    if (companyId) {
        where.companyId = companyId
    }

    if (search) {
        where.OR = [
            {
                OR: [
                    { roleTitle: { contains: search, mode: "insensitive" } },
                    { description: { contains: search, mode: "insensitive" } },
                    { currency: { equals: search } },
                ]
            }
        ]
    }

    let orderBy = {
        createdAt: "desc"
    };

    if (sort) {
        if (sort === "salary") {
            orderBy = {
                salary: "desc"
            }
        }

        if (sort === "startDate") {
            orderBy = {
                startDate: "asc"
            }
        }

        if (sort === "endDate") {
            orderBy = {
                endDate: "desc"
            }
        }
    };

    const [employments, totalCount] = await prisma.$transaction([
        prisma.employmentHistory.findMany({
            where,
            take: limit,
            skip: (currentPage - 1) * limit,
            orderBy,
            include: {
                employmentEvents: {
                    select: {
                        status: true,
                        type: true,
                        id: true
                    }
                },
                company: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        country: true,
                        industry: true,
                        logo: true,
                        isVerified: true,
                        websiteUrl: true,
                    }
                },
                hiredByRecruiter: {
                    select: {
                        id: true,
                        user: {
                            select: {
                                id: true,
                                name: true,
                            }
                        }
                    }
                }
            },
        }),
        prisma.employmentHistory.count({
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

    return {
        employments,
        metadata
    }
};

export const getEmploymentHistoryListRecruiter = async (searchParams, userId) => {
    const employmentType = searchParams.get("employmentType");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort");

    const page = Number(searchParams.get("page") || 1);
    const pageSize = Number(searchParams.get("limit") || 10);

    const currentPage = Math.max(1, page);
    const limit = Math.max(1, pageSize);

    const profile = await getRecuiterProfile(userId)

    if (!profile) {
        throw new AppError("Create Your profile first!", 404)
    }

    const company = await prisma.company.findUnique({
        where: {
            id: profile.companyId,
            isVerified: true
        }
    });

    if (!company) {
        throw new AppError("Company is not exist or verified!", 404)
    }

    const where = {
        companyId: company.id,
        isCurrent: true,
    };

    if (employmentType) {
        where.employmentType = employmentType
    }

    if (search) {
        where.OR = [
            {
                OR: [
                    { roleTitle: { contains: search, mode: "insensitive" } },
                    { description: { contains: search, mode: "insensitive" } },
                    { currency: { equals: search } },
                ]
            }
        ]
    }

    let orderBy;

    if (sort) {
        if (sort === "salary") {
            orderBy = {
                salary: "desc"
            }
        }

        if (sort === "startDate") {
            orderBy = {
                startDate: "asc"
            }
        }

        if (sort === "endDate") {
            orderBy = {
                endDate: "desc"
            }
        }
    };

    const [employments, totalCount] = await prisma.$transaction([
        prisma.employmentHistory.findMany({
            where,
            take: limit,
            skip: (currentPage - 1) * limit,
            orderBy,
            include: {
                developer: {
                    select: {
                        id: true,
                        userId: true,
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
                employmentEvents: {
                    select: {
                        id: true,
                        type: true,
                        status: true,
                    },
                },
            },
        }),
        prisma.employmentHistory.count({
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

    return {
        employments,
        metadata
    }
};

export const getEmploymentHistory = async (id, userId) => {
    const profile = await getDeveloperProfile(userId)

    if (!profile) {
        throw new AppError("Create Your profile first!", 404)
    }

    const history = await prisma.employmentHistory.findUnique({
        where: {
            id,
            devProfileId: profile.id
        },
        include: {
            employmentEvents: {
                select: {
                    id: true,
                    type: true,
                    status: true,
                    createdAt: true,
                },
                orderBy: {
                    createdAt: "asc",
                },
            },
            hiredByRecruiter: true,
            company: {
                select: {
                    id: true,
                    name: true,
                    description: true,
                    country: true,
                    industry: true,
                    logo: true,
                    isVerified: true,
                    websiteUrl: true,
                },
            },
            developer: {
                select: {
                    id: true,
                    bio: true,
                    portfolioUrl: true,
                    locationPreference: true,
                    skills: {
                        select: {
                            id: true,
                            name: true,
                            category: true,
                        }
                    }
                }
            }
        },
    });

    return history;
};

export const getEmploymentHistoryRecuiter = async (id, userId) => {
    const profile = await getRecuiterProfile(userId);

    if (!profile) {
        throw new AppError("Recruiter profile does not exist!", 404);
    }

    const company = await prisma.company.findUnique({
        where: {
            id: profile.companyId,
        },
        select: {
            id: true,
            name: true,
            description: true,
            country: true,
            industry: true,
            logo: true,
            isVerified: true,
            websiteUrl: true,
        },
    });

    if (!company || !company.isVerified) {
        throw new AppError(
            "Company does not exist or is not verified!",
            404
        );
    }

    const history = await prisma.employmentHistory.findFirst({
        where: {
            id,
            companyId: company.id,
        },
        include: {
            developer: {
                select: {
                    id: true,
                    userId: true,
                    bio: true,
                    portfolioUrl: true,
                    githubUrl: true,
                    locationPreference: true,
                    yearsOfExp: true,

                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },

                    skills: {
                        select: {
                            id: true,
                            name: true,
                            category: true,
                        },
                    },
                },
            },

            hiredByRecruiter: {
                select: {
                    id: true,
                    userId: true,
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            },

            company: {
                select: {
                    id: true,
                    name: true,
                    description: true,
                    country: true,
                    industry: true,
                    logo: true,
                    isVerified: true,
                    websiteUrl: true,
                },
            },

            employmentEvents: {
                orderBy: {
                    createdAt: "desc",
                },
                include: {
                    approvedBy: {
                        select: {
                            id: true,
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    if (!history) {
        throw new AppError(
            "Employment history not found or does not belong to your company!",
            404
        );
    }

    return history;
};

export const updateEmploymentHistory = async (id, userId, data) => {
    const { roleTitle, description, salary, currency, employmentType } = data;

    const profile = await getRecuiterProfile(userId)

    if (!profile) {
        throw new AppError("Create Your profile first!", 404)
    }

    const company = await prisma.company.findUnique({
        where: {
            id: profile.companyId,
            isVerified: true
        }
    });

    if (!company) {
        throw new AppError("Company is not exist or verified!", 404)
    }

    const existingHistory = await prisma.employmentHistory.findFirst({
        where: {
            id,
            companyId: profile.companyId,
            isCurrent: true
        }
    });

    if (!existingHistory) {
        throw new AppError("Recruiter history record not found or they already leave the company!", 404);
    }

    const updateHistory = await prisma.employmentHistory.update({
        where: {
            id: existingHistory.id
        },
        data: {
            roleTitle,
            description,
            salary,
            currency,
            employmentType
        }
    });

    await redis.del(`${developerProfileKey}:${userId}`);

    return updateHistory;
};

