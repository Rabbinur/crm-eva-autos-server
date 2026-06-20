import { Redis } from "@upstash/redis";
import { envConfig } from ".";

export const pubClient = new Redis({
  url: envConfig.redis.upstashUrl || "https://placeholder-url.upstash.io",
  token: envConfig.redis.upstashToken || "placeholder-token",
});

export const connectRedis = async () => {
  try {
    console.log("⏳ Upstash Redis database connecting...");
    const pong = await pubClient.ping();
    if (pong === "PONG") {
      console.log("✅ Upstash Redis cache database connected");
    } else {
      console.warn(`⚠️ Unexpected Upstash Redis ping response: ${pong}`);
    }
  } catch (error: any) {
    console.error(
      `Failed to connect to Upstash Redis. Error: ${error?.message}`
    );
  }
};
