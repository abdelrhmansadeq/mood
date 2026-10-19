import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendEmail, buildAbandonedCartEmail } from "@/lib/email";

//export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        // ✅ 1. تأمين المسار (عشان محدش يفتحه من المتصفح)
        const authHeader = request.headers.get("authorization");
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // ✅ 2. تحديد السلات اللي بقالها 24 ساعة
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

        const { data: carts, error } = await supabaseAdmin
            .from("carts")
            .select("*")
            .lt("updated_at", twentyFourHoursAgo)
            .eq("email_sent", false);

        if (error) throw error;
        if (!carts || carts.length === 0) {
            return NextResponse.json({ message: "مفيش سلات متروكة حالياً" });
        }

        let emailsSent = 0;

        // ✅ 3. إرسال الإيميلات
        for (const cart of carts) {
            if (!cart.email) continue;

            try {
                // بنجيب اسم العميل (لو مش موجود بنكتب "عميلنا العزيز")
                const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(cart.user_id);
                const customerName = user?.user_metadata?.full_name || "عميلنا العزيز";

                await sendEmail({
                    to: cart.email,
                    toName: customerName,
                    subject: "🛒 لسه فاكرينك.. سلتك مستنياك في Mood!",
                    htmlContent: buildAbandonedCartEmail({
                        customerName,
                        items: cart.items,
                        total: cart.total,
                    }),
                });

                // ✅ 4. نعلم على السلة إننا بعتنا الإيميل عشان ميبعتش تاني
                await supabaseAdmin
                    .from("carts")
                    .update({ email_sent: true })
                    .eq("id", cart.id);

                emailsSent++;
            } catch (err) {
                console.error(`Failed to send email to ${cart.email}:`, err);
            }
        }

        return NextResponse.json({
            success: true,
            message: `تم إرسال ${emailsSent} إيميل بنجاح من أصل ${carts.length} سلة.`
        });

    } catch (error) {
        console.error("Cron API error:", error);
        return NextResponse.json({ error: "حصلت مشكلة في السيرفر" }, { status: 500 });
    }
}