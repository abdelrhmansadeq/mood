import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// تهيئة الاتصال بـ Upstash Redis
const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
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

// 🛡️ 3. حماية إنشاء الطلبات (10 طلبات في الساعة عشان نمنع السبام)
export const orderRatelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "1 h"),
    analytics: true,
    prefix: "mood:order",
});