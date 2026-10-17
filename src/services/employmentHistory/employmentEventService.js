import { ROLE } from "@/generated/prisma/client";
import { PrismaClient } from "@/generated/prisma/client";
import { AppError } from "@/utils/AppError";
import { getDeveloperProfile } from "../profile/developerService";
import { getRecuiterProfile } from "../profile/recuiterService";
import { LeaveStatus } from "@/generated/prisma/client";
import { ActionType } from "@/generated/prisma/client";
import { ReferenceType } from "@/generated/prisma/client";
import { notificationQueue } from "@/lib/queues/notification.queue";
import { emailQueue } from "@/lib/queues/email.queue";
import { checkTempKey, generatePresignedGetUrl, promoteTempFileToPermanent } from "@/services/presignedUrl/presignedUrl";
import crypto from "crypto";

import prisma from "@/utils/prisma";

export const updateEmploymentEvent = async (userId, data, role, id) => {
    const { reason, letterUrl, status } = data;

    if (role === ROLE.DEVELOPER) {
        const profile = await getDeveloperProfile(userId);

        if (!profile) {
            throw new AppError("Profile is not exist!", 404)
        }

        const history = await prisma.employmentHistory.findFirst({
            where: {
                id,
                devProfileId: profile.id,
                isCurrent: true
            }
        });

        if (!history) {
            throw new AppError("Empployment history not found or you already leave the company!", 404)
        };

        const update = await prisma.employementEvent.create({
            data: {
                reason,
                letterUrl,
                type: "RESIGN",
                employmentHistoryId: history.id
            },
            include: {
                employmentHistory: {
                    include: {
                        hiredByRecruiter: true,
                        company: { include: { owner: { include: { user: true } } } },
                        developer: { include: { user: true } },
                    }
                }
            }
        });

        try {
            const notificationId = crypto.randomUUID();
            await notificationQueue.add("resignation-submitted", {
                id: notificationId,
                message: `Developer submitted resignation.`,
                recipientId: update.employmentHistory.hiredByRecruiter.userId,
                referenceId: history.id,
                actionType: ActionType.EMPLOYMENT_RESIGNED,
                referenceType: ReferenceType.EMPLOYMENT_EVENT
            }, {
                jobId: notificationId
            });

        } catch (error) {
            console.log("Bullmq error:", error);
        }

        try {
            const uuid = crypto.randomUUID();
            await emailQueue.add("employment-event-email", {
                uuid,
                email: update.employmentHistory.company.owner.user.email,
                recipientName: update.employmentHistory.company.owner.user.name,
                subjectName: update.employmentHistory.developer.user.name,
                companyName: update.employmentHistory.company.name,
                eventType: "resigned",
                reason,
            }, { jobId: uuid });
        } catch (error) {
            console.error("Failed to queue developer resignation email:", error);
        }

        return update;
    };

    if (role === ROLE.RECRUITER) {
        const profile = await getRecuiterProfile(userId);

        if (!profile) {
            throw new AppError("Profile is not exist!", 404)
        }

        const company = await prisma.company.findUnique({
            where: {
                id: profile.companyId,
                isVerified: true
            }
        });

        if (!company) {
            throw new AppError("Company is not exist or not verified!", 404)
        };

        const historyExist = await prisma.employmentHistory.findFirst({
            where: {
                id,
                companyId: profile.companyId,
                isCurrent: true
            },
            include: {
                employmentEvents: true
            }
        });

        if (!historyExist) {
            throw new AppError("Employment history not found or the developer already leave the company!", 404)
        }

        let persistedLetterUrl = letterUrl;
        if (letterUrl) {
            checkTempKey(letterUrl, userId);
            const file = await prisma.file.findUnique({ where: { key: letterUrl } });

            if (!file || file.userId !== userId || file.status !== "TEMP" || file.type !== "COVER_LETTER") {
                throw new AppError("Uploaded letter is invalid or unavailable.", 400);
            }

            const permanentKey = await promoteTempFileToPermanent(letterUrl, userId, "COVER_LETTER");
            await prisma.file.update({
                where: { key: letterUrl },
                data: { key: permanentKey, status: "PERMANENT" },
            });
            persistedLetterUrl = permanentKey;
        }

        const pendingEvent = historyExist.employmentEvents.find((event) => event.status === "PENDING")

        if (!pendingEvent) {
            const res = await prisma.$transaction(async (tx) => {
                const employmentEvent = await tx.employementEvent.create({
                    data: {
                        reason,
                        letterUrl: persistedLetterUrl,
                        status: "ACCEPTED",
                        approvedByRecruiterId: profile.id,
                        type: "TERMINATE",
                        employmentHistoryId: historyExist.id
                    }
                });

                const employmentHistory = await tx.employmentHistory.update({
                    where: {
                        id: historyExist.id
                    },
                    data: {
                        isCurrent: false,
                        endDate: new Date()
                    },
                    include: {
                        developer: { include: { user: true } },
                        company: true,
                    }
                });

                return {
                    employmentEvent,
                    employmentHistory
                };
            });

            try {
                const notificationId = crypto.randomUUID();
                await notificationQueue.add("terminated-submitted", {
                    id: notificationId,
                    message: `You were terminated from company.`,
                    recipientId: res.employmentHistory.developer.userId,
                    referenceId: res.employmentEvent.id,
                    actionType: ActionType.EMPLOYMENT_TERMINATED,
                    referenceType: ReferenceType.EMPLOYMENT_EVENT
                }, { jobId: notificationId });
            } catch (error) {
                console.log("Bullmq error:", error);
            }

            try {
                const uuid = crypto.randomUUID();
                const letterDownloadUrl = persistedLetterUrl
                    ? await generatePresignedGetUrl(persistedLetterUrl, 60 * 60 * 24 * 7)
                    : null;
                await emailQueue.add("employment-event-email", {
                    uuid,
                    email: res.employmentHistory.developer.user.email,
                    recipientName: res.employmentHistory.developer.user.name,
                    subjectName: res.employmentHistory.developer.user.name,
                    companyName: res.employmentHistory.company.name,
                    eventType: "terminated",
                    reason,
                    letterUrl: letterDownloadUrl,
                }, { jobId: uuid });
            } catch (error) {
                console.error("Failed to queue developer termination email:", error);
            }

            return res;
        } else {
            const res = await prisma.$transaction(async (tx) => {
                const updatedEvent = await tx.employementEvent.update({
                    where: {
                        id: pendingEvent.id
                    },
                    data: {
                        status,
                        ...(status === "ACCEPTED" && { approvedByRecruiterId: profile.id }),
                    }
                });

                let employmentHistory;

                if (status === "ACCEPTED") {
                    employmentHistory = await tx.employmentHistory.update({
                        where: {
                            id: historyExist.id
                        },
                        data: {
                            isCurrent: false,
                            endDate: new Date()
                        },
                        include: { developer: { include: { user: true } } }
                    });
                }

                return {
                    updatedEvent,
                    employmentHistory
                };
            });

            if (res.employmentHistory) {
                try {
                    const notificationId = crypto.randomUUID();
                    await notificationQueue.add("resignation-approved", {
                        id: notificationId,
                        message: `Your resignation is approved!.`,
                        recipientId: res.employmentHistory.developer.userId,
                        referenceId: res.updatedEvent.id,
                        actionType: ActionType.EMPLOYMENT_RESIGNED,
                        referenceType: ReferenceType.EMPLOYMENT_EVENT
                    }, { jobId: notificationId });
                } catch (error) {
                    console.log("Bullmq error:", error);
                }
            }

            return res;
        }
    }
};

export const updateRecruiterEmploymentEvent = async (userId, data, id) => {
    const { reason, letterUrl, status } = data;

    let isOwner = false;

    const profile = await getRecuiterProfile(userId);

    if (!profile) {
        throw new AppError("Profile is not exist!", 404)
    }

    const company = await prisma.company.findUnique({
        where: {
            id: profile.companyId,
            isVerified: true
        }
    });

    if (!company) {
        throw new AppError("Company is not exist or not verified!", 404)
    };

    if (company.ownerId === profile.id) {
        isOwner = true;
    }

    const historyExist = await prisma.recruiterHistory.findFirst({
        where: {
            id,
            companyId: profile.companyId,
            isCurrent: true
        },
        include: {
            recruiterEvents: true
        }
    });

    if (!historyExist) {
        throw new AppError("Employment history not found or the developer already leave the company!", 404)
    }

    let persistedLetterUrl = letterUrl;
    if (letterUrl) {
        checkTempKey(letterUrl, userId);
        const file = await prisma.file.findUnique({ where: { key: letterUrl } });

        if (!file || file.userId !== userId || file.status !== "TEMP" || file.type !== "COVER_LETTER") {
            throw new AppError("Uploaded letter is invalid or unavailable.", 400);
        }

        const permanentKey = await promoteTempFileToPermanent(letterUrl, userId, "COVER_LETTER");
        await prisma.file.update({
            where: { key: letterUrl },
            data: { key: permanentKey, status: "PERMANENT" },
        });
        persistedLetterUrl = permanentKey;
    }

    const pendingEvent = historyExist.recruiterEvents.find((event) => event.status === "PENDING");

    if (pendingEvent && !isOwner) {
        throw new AppError("Your already resgin and the application is in pending state, wait for it!", 403)
    }

    if (!pendingEvent && isOwner) {
        const res = await prisma.$transaction(async (tx) => {
            const recruiterEvent = await tx.recruiterEvent.create({
                data: {
                    reason,
                    letterUrl: persistedLetterUrl,
                    status: "ACCEPTED",
                    approvedByRecruiterId: profile.id,
                    type: "TERMINATE",
                    recruiterHistoryId: historyExist.id
                }
            });

            const recruiterHistory = await tx.recruiterHistory.update({
                where: {
                    id: historyExist.id
                },
                data: {
                    isCurrent: false,
                    endDate: new Date()
                }
            })

            const recruiter = await tx.recruiterProfile.update({
                where: {
                    id: historyExist.recruiterProfileId
                },
                data: {
                    companyId: null
                },
                include: { user: true },
            });

            return {
                recruiterEvent,
                recruiterHistory,
                recruiter
            };
        });

        try {
            const notificationId = crypto.randomUUID();
            await notificationQueue.add("recruiter-terminated", {
                id: notificationId,
                message: `You are terminated from company.`,
                recipientId: res.recruiter.userId,
                referenceId: res.recruiterEvent.id,
                actionType: ActionType.EMPLOYMENT_TERMINATED,
                referenceType: ReferenceType.EMPLOYMENT_EVENT
            }, { jobId: notificationId });
        } catch (error) {
            console.log("Bullmq error:", error);
        }

        try {
            const uuid = crypto.randomUUID();
            await emailQueue.add("employment-event-email", {
                uuid,
                email: res.recruiter.user.email,
                recipientName: res.recruiter.user.name,
                subjectName: res.recruiter.user.name,
                companyName: company.name,
                eventType: "terminated",
                reason,
            }, { jobId: uuid });
        } catch (error) {
            console.error("Failed to queue recruiter termination email:", error);
        }

        return res;
    }
    else if (!pendingEvent && !isOwner) {
        const update = await prisma.recruiterEvent.create({
            data: {
                reason,
                letterUrl: persistedLetterUrl,
                type: "RESIGN",
                recruiterHistoryId: historyExist.id
            },
            include: {
                recruiterHistory: {
                    include: {
                        recruiter: { include: { user: true } },
                        company: { include: { owner: { include: { user: true } } } },
                    }
                }
            }
        });

        try {
            const notificationId = crypto.randomUUID();
            await notificationQueue.add("recruiter-resignation-submitted", {
                id: notificationId,
                message: `Recruiter submitted resignation.`,
                recipientId: update.recruiterHistory.recruiter.userId,
                referenceId: update.id,
                actionType: ActionType.EMPLOYMENT_RESIGNED,
                referenceType: ReferenceType.EMPLOYMENT_EVENT
            }, {
                jobId: notificationId
            });
        } catch (error) {
            console.log("Bullmq error:", error);
        }

        try {
            const uuid = crypto.randomUUID();
            await emailQueue.add("employment-event-email", {
                uuid,
                email: update.recruiterHistory.company.owner.user.email,
                recipientName: update.recruiterHistory.company.owner.user.name,
                subjectName: update.recruiterHistory.recruiter.user?.name || "A recruiter",
                companyName: update.recruiterHistory.company.name,
                eventType: "resigned",
                reason,
            }, { jobId: uuid });
        } catch (error) {
            console.error("Failed to queue recruiter resignation email:", error);
        }

        return update;
    }
    else if (pendingEvent && isOwner) {
        const res = await prisma.$transaction(async (tx) => {
            const recruiterEvent = await tx.recruiterEvent.update({
                where: {
                    id: pendingEvent.id
                },
                data: {
                    status,
                    ...(status === "ACCEPTED" && { approvedByRecruiterId: profile.id }),
                }
            });

            let recruiterHistory = {};
            let recruiter;

            if (status === "ACCEPTED") {
                recruiterHistory = await tx.recruiterHistory.update({
                    where: {
                        id: historyExist.id
                    },
                    data: {
                        isCurrent: false,
                        endDate: new Date()
                    }
                })

                recruiter = await tx.recruiterProfile.update({
                    where: {
                        id: historyExist.recruiterProfileId
                    },
                    data: {
                        companyId: null
                    }
                })
            }

            return {
                recruiterEvent,
                recruiterHistory,
                recruiter
            };
        });

        if (res.recruiter) {
            try {
                const notificationId = crypto.randomUUID();
                await notificationQueue.add("recruiter-resignation-accepted", {
                    id: notificationId,
                    message: `Resignation accepted by company owner.`,
                    recipientId: res.recruiter.userId,
                    referenceId: res.recruiterEvent.id,
                    actionType: ActionType.EMPLOYMENT_RESIGNED,
                    referenceType: ReferenceType.EMPLOYMENT_EVENT
                }, { jobId: notificationId });
            } catch (error) {
                console.log("Bullmq error:", error);
            }
        }

        return res;
    }
};

export const updateEmploymentHistoryStatus = async (userId, data, id) => {
    const { status } = data;

    const profile = await getRecuiterProfile(userId);

    if (!profile) {
        throw new AppError("Profile is not exist!", 404)
    }

    const company = await prisma.company.findUnique({
        where: {
            id: profile.companyId,
            isVerified: true
        }
    });

    if (!company) {
        throw new AppError("Company is not exist!", 404)
    };

    const eventExist = await prisma.employementEvent.findUnique({
        where: {
            id,
            status: "PENDING"
        },
        include: {
            employmentHistory: true
        }
    });

    if (!eventExist) {
        throw new AppError("Employment event is not exist or being updated!", 404)
    };

    if (eventExist.employmentHistory.companyId !== profile.companyId) {
        throw new AppError("You only update your company's employment history!", 403)
    };

    const res = await prisma.$transaction(async (tx) => {
        const employmentEvent = await tx.employementEvent.update({
            where: {
                id: eventExist.id
            },
            data: {
                status,
                ...(status === LeaveStatus.ACCEPTED && { approvedByRecruiterId: profile.id })
            },
            include: {
                employmentHistory: {
                    include: {
                        developer: { include: { user: true } },
                    }
                }
            }
        });

        let employmentHistory = {};
        if (status === LeaveStatus.ACCEPTED) {
            employmentHistory = await tx.employmentHistory.update({
                where: {
                    id: employmentEvent.employmentHistoryId
                },
                data: {
                    isCurrent: false,
                    endDate: new Date(),
                }
            })

        }

        return {
            employmentEvent,
            employmentHistory
        }
    });

    if (status === LeaveStatus.ACCEPTED || status === LeaveStatus.REJECTED) {
        try {
            const notificationId = crypto.randomUUID();
            await notificationQueue.add(
                status === LeaveStatus.ACCEPTED ? "resignation-approved" : "resignation-rejected",
                {
                    id: notificationId,
                    message: status === LeaveStatus.ACCEPTED ? "Resignation approved." : "Resignation rejected.",
                    recipientId: res.employmentEvent.employmentHistory.developer.userId,
                    referenceId: res.employmentEvent.id,
                    actionType: ActionType.EMPLOYMENT_RESIGNED,
                    referenceType: ReferenceType.EMPLOYMENT_EVENT
                },
                { jobId: notificationId }
            );
        } catch (error) {
            console.log("Bullmq error:", error);
        }
    }

    if (status === LeaveStatus.ACCEPTED) {
        try {
            const uuid = crypto.randomUUID();
            const developerUser = res.employmentEvent.employmentHistory.developer.user;
            await emailQueue.add("employment-event-email", {
                uuid,
                email: developerUser.email,
                recipientName: developerUser.name,
                subjectName: developerUser.name,
                companyName: company.name,
                eventType: "resignation-approved",
                reason: res.employmentEvent.reason,
            }, { jobId: uuid });
        } catch (error) {
            console.error("Failed to queue resignation approval email:", error);
        }
    }

    return res;
};

export const updateRecruiterHistoryStatus = async (userId, data, id) => {
    const { status } = data;

    const profile = await getRecuiterProfile(userId);

    if (!profile) {
        throw new AppError("Profile is not exist!", 404)
    }

    const company = await prisma.company.findUnique({
        where: {
            id: profile.companyId,
            isVerified: true
        }
    });

    if (!company) {
        throw new AppError("Company is not exist!", 404)
    };

    if (company.ownerId !== profile.id) {
        throw new AppError("Only company owner can approve recruiter resgination!", 403)
    }

    const eventExist = await prisma.recruiterEvent.findUnique({
        where: {
            id,
            status: "PENDING"
        },
        include: {
            recruiterHistory: true
        }
    });

    if (!eventExist) {
        throw new AppError("Recruiter employment event is not exist or being updated!", 404)
    };

    if (eventExist.recruiterHistory.companyId !== profile.companyId) {
        throw new AppError("You only update your company's employment history!", 403)
    };

    const res = await prisma.$transaction(async (tx) => {
        const recruiterEvent = await tx.recruiterEvent.update({
            where: {
                id: eventExist.id
            },
            data: {
                status,
                ...(status === LeaveStatus.ACCEPTED && { approvedByRecruiterId: profile.id })
            }
        });

        let recruiterHistory = {};
        if (status === LeaveStatus.ACCEPTED) {
            recruiterHistory = await tx.recruiterHistory.update({
                where: {
                    id: recruiterEvent.recruiterHistoryId
                },
                data: {
                    isCurrent: false,
                    endDate: new Date(),
                }
            })

            await tx.recruiterProfile.update({
                where: {
                    id: recruiterHistory.recruiterProfileId
                },
                data: {
                    companyId: null
                }
            })
        };

        return {
            recruiterEvent,
            recruiterHistory
        }
    });

    return res;
};
