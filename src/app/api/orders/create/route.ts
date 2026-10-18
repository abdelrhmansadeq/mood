import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendEmail, buildCustomerOrderEmail, buildAdminOrderEmail } from "@/lib/email";
import { z } from "zod";

// ✅ 1. تعريف شكل البيانات والتحقق منها باستخدام Zod
const orderSchema = z.object({
    fullName: z.string().min(3, "الاسم يجب أن يكون 3 أحرف على الأقل").max(50),
    phone: z.string().regex(/^01[0125][0-9]{8}$/, "رقم الموبايل غير صحيح (مثال: 01012345678)"),
    city: z.string().min(2, "المدينة مطلوبة"),
    address: z.string().min(5, "العنوان يجب أن يكون 5 أحرف على الأقل"),
    notes: z.string().optional(),
    items: z.array(z.object({
        productId: z.number(),
        name: z.string(),
        nameEn: z.string(),
        price: z.number(),
        image: z.string(),
        size: z.string(),
        color: z.string(),
        quantity: z.number().int().positive("الكمية يجب أن تكون رقم صحيح أكبر من صفر").max(10, "الحد الأقصى 10 قطع"),
    })).min(1, "السلة فاضية"),
});

type SupabaseProduct = {
    id: number;
    name: string;
    price: number;
    sale_price: number | null;
    stock: number;
    sizes: Record<string, number>;
    colors: Array<{ name: string; hex: string; image: string; sizes: Record<string, number>; }>;
};

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // ✅ 2. التحقق من البيانات باستخدام Zod
        const validation = orderSchema.safeParse(body);
        if (!validation.success) {
            const firstError = validation.error.issues[0].message;
            return NextResponse.json({ error: firstError }, { status: 400 });
        }

        const { fullName, phone, city, address, notes, items } = validation.data;

        const authHeader = request.headers.get("authorization");
        const token = authHeader?.replace("Bearer ", "");

        if (!token) return NextResponse.json({ error: "لازم تسجل دخول الأول" }, { status: 401 });

        const { data: { user: authUser }, error: authError } = await supabaseAdmin.auth.getUser(token);
        if (authError || !authUser) return NextResponse.json({ error: "لازم تسجل دخول الأول" }, { status: 401 });

        const userId = authUser.id;
        const userEmail = authUser.email || "";

        const productIds = items.map((i) => i.productId);
        const { data: dbProducts, error: fetchError } = await supabaseAdmin
            .from("products")
            .select("id, name, price, sale_price, stock, sizes, colors")
            .in("id", productIds);

        if (fetchError || !dbProducts) return NextResponse.json({ error: "فشل التحقق من المنتجات" }, { status: 500 });

        // تحقق من المخزون
        for (const item of items) {
            const product = dbProducts.find((p: SupabaseProduct) => p.id === item.productId) as SupabaseProduct | undefined;
            if (!product) return NextResponse.json({ error: `المنتج "${item.name}" مش موجود` }, { status: 400 });

            const hasColors = product.colors && product.colors.length > 0;
            if (hasColors) {
                const color = product.colors.find((c) => c.name === item.color);
                if (!color) return NextResponse.json({ error: `اللون "${item.color}" غير متوفر` }, { status: 400 });
                const sizeStock = color.sizes?.[item.size] || 0;
                if (sizeStock < item.quantity) return NextResponse.json({ error: `"${product.name}" مقاس ${item.size}: متاح ${sizeStock} بس` }, { status: 400 });
            } else {
                const sizeStock = product.sizes?.[item.size] || 0;
                if (sizeStock < item.quantity) return NextResponse.json({ error: `"${product.name}" مقاس ${item.size}: متاح ${sizeStock} بس` }, { status: 400 });
            }
        }

        // حساب السعر الفعلي من الداتابيز (تجاهل سعر الفرونت إند)
        const enrichedItems = items.map((item) => {
            const product = dbProducts.find((p: SupabaseProduct) => p.id === item.productId)!;
            const effectivePrice = product.sale_price != null && product.sale_price < product.price ? product.sale_price : product.price;
            return { ...item, price: effectivePrice };
        });

        const subtotal = enrichedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
        const shipping = subtotal >= 500 ? 0 : 50;
        const total = subtotal + shipping;

        // خصم المخزون
        const deductedItems: Array<{ productId: number; color: string; size: string; quantity: number; hasColors: boolean; }> = [];

        for (const item of enrichedItems) {
            const product = dbProducts.find((p: SupabaseProduct) => p.id === item.productId) as SupabaseProduct;
            const hasColors = product.colors && product.colors.length > 0;
            let success = false;

            if (hasColors) {
                const result = await supabaseAdmin.rpc("decrease_product_color_stock", { p_product_id: item.productId, p_color_name: item.color, p_size: item.size, p_quantity: item.quantity });
                success = result.data as boolean;
                if (result.error) success = false;
            } else {
                const result = await supabaseAdmin.rpc("decrease_product_size_stock", { p_product_id: item.productId, p_size: item.size, p_quantity: item.quantity });
                success = result.data as boolean;
                if (result.error) success = false;
            }

            if (!success) {
                // Rollback
                for (const deducted of deductedItems) {
                    if (deducted.hasColors) await supabaseAdmin.rpc("increase_product_color_stock", { p_product_id: deducted.productId, p_color_name: deducted.color, p_size: deducted.size, p_quantity: deducted.quantity });
                    else await supabaseAdmin.rpc("increase_product_size_stock", { p_product_id: deducted.productId, p_size: deducted.size, p_quantity: deducted.quantity });
                }
                return NextResponse.json({ error: `المنتج "${item.name}" خلص من المخزون` }, { status: 400 });
            }
            deductedItems.push({ productId: item.productId, color: item.color, size: item.size, quantity: item.quantity, hasColors });
        }

        // ✅ 3. توليد رقم طلب فريد (منع التكرار)
        let orderNumber = "";
        let isUnique = false;
        let retries = 0;

        while (!isUnique && retries < 5) {
            orderNumber = "MOOD-" + Math.floor(100000 + Math.random() * 900000);
            const { data: existing } = await supabaseAdmin.from("orders").select("id").eq("order_number", orderNumber).maybeSingle();
            if (!existing) isUnique = true;
            retries++;
        }

        if (!isUnique) {
            throw new Error("فشل توليد رقم طلب فريد، جرب تاني.");
        }

        // إنشاء الطلب
        const { data: order, error: orderError } = await supabaseAdmin.from("orders").insert({
            user_id: userId, user_email: userEmail, order_number: orderNumber,
            full_name: fullName, phone, city, address, notes: notes || null,
            subtotal, shipping, total, items: enrichedItems,
        }).select().single();

        if (orderError) {
            console.error("Order error:", orderError);
            for (const deducted of deductedItems) {
                if (deducted.hasColors) await supabaseAdmin.rpc("increase_product_color_stock", { p_product_id: deducted.productId, p_color_name: deducted.color, p_size: deducted.size, p_quantity: deducted.quantity });
                else await supabaseAdmin.rpc("increase_product_size_stock", { p_product_id: deducted.productId, p_size: deducted.size, p_quantity: deducted.quantity });
            }
            return NextResponse.json({ error: "فشل إنشاء الطلب" }, { status: 500 });
        }

        // زيادة عدّاد المبيعات
        for (const item of enrichedItems) {
            await supabaseAdmin.rpc("increment_sold_count", { p_product_id: item.productId, p_quantity: item.quantity });
        }

        // ✅ 4. إرسال الإيميلات (بدون تعطيل الرد)
        const emailData = { orderNumber, customerName: fullName, phone, city, address, subtotal, shipping, total, items: enrichedItems.map((i) => ({ name: i.name, size: i.size, color: i.color, quantity: i.quantity, price: i.price })) };

        if (userEmail) {
            sendEmail({ to: userEmail, toName: fullName, subject: `تأكيد طلبك ${orderNumber} - Mood`, htmlContent: buildCustomerOrderEmail(emailData) })
                .catch((err) => console.error("Customer email failed:", err));
        }

        const adminEmail = process.env.BREVO_ADMIN_EMAIL;
        if (adminEmail) {
            sendEmail({ to: adminEmail, toName: "Mood Admin", subject: `🔔 طلب جديد: ${orderNumber}`, htmlContent: buildAdminOrderEmail(emailData, userEmail) })
                .catch((err) => console.error("Admin email failed:", err));
        }

        return NextResponse.json({ order });
    } catch (error) {
        console.error("API error:", error);
        return NextResponse.json({ error: "حصلت مشكلة في السيرفر" }, { status: 500 });
    }
}