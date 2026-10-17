import { PrismaClient } from "@/generated/prisma/client";
import { AppError } from "@/utils/AppError";
import { getDeveloperProfile } from "../profile/developerService";
import { ROLE } from "@/generated/prisma/client";
import { getRecuiterProfile } from "../profile/recuiterService";
import { notificationSchema } from "@/validations/notification";
import crypto from "crypto";

import prisma from "@/utils/prisma";

export const getNotifications = async (searchParams, userId) => {

    const page = Number(searchParams.get("page") || 1);
    const pageSize = Number(searchParams.get("limit") || 10);

    const isRead = searchParams.get("isRead");
    const sort = searchParams.get("sort");

    const currentPage = Math.max(1, page);
    const limit = Math.max(1, pageSize);

    let where = {};

    where.recipientId = userId;


    if (isRead) {
        where.isRead = isRead == "true" ? true : false
    }

    let orderBy;

    if (sort) {
        orderBy = {
            createdAt: sort
        }
    };

    const [notifications, totalCount, unreadCount] =
        await prisma.$transaction([
            prisma.notification.findMany({
                where,
                take: limit,
                skip: (currentPage - 1) * limit,
                orderBy,
            }),

            prisma.notification.count({
                where,
            }),

            prisma.notification.count({
                where: {
                    recipientId: userId,
                    isRead: false,
                },
            }),
        ]);

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
        notifications,
        unreadCount,
        metadata
    }
};

export const getNotificationDetail = async (id, userId) => {
    const notification = await prisma.notification.findUnique({
        where: {
            id,
            recipientId: userId
        }
    });

    if (!notification) {
        throw new AppError("Notification not found!", 404)
    }

    return notification;
};

export const readNotification = async (id, userId) => {
    const notification = await prisma.notification.findUnique({
        where: {
            id,
            recipientId: userId
        }
    });

    if (!notification) {
        throw new AppError("Notfication is not exist!", 404)
    };

    const update = await prisma.notification.update({
        where: {
            id: notification.id,
        },
        data: {
            isRead: true
        }
    });

    return update;
};

export const readAllNotification = async (userId) => {
    const update = await prisma.notification.updateMany({
        where: {
            recipientId: userId
        },
        data: {
            isRead: true
        }
    });

    return update;
};

export const createNotification = async (data) => {
    const validatedData = notificationSchema.parse(data);

    const { id, actionType, message, recipientId, referenceId, referenceType } = validatedData;

    const notificationId = id || crypto.randomUUID();

    const notification = await prisma.notification.upsert({
        where: {
            id: notificationId
        },
        update: {},
        create: {
            id: notificationId,
            actionType,
            message,
            referenceId,
            referenceType,
            recipientId,
        }
    });

    return notification;
};
