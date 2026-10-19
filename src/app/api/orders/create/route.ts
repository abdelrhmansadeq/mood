import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendEmail, buildCustomerOrderEmail, buildAdminOrderEmail } from "@/lib/email";
import { z } from "zod";
import { orderRatelimit } from "@/lib/rate-limit";

const orderSchema = z.object({
    fullName: z.string().min(3, "الاسم يجب أن يكون 3 أحرف على الأقل").max(50),
    phone: z.string().regex(/^01[0125][0-9]{8}$/, "رقم الموبايل غير صحيح (مثال: 01012345678)"),
    email: z.string().email("الإيميل غير صحيح").optional().or(z.literal("")),
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
    couponCode: z.string().optional().nullable(),
    discountAmount: z.number().optional(),
});

type SupabaseProduct = {
    id: number;
    name: string;
    name_en: string | null;
    image: string | null;
    price: number;
    sale_price: number | null;
    stock: number;
    sizes: Record<string, number>;
    colors: Array<{ name: string; hex: string; image: string; sizes: Record<string, number>; }>;
};

export async function POST(request: Request) {
    try {
        // 1. Rate Limit (Fail-Open)
        try {
            const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
            const { success } = await orderRatelimit.limit(ip);
            if (!success) {
                return NextResponse.json({ error: "بعت طلبات كتير جداً، استنى شوية وجرب تاني." }, { status: 429 });
            }
        } catch (e) {
            console.warn("Rate limit failed, allowing request (Fail-Open):", e);
        }

        const body = await request.json();
        const validation = orderSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
        }

        const { fullName, phone, email, city, address, notes, items, couponCode } = validation.data;

        // 2. التحقق من المستخدم
        let userId: string | null = null;
        let userEmail = email || "";
        const authHeader = request.headers.get("authorization");
        const token = authHeader?.replace("Bearer ", "");

        if (token) {
            const { data: { user: authUser }, error: authError } = await supabaseAdmin.auth.getUser(token);
            if (!authError && authUser) {
                userId = authUser.id;
                userEmail = authUser.email || email || "";
            }
        }

        // 3. دمج المنتجات المكررة في السلة
        const mergedItemsMap = new Map<string, typeof items[0]>();
        for (const item of items) {
            const key = `${item.productId}-${item.color}-${item.size}`;
            if (mergedItemsMap.has(key)) {
                mergedItemsMap.get(key)!.quantity += item.quantity;
            } else {
                mergedItemsMap.set(key, { ...item });
            }
        }
        const mergedItems = Array.from(mergedItemsMap.values());

        for (const item of mergedItems) {
            if (item.quantity > 10) {
                return NextResponse.json({ error: "الحد الأقصى 10 قطع لكل منتج في الطلب الواحد" }, { status: 400 });
            }
        }

        const productIds = mergedItems.map((i) => i.productId);
        const { data: dbProducts, error: fetchError } = await supabaseAdmin
            .from("products")
            .select("id, name, name_en, image, price, sale_price, stock, sizes, colors")
            .in("id", productIds);

        if (fetchError || !dbProducts) return NextResponse.json({ error: "فشل التحقق من المنتجات" }, { status: 500 });

        // 4. التحقق من المخزون
        for (const item of mergedItems) {
            const product = dbProducts.find((p: SupabaseProduct) => p.id === item.productId) as SupabaseProduct | undefined;
            if (!product) return NextResponse.json({ error: `المنتج "${item.name}" مش موجود` }, { status: 400 });

            const hasColors = product.colors && product.colors.length > 0;
            if (hasColors) {
                const color = product.colors.find((c: { name: string }) => c.name === item.color); // ✅ حل مشكلة c
                if (!color) return NextResponse.json({ error: `اللون "${item.color}" غير متوفر` }, { status: 400 });
                const sizeStock = color.sizes?.[item.size] || 0;
                if (sizeStock < item.quantity) return NextResponse.json({ error: `"${product.name}" مقاس ${item.size}: متاح ${sizeStock} بس` }, { status: 400 });
            } else {
                const sizeStock = product.sizes?.[item.size] || 0;
                if (sizeStock < item.quantity) return NextResponse.json({ error: `"${product.name}" مقاس ${item.size}: متاح ${sizeStock} بس` }, { status: 400 });
            }
        }

        // 5. حساب السعر من الداتابيز
        const enrichedItems = mergedItems.map((item) => {
            const product = dbProducts.find((p: SupabaseProduct) => p.id === item.productId)!;
            const effectivePrice = product.sale_price != null && product.sale_price < product.price ? product.sale_price : product.price;

            const hasColors = product.colors && product.colors.length > 0;
            let finalImage = product.image || "";
            if (hasColors) {
                const color = product.colors.find((c: { name: string }) => c.name === item.color); // ✅ حل مشكلة c
                if (color && color.image) finalImage = color.image;
            }

            return {
                ...item,
                name: product.name,
                nameEn: product.name_en || product.name,
                image: finalImage,
                price: effectivePrice
            };
        });

        const subtotal = enrichedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
        const shipping = subtotal >= 500 ? 0 : 50;

        // 6. التحقق من الكوبون
        let actualDiscount = 0;
        let validCoupon = null;

        if (couponCode) {
            const { data: coupon } = await supabaseAdmin
                .from("coupons")
                .select("*")
                .eq("code", couponCode.trim().toUpperCase())
                .eq("is_active", true)
                .single();

            if (coupon) {
                const isExpired = coupon.expires_at && new Date(coupon.expires_at) < new Date();
                const isMaxed = coupon.max_uses && coupon.used_count >= coupon.max_uses;
                const isMinAmountMet = subtotal >= coupon.min_order_amount;

                if (!isExpired && !isMaxed && isMinAmountMet) {
                    validCoupon = coupon;
                    if (coupon.discount_percentage) {
                        actualDiscount = (subtotal * coupon.discount_percentage) / 100;
                    } else if (coupon.discount_fixed) {
                        actualDiscount = coupon.discount_fixed;
                    }
                    if (actualDiscount > subtotal) actualDiscount = subtotal;
                    actualDiscount = Math.round(actualDiscount);
                }
            }
        }

        const total = Math.max(0, subtotal + shipping - actualDiscount);

        // 7. خصم المخزون
        const deductedItems: Array<{ productId: number; color: string; size: string; quantity: number; hasColors: boolean; }> = [];
        let orderCreated = false;
        let finalOrder = null;
        let couponIncremented = false;

        try {
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
                    throw new Error(`المنتج "${item.name}" خلص من المخزون`);
                }
                deductedItems.push({ productId: item.productId, color: item.color, size: item.size, quantity: item.quantity, hasColors });
            }

            // 8. تحديث الكوبون
            if (validCoupon) {
                const { error: couponError } = await supabaseAdmin
                    .from("coupons")
                    .update({ used_count: validCoupon.used_count + 1 })
                    .eq("id", validCoupon.id)
                    .lt("used_count", validCoupon.max_uses || 999999);

                if (couponError) {
                    throw new Error("كود الخصم تم استخدامه للتو من شخص آخر، برجاء المحاولة بدون الكوبون.");
                }
                couponIncremented = true;
            }

            // 9. توليد رقم طلب فريد
            let orderNumber = "";
            let attempts = 0;

            while (attempts < 3) {
                orderNumber = "MOOD-" + Math.floor(100000 + Math.random() * 900000);

                const { data: order, error: orderError } = await supabaseAdmin.from("orders").insert({
                    user_id: userId,
                    user_email: userEmail || null,
                    order_number: orderNumber,
                    full_name: fullName,
                    phone,
                    city,
                    address,
                    notes: notes || null,
                    subtotal,
                    shipping,
                    total,
                    items: enrichedItems,
                    discount_amount: actualDiscount,
                    coupon_code: validCoupon ? validCoupon.code : null,
                }).select().single();

                if (!orderError) {
                    finalOrder = order;
                    orderCreated = true;
                    break;
                }

                if (orderError.code === '23505') {
                    attempts++;
                    continue;
                }

                throw new Error("فشل إنشاء الطلب");
            }

            if (!orderCreated || !finalOrder) {
                throw new Error("فشل توليد رقم طلب فريد، جرب تاني.");
            }

            // 10. تحديث المبيعات
            for (const item of enrichedItems) {
                // ✅ حل مشكلة catch: استخدمنا try/catch بدل .catch() المباشرة
                try {
                    await supabaseAdmin.rpc("increment_sold_count", { p_product_id: item.productId, p_quantity: item.quantity });
                } catch (err) {
                    console.error("Sold count error:", err);
                }
            }

        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "فشل إتمام الطلب";

            // 🚨 ROLLBACK: إرجاع المخزون
            for (const deducted of deductedItems) {
                if (deducted.hasColors) await supabaseAdmin.rpc("increase_product_color_stock", { p_product_id: deducted.productId, p_color_name: deducted.color, p_size: deducted.size, p_quantity: deducted.quantity });
                else await supabaseAdmin.rpc("increase_product_size_stock", { p_product_id: deducted.productId, p_size: deducted.size, p_quantity: deducted.quantity });
            }

            // إرجاع الكوبون
            if (couponIncremented && validCoupon) {
                await supabaseAdmin
                    .from("coupons")
                    .update({ used_count: validCoupon.used_count })
                    .eq("id", validCoupon.id);
            }

            return NextResponse.json({ error: errorMessage }, { status: 400 });
        }

        // 11. إرسال الإيميلات
        const emailData = {
            orderNumber: finalOrder.order_number,
            customerName: fullName,
            phone, city, address, subtotal, shipping, total,
            items: enrichedItems.map((i) => ({ name: i.name, size: i.size, color: i.color, quantity: i.quantity, price: i.price }))
        };

        if (userEmail) {
            sendEmail({ to: userEmail, toName: fullName, subject: `تأكيد طلبك ${finalOrder.order_number} - Mood`, htmlContent: buildCustomerOrderEmail(emailData) })
                .catch((err: unknown) => console.error("Customer email failed:", err)); // ✅ حل مشكلة err
        }

        const adminEmail = process.env.BREVO_ADMIN_EMAIL;
        if (adminEmail) {
            sendEmail({ to: adminEmail, toName: "Mood Admin", subject: `🔔 طلب جديد: ${finalOrder.order_number}`, htmlContent: buildAdminOrderEmail(emailData, userEmail || "زائر") })
                .catch((err: unknown) => console.error("Admin email failed:", err)); // ✅ حل مشكلة err
        }

        return NextResponse.json({ order: finalOrder });

    } catch (error) {
        console.error("API error:", error);
        return NextResponse.json({ error: "حصلت مشكلة في السيرفر" }, { status: 500 });
    }
}