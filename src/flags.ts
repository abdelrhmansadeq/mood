import { flag } from 'flags/next';
import { vercelAdapter } from '@flags-sdk/vercel';

// هنا بنعرف الـ Flag اللي اسمه mood-config عشان نقرأ قيمته
export const maintenanceFlag = flag({
    key: 'mood-config', // نفس اسم الـ Flag اللي في Vercel
    adapter: vercelAdapter(),
    defaultValue: false,
});