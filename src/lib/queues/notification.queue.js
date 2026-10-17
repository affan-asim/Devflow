import { Queue } from "bullmq";
import { connectionOptions } from "@/lib/redis";
import { randomUUID } from "crypto";
import { createNotification } from "@/services/notifications/notificationService";

const queue = new Queue("notifications", {
  connection: connectionOptions,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
        type: "exponential",
        delay: 1000
    }
  }
});

// Persist immediately so notifications remain visible even when the separate
// notification worker is stopped. The worker still processes the queued job;
// createNotification upserts by ID, making that retry idempotent.
export const notificationQueue = new Proxy(queue, {
  get(target, property) {
    if (property === "add") {
      return async (name, data, options) => {
        const payload = { ...data, id: data?.id || randomUUID() };
        await createNotification(payload);

        try {
          return await target.add(name, payload, options);
        } catch (error) {
          console.error("Notification was stored but could not be queued:", error);
          return null;
        }
      };
    }

    const value = Reflect.get(target, property, target);
    return typeof value === "function" ? value.bind(target) : value;
  },
});
