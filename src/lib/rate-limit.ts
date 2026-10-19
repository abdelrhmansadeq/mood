import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
    url: (process.env.UPSTASH_REDIS_REST_URL || "").trim(),
    token: (process.env.UPSTASH_REDIS_REST_TOKEN || "").trim(),
});

// 🛡️ 1. حماية شات الـ AI (15 رسالة في الدقيقة)
export const chatRatelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(15, "1 m"),
    analytics: true,
    prefix: "mood:chat",
});

// 🛡️ 2. حماية فورم التواصل (3 رسائل في الساعة)
export const contactRatelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, "1 h"),
    analytics: true,
    prefix: "mood:contact",
});

// 🛡️ 3. حماية إنشاء الطلبات (30 طلب في الساعة - تم الرفع لحل مشكلة شبكات المحمول)
export const orderRatelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, "1 h"),
    analytics: true,
    prefix: "mood:order",
});

// 🛡️ 4. حماية مسارات الأدمن (30 طلب في الدقيقة)
export const adminRatelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, "1 m"),
    analytics: true,
    prefix: "mood:admin",
});

// 🛡️ 5. حماية تسجيل دخول الأدمن (5 محاولات كل 15 دقيقة)
export const loginRatelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "15 m"),
    analytics: true,
    prefix: "mood:admin-login",
});