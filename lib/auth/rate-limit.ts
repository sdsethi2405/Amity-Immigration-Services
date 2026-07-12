import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

import { USERNAME_LOCKOUT_MINUTES } from "@/lib/auth/constants";

function createRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  return new Redis({ url, token });
}

const redis = createRedis();

/** 10 login attempts per IP per 10 minutes. */
export const ipLoginLimiter =
  redis &&
  new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "10 m"),
    prefix: "amity:login:ip",
    analytics: false,
  });

/** 5 login attempts per username per 15 minutes. */
export const usernameLoginLimiter =
  redis &&
  new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "15 m"),
    prefix: "amity:login:user",
    analytics: false,
  });

export type LoginRateLimitResult =
  | { allowed: true }
  | { allowed: false; reason: "ip" | "username"; retryAfterSeconds?: number };

export async function checkLoginRateLimits(
  ip: string,
  username: string,
): Promise<LoginRateLimitResult> {
  if (!ipLoginLimiter || !usernameLoginLimiter) {
    return { allowed: true };
  }

  const [ipResult, usernameResult] = await Promise.all([
    ipLoginLimiter.limit(ip),
    usernameLoginLimiter.limit(username.toLowerCase()),
  ]);

  if (!ipResult.success) {
    return {
      allowed: false,
      reason: "ip",
      retryAfterSeconds: Math.ceil((ipResult.reset - Date.now()) / 1000),
    };
  }

  if (!usernameResult.success) {
    return {
      allowed: false,
      reason: "username",
      retryAfterSeconds: Math.ceil((usernameResult.reset - Date.now()) / 1000),
    };
  }

  return { allowed: true };
}

export function getUsernameLockUntil(): Date {
  return new Date(Date.now() + USERNAME_LOCKOUT_MINUTES * 60 * 1000);
}

/** 30 public search requests per IP per minute. */
export const searchIpLimiter =
  redis &&
  new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, "1 m"),
    prefix: "amity:search:ip",
    analytics: false,
  });

export async function checkSearchRateLimit(
  ip: string,
): Promise<{ allowed: boolean; retryAfterSeconds?: number }> {
  if (!searchIpLimiter) {
    return { allowed: true };
  }

  const result = await searchIpLimiter.limit(ip || "unknown");

  if (!result.success) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((result.reset - Date.now()) / 1000),
    };
  }

  return { allowed: true };
}
