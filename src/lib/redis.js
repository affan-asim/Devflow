import Redis from "ioredis";

export const connectionOptions = {
  host: 'localhost',
  port: 6379,
  maxRetriesPerRequest: null,
};

export const redis = new Redis(connectionOptions);