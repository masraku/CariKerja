import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import { NextResponse } from "next/server"
export const redis = Redis.fromEnv()
// Auth endpoints: 5 requests per 15 minutes (strictest)
export const authLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "15 m"),
  analytics: true,
  prefix: "@upstash/ratelimit/auth",
})
// Public endpoints: 100 requests per minute
export const publicLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "1 m"),
  analytics: true,
  prefix: "@upstash/ratelimit/public",
})
// Standard endpoints: 60 requests per minute
export const standardLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, "1 m"),
  analytics: true,
  prefix: "@upstash/ratelimit/standard",
})
// Admin endpoints: 120 requests per minute
export const adminLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(120, "1 m"),
  analytics: true,
  prefix: "@upstash/ratelimit/admin",
})
// Helper to get IP from request
export function getIP(request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0] 
    ?? request.headers.get("x-real-ip") 
    ?? "anonymous"
}
// Helper to create rate limit response
export function rateLimitResponse(reset) {
  return NextResponse.json(
    { error: "Terlalu banyak permintaan. Silakan coba lagi nanti." },
    { 
      status: 429,
      headers: {
        "Retry-After": String(Math.ceil((reset - Date.now()) / 1000))
      }
    }
  )
}