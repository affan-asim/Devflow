import { PrismaClient } from "@/generated/prisma/client";
import { AppError } from "@/utils/AppError";
import { getRecuiterProfile } from "../profile/recuiterService";
import { InviteStatus } from "@/generated/prisma/client";
import { ActionType } from "@/generated/prisma/client";
import { ReferenceType } from "@/generated/prisma/client";
import { emailQueue } from "@/lib/queues/email.queue";
import { notificationQueue } from "@/lib/queues/notification.queue";
import crypto from "crypto";
import { redis } from "@/lib/redis";
import { userKey } from "@/utils/redisKeyNames";

import prisma from "@/utils/prisma";
export const getRecruiterHistory = async (searchParams, userId) => {
    const employmentType = searchParams.get("employmentType");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort");

    const page = Number(searchParams.get("page") || 1);
    const pageSize = Number(searchParams.get("limit") || 10);

    const currentPage = Math.max(1, page);
    const limit = Math.max(1, pageSize);

    const profile = await getRecuiterProfile(userId);

    if (!profile) {
        throw new AppError("Create Your profile first!", 404);
    }

    // Independent recruiters see their own employment history. Company
    // affiliated recruiters continue through the company owner path below.
    if (!profile.companyId) {
        const where = { recruiterProfileId: profile.id };

        if (employmentType) where.employmentType = employmentType;
        if (search?.trim()) {
            const term = search.trim();
            where.OR = [
                { roleTitle: { contains: term, mode: "insensitive" } },
                { description: { contains: term, mode: "insensitive" } },
                { company: { name: { contains: term, mode: "insensitive" } } },
                { company: { country: { contains: term, mode: "insensitive" } } },
            ];
        }

        const status = searchParams.get("status");
        if (status === "current") where.isCurrent = true;
        if (status === "former") where.isCurrent = false;

        const orderBy = sort === "oldest"
            ? { startDate: "asc" }
            : sort === "salary"
                ? { salary: "desc" }
                : sort === "startDate"
                    ? { startDate: "asc" }
                    : sort === "endDate"
                        ? { endDate: "desc" }
                        : { startDate: "desc" };

        const [employments, totalCount] = await prisma.$transaction([
            prisma.recruiterHistory.findMany({
                where,
                take: limit,
                skip: (currentPage - 1) * limit,
                orderBy,
                include: {
                    company: {
                        select: { id: true, name: true, country: true, logo: true },
                    },
                    recruiterEvents: {
                        orderBy: { createdAt: "desc" },
                        take: 1,
                    },
                },
            }),
            prisma.recruiterHistory.count({ where }),
        ]);

        const totalPages = Math.ceil(totalCount / limit);
        return {
            employments,
            metadata: {
                currentPage,
                pageSize: limit,
                totalCount,
                totalPages,
                hasNextPage: currentPage < totalPages,
                hasPreviousPage: currentPage > 1,
            },
        };
    }

    const company = await prisma.company.findUnique({
        where: {
            id: profile.companyId,
            isVerified: true,
        },
        select: {
            id: true,
            ownerId: true,
        },
    });

    if (!company) {
        throw new AppError("Company is not exist or not verified!", 404);
    }

    if (company.ownerId !== profile.id) {
        throw new AppError("Only company owner can manage recruiter history.", 403);
    }

    const where = {
        companyId: profile.companyId,
        recruiter: {
            id: {
                not: profile.id
            }
        },
        isCurrent:true
    };

    if (employmentType) {
        where.employmentType = employmentType;
    }

    if (search?.trim()) {
        const term = search.trim();
        where.OR = [
            { roleTitle: { contains: term, mode: "insensitive" } },
            { description: { contains: term, mode: "insensitive" } },
            { recruiter: { user: { name: { contains: term, mode: "insensitive" } } } },
            { recruiter: { user: { email: { contains: term, mode: "insensitive" } } } },
        ];
    }

    let orderBy;

    if (sort) {
        if (sort === "salary") {
            orderBy = {
                salary: "desc"
            };
        }

        if (sort === "startDate") {
            orderBy = {
                startDate: "asc"
            };
        }

        if (sort === "endDate") {
            orderBy = {
                endDate: "desc"
            };
        }
    }

    const [employments, totalCount] = await prisma.$transaction([
        prisma.recruiterHistory.findMany({
            where,
            take: limit,
            skip: (currentPage - 1) * limit,
            orderBy,
            include: {
                recruiter: {
                    select: {
                        id: true,
                        jobTitle: true,
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                isActive: true,
                                isVerified: true,
                            },
                        },
                    },
                },
                recruiterEvents: {
                    orderBy: {
                        createdAt: "desc",
                    },
                    take: 1,
                },
            }
        }),
        prisma.recruiterHistory.count({
            where
        })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    const metadata = {
        currentPage,
        pageSize: limit,
        totalCount,
        totalPages,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
    };

    return {
        employments,
        metadata
    };
};

export const getRecruiterHistoryDetail = async (userId, id) => {
    const profile = await getRecuiterProfile(userId);

    if (!profile) {
        throw new AppError("Create Your profile first!", 404);
    }

    const history = await prisma.recruiterHistory.findUnique({
        where: {
            id,
            ...(profile?.companyId ? { companyId: profile.companyId } : { recruiterProfileId: profile.id }),
        },
        include: {
            recruiter: {
                select: {
                    id: true,
                    jobTitle: true,

                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            isActive: true,
                            isVerified: true,
                        },
                    },
                },
            },

            company: {
                select: {
                    id: true,
                    name: true,
                    logo: true,
                    industry: true,
                    country: true,
                    websiteUrl: true,
                    isVerified: true,
                },
            },

            recruiterEvents: {
                orderBy: {
                    createdAt: "desc",
                },
            },
        }
    });

    return history;
};

export const updateRecruiterEmploymentHistory = async (id, userId, data) => {
    const { roleTitle, description, salary, currency, employmentType } = data;

    const profile = await getRecuiterProfile(userId);

    if (!profile) {
        throw new AppError("Create Your profile first!", 404);
    }

    const company = await prisma.company.findUnique({
        where: {
            id: profile.companyId,
            isVerified: true
        }
    });

    if (!company) {
        throw new AppError("Company is not exist or verified!", 404);
    }

    if (company.ownerId !== profile.id) {
        throw new AppError("Only company owner can update recruiter history!", 403);
    }

    const existingHistory = await prisma.recruiterHistory.findFirst({
        where: {
            id,
            companyId: profile.companyId,
            isCurrent: true
        }
    });

    if (!existingHistory) {
        throw new AppError("Recruiter history record not found or they already leave the company!", 404);
    }

    const updateHistory = await prisma.recruiterHistory.update({
        where: { id: existingHistory.id },
        data: {
            roleTitle,
            description,
            salary,
            currency,
            employmentType
        }
    });

    return updateHistory;
};

export const updateRecruiterEmploymentEvent = async (userId, data, role, id) => {
    const { reason, letterUrl } = data;

    const profile = await getRecuiterProfile(userId);

    if (!profile) {
        throw new App("Profile is not exist!", 404);
    }

    const company = await prisma.company.findUnique({
        where: {
            id
        }
    });

    if (!company) {
        throw new App("Company is not exist!", 404);
    }

    let isOwner = false;

    if (company.ownerId === profile.id) {
        isOwner = true;
    }

    if (!isOwner) {
        const history = await prisma.recruiterHistory.findFirst({
            where: {
                id,
                recruiterProfileId: profile.id,
                isCurrent: true,
                companyId: profile.companyId
            }
        });

        if (!history) {
            throw new App("Employment history not found or you already leave the company!", 404);
        }

        const update = await prisma.recruiterEvent.update({
            where: {
                recruiterHistoryId: history.id
            },
            data: {
                reason,
                letterUrl
            }
        });

        return update;
    }

    if (isOwner) {
        const historyExist = await prisma.recruiterHistory.findFirst({
            where: {
                id,
                companyId: profile.companyId,
                isCurrent: true,
                isOwner: true
            }
        });

        if (!historyExist) {
            throw new App("Employment history not found, only owner can change recruiter employment history!", 404);
        }

        const res = await prisma.$transaction(async (tx) => {
            const update = await tx.recruiterEvent.update({
                where: {
                    employmentHistoryId: historyExist.id
                },
                data: {
                    reason,
                    letterUrl,
                    status: "ACCEPTED",
                    approvedByRecruiterId: profile.id
                }
            });

            const history = await tx.recruiterHistory.update({
                where: {
                    id: historyExist.id
                },
                data: {
                    isCurrent: false,
                    endDate: new Date(),
                }
            });

            await tx.recruiterProfile.update({
                where: {
                    id: history.recruiterProfileId
                },
                data: {
                    companyId: null
                }
            });

            return {
                update,
                history
            };
        });

        return res;
    }
};

// ================================================

export const createInvitation = async (userId, data) => {
    const { roleTitle, description, currency, salary, employmentType, email } = data;
    const invitedEmail = email.trim().toLowerCase();

    const profile = await getRecuiterProfile(userId);

    if (!profile) {
        throw new AppError("Create Your profile first!", 404);
    }

    const company = await prisma.company.findUnique({
        where: {
            id: profile.companyId,
            isVerified: true
        }
    });

    if (!company) {
        throw new AppError("Company is not exist or verified!", 404);
    }

    if (company.ownerId !== profile.id) {
        throw new AppError("Only company owner can send invitation!", 403);
    }

    const user = await prisma.user.findUnique({
        where: {
            email: invitedEmail
        },
        include: {
            recruiterProfile: true
        }
    });

    if (user?.recruiterProfile?.companyId) {
        throw new AppError("Recruiter is already attached to another email!", 403);
    }

    const invitationExist = await prisma.recruiterInvite.findFirst({
        where: {
            invitedEmail,
            invitedByRecruiterId: profile.id,
            status: InviteStatus.PENDING,
        }
    });

    if (invitationExist) {
        throw new AppError("You already send an invitation to this recruiter!", 403);
    }

    const invitation = await prisma.recruiterInvite.create({
        data: {
            companyId: profile.companyId,
            ...(user?.recruiterProfile?.id && { recruiterId: user.recruiterProfile.id }),
            invitedByRecruiterId: profile.id,
            invitedEmail,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            roleTitle,
            employmentType,
            currency,
            salary,
            description,
        },
        include: {
            company: true,
            invitedBy: {
                include: {
                    user: true
                }
            }
        }
    });

    try {
        const notificationId = crypto.randomUUID();
        await notificationQueue.add("recruiter-invited", {
            id: notificationId,
            message: `${invitation.company.name} Company invited you. Check your email for further details`,
            ...(user?.id && { recipientId: user.id }),
            referenceId: invitation.id,
            actionType: ActionType.RECRUITER_INVITED,
            referenceType: ReferenceType.INVITE
        }, {
            jobId: notificationId
        });
    } catch (error) {
        console.log("Bullmq error:", error);
    }

    const uuid = crypto.randomUUID();

    await emailQueue.add("invitation-email", { email: invitedEmail, name: user?.name, invitation, uuid }, { jobId: uuid });

    return invitation;
};

export const getCompanyRecruiterInvitations = async (userId, searchParams) => {
    const type = searchParams.get("type");
    const profile = await getRecuiterProfile(userId);
    if (!profile) throw new AppError("Create your recruiter profile first.", 404);

    const page = Number(searchParams.get("page") || 1);
    const requestedLimit = Number(searchParams.get("limit") || 10);
    if (!Number.isInteger(page) || page < 1) throw new AppError("page must be a positive integer.", 400);
    if (!Number.isInteger(requestedLimit) || requestedLimit < 1) throw new AppError("limit must be a positive integer.", 400);

    const limit = Math.min(requestedLimit, 100);
    const status = searchParams.get("status");
    const search = searchParams.get("search")?.trim();
    const where = { ...(type === "company" ? { companyId: profile.companyId } : { recruiterId: profile.id }) };

    if (status) {
        if (!Object.values(InviteStatus).includes(status)) throw new AppError("Invalid invitation status.", 400);
        where.status = status;
    }
    if (search) {
        where.OR = [
            { invitedEmail: { contains: search, mode: "insensitive" } },
            { roleTitle: { contains: search, mode: "insensitive" } },
        ];
    }

    // Read the invite rows without Prisma relation includes. Build the related response
    // fields from separate lookups to avoid relation-include errors from the client.
    const [invitationRows, totalCount] = await prisma.$transaction([
        prisma.recruiterInvite.findMany({
            where,
            take: limit,
            skip: (page - 1) * limit,
            orderBy: [{ createdAt: "desc" }, { id: "asc" }],
        }),
        prisma.recruiterInvite.count({ where }),
    ]);

    const recruiterIds = [...new Set(invitationRows.flatMap((invitation) =>
        [invitation.recruiterId, invitation.invitedByRecruiterId].filter(Boolean)
    ))];
    const [company, recruiters] = await Promise.all([
        type === "company" ? await prisma.company.findUnique({
            where: { id: profile.companyId },
            select: {
                id: true,
                name: true,
                logo: true,
                isVerified: true,
                industry: true,
                country: true,
            },
        })
            : null,
        recruiterIds.length
            ? prisma.recruiterProfile.findMany({
                where: { id: { in: recruiterIds } },
                select: { id: true, userId: true },
            })
            : Promise.resolve([]),
    ]);

    const userIds = [...new Set(recruiters.map(({ userId }) => userId))];
    const users = userIds.length
        ? await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, name: true, email: true },
        })
        : [];
    const usersById = new Map(users.map((user) => [user.id, user]));
    const recruitersById = new Map(recruiters.map((recruiter) => [
        recruiter.id,
        { id: recruiter.id, user: usersById.get(recruiter.userId) || null },
    ]));

    const invitations = invitationRows.map((invitation) => ({
        ...invitation,
        company,
        recruiter: invitation.recruiterId ? recruitersById.get(invitation.recruiterId) || null : null,
        invitedBy: recruitersById.get(invitation.invitedByRecruiterId) || null,
    }));

    const totalPages = Math.ceil(totalCount / limit);
    return {
        invitations,
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

export const getRecruiterInvitationDetail = async (userId, id) => {
    const profile = await getRecuiterProfile(userId);

    if (!profile) {
        throw new AppError(
            "Create your recruiter profile first.",
            404
        );
    }

    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            email: true,
        },
    });

    const invitation = await prisma.recruiterInvite.findFirst({
        where: {
            id,

            OR: [
                ...(profile.companyId
                    ? [{ companyId: profile.companyId }]
                    : []),

                {
                    recruiterId: profile.id,
                },

                ...(user?.email
                    ? [
                        {
                            invitedEmail: {
                                equals: user.email,
                                mode: "insensitive",
                            },
                        },
                    ]
                    : []),
            ],
        },

        include: {
            company: {
                select: {
                    id: true,
                    name: true,
                    logo: true,
                    isVerified: true,
                    industry: true,
                    country: true,
                    websiteUrl: true,
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

            invitedBy: {
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
    });

    if (!invitation) {
        throw new AppError(
            "Invitation not found.",
            404
        );
    }

    return invitation;
};

/** Link pending external invitations to the authenticated recruiter's profile. */
export const claimExternalRecruiterInvitations = async (userId) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            email: true,
            recruiterProfile: { select: { id: true } },
        },
    });

    if (!user) {
        throw new AppError("User not found.", 404);
    }
    if (!user.recruiterProfile) {
        throw new AppError("Create your recruiter profile first.", 404);
    }

    const now = new Date();
    return prisma.$transaction(async (tx) => {
        const matchingInvitations = await tx.recruiterInvite.findMany({
            where: {
                invitedEmail: user.email,
                recruiterId: null,
                status: InviteStatus.PENDING,
                expiresAt: { gt: now },
            },
            select: { id: true },
        });

        if (matchingInvitations.length === 0) return [];

        const ids = matchingInvitations.map(({ id }) => id);
        await tx.recruiterInvite.updateMany({
            where: {
                id: { in: ids },
                recruiterId: null,
                status: InviteStatus.PENDING,
                expiresAt: { gt: now },
            },
            data: { recruiterId: user.recruiterProfile.id },
        });

        return tx.recruiterInvite.findMany({
            where: {
                id: { in: ids },
                recruiterId: user.recruiterProfile.id,
            },
            include: {
                company: { select: { id: true, name: true, logo: true } },
            },
            orderBy: { createdAt: "desc" },
        });
    });
};

export const recievedInvitation = async (userId, data, id) => {
    const { status } = data;

    const profile = await getRecuiterProfile(userId);

    if (!profile) {
        throw new AppError("Create Your profile first!", 404);
    }

    if (profile.companyId) {
        throw new AppError("You already attached to company!", 403);
    }

    const invitation = await prisma.recruiterInvite.findUnique({
        where: {
            id
        }
    });

    if (!invitation) {
        throw new AppError("Invitation is not existed!", 404);
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, name: true },
    });

    if (!user || invitation.invitedEmail.toLowerCase() !== user.email.toLowerCase()) {
        throw new AppError("This invitation is not addressed to your account.", 403);
    }

    if (invitation.recruiterId && invitation.recruiterId !== profile.id) {
        throw new AppError("This invitation is linked to another recruiter account.", 403);
    }

    if (invitation.status !== InviteStatus.PENDING) {
        throw new AppError("This invitation is no longer pending.", 409);
    }

    const company = await prisma.company.findUnique({
        where: {
            id: invitation.companyId,
            isVerified: true
        },
        include: {
            owner: {
                select: { userId: true, user: { select: { email: true, name: true } } },
            },
        },
    });

    if (!company) {
        throw new AppError("Company is not existed or is not verified!", 403);
    }

    if (invitation.expiresAt <= new Date()) {
        await prisma.recruiterInvite.update({
            where: {
                id
            },
            data: {
                status: InviteStatus.EXPIRED
            }
        });

        throw new AppError("Invitation is exipred!", 403);
    }

    if (!invitation.recruiterId) {
        const { count } = await prisma.recruiterInvite.updateMany({
            where: {
                id,
                recruiterId: null,
                invitedEmail: user.email,
                status: InviteStatus.PENDING,
                expiresAt: { gt: new Date() },
            },
            data: { recruiterId: profile.id },
        });

        if (count !== 1) {
            throw new AppError("This invitation could not be linked to your recruiter profile.", 409);
        }
        invitation.recruiterId = profile.id;
    }

    if (status === InviteStatus.REJECTED) {
        const updateInvitation = await prisma.recruiterInvite.update({
            where: {
                id
            },
            data: {
                status
            }
        });

        try {
            const jobId = crypto.randomUUID();
            await emailQueue.add("recruiter-invite-status-email", {
                email: company.owner.user.email,
                ownerName: company.owner.user.name,
                recruiterName: user.name,
                companyName: company.name,
                roleTitle: invitation.roleTitle,
                status,
                uuid: jobId,
            }, { jobId });
        } catch (error) {
            console.error("Failed to queue recruiter invitation status email:", error);
        }

        try {
            const notificationId = crypto.randomUUID();
            await notificationQueue.add("invitation-rejected", {
                id: notificationId,
                message: `Recruiter rejected invitation.`,
                recipientId: company.owner.userId,
                referenceId: invitation.id,
                actionType: ActionType.RECRUITER_INVITED,
                referenceType: ReferenceType.INVITE
            });
        } catch (error) {
            console.log("Bullmq error:", error);
        }

        return updateInvitation;
    }

    if (status === InviteStatus.ACCEPTED) {
        const updateInvitation = await prisma.$transaction(async (tx) => {
            const { count } = await tx.recruiterInvite.updateMany({
                where: { id, recruiterId: profile.id, status: InviteStatus.PENDING },
                data: {
                    status
                }
            });

            if (count !== 1) {
                throw new AppError("This invitation has already been processed.", 409);
            }

            const invitation = await tx.recruiterInvite.findUniqueOrThrow({ where: { id } });

            await tx.recruiterProfile.update({
                where: {
                    id: invitation.recruiterId,
                },
                data: {
                    companyId: invitation.companyId
                }
            });

            await tx.recruiterHistory.create({
                data: {
                    roleTitle: invitation.roleTitle,
                    description: invitation.description,
                    currency: invitation.currency,
                    employmentType: invitation.employmentType,
                    salary: invitation.salary,
                    companyId: invitation.companyId,
                    isCurrent: true,
                    startDate: new Date(),
                    recruiterProfileId: profile.id
                }
            });

            try {
                const notificationId = crypto.randomUUID();
                await notificationQueue.add("invitation-accepted", {
                    id: notificationId,
                    message: `Recruiter approved invitation.`,
                    recipientId: company.owner.userId,
                    referenceId: invitation.id,
                    actionType: ActionType.RECRUITER_INVITED,
                    referenceType: ReferenceType.INVITE
                });
            } catch (error) {
                console.log("Bullmq error:", error);
            }

            return invitation;
        });

        // Invalidate the cached /api/auth/me response so the recruiter's
        // updated companyId is reflected immediately on next request.
        try {
            await redis.del(`${userKey}:${userId}`);
        } catch (cacheError) {
            console.error("Failed to invalidate user cache after invitation accept:", cacheError);
        }

        try {
            const jobId = crypto.randomUUID();
            await emailQueue.add("recruiter-invite-status-email", {
                email: company.owner.user.email,
                ownerName: company.owner.user.name,
                recruiterName: user.name,
                companyName: company.name,
                roleTitle: invitation.roleTitle,
                status,
                uuid: jobId,
            }, { jobId });
        } catch (error) {
            console.error("Failed to queue recruiter invitation status email:", error);
        }

        return updateInvitation;
    }
};
