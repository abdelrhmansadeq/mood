type SendEmailParams = {
    to: string;
    toName?: string;
    subject: string;
    htmlContent: string;
};

export async function sendEmail({
                                    to,
                                    toName,
                                    subject,
                                    htmlContent,
                                }: SendEmailParams): Promise<{ error?: string }> {
    try {
        const apiKey = process.env.BREVO_API_KEY;
        const senderEmail = process.env.BREVO_SENDER_EMAIL;
        const senderName = process.env.BREVO_SENDER_NAME || "Mood";

        if (!apiKey || !senderEmail) {
            console.error("Brevo credentials missing");
            return { error: "Missing email credentials" };
        }

        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
                accept: "application/json",
                "api-key": apiKey,
                "content-type": "application/json",
            },
            body: JSON.stringify({
                sender: {
                    name: senderName,
                    email: senderEmail,
                },
                to: [
                    {
                        email: to,
                        name: toName || to,
                    },
                ],
                subject,
                htmlContent,
            }),
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error("Brevo error:", errorData);
            return { error: "Failed to send email" };
        }

        return {};
    } catch (e) {
        console.error("sendEmail error:", e);
        return { error: "Failed to send email" };
    }
}

// ===== Templates =====

type OrderItem = {
    name: string;
    size: string;
    color: string;
    quantity: number;
    price: number;
};

type OrderEmailData = {
    orderNumber: string;
    customerName: string;
    phone: string;
    city: string;
    address: string;
    subtotal: number;
    shipping: number;
    total: number;
    items: OrderItem[];
};

const buildItemsHtml = (items: OrderItem[]) => {
    return items
        .map(
            (item) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">
            <strong>${item.name}</strong><br />
            <span style="color: #666; font-size: 13px;">
              المقاس: ${item.size} | اللون: ${item.color} | الكمية: ${item.quantity}
            </span>
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: left;">
            <strong>${item.price * item.quantity} ج.م</strong>
          </td>
        </tr>
      `
        )
        .join("");
};

// قالب إيميل تأكيد الطلب (للعميل)
export function buildCustomerOrderEmail(data: OrderEmailData): string {
    return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8" />
      <title>تأكيد الطلب</title>
    </head>
    <body style="font-family: Arial, sans-serif; background-color: #FAFAF7; margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; border: 1px solid #eee;">
        
        <!-- Header -->
        <div style="background: #1F1F1F; color: #FAFAF7; padding: 24px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px; color: #C89B5A;">Mood</h1>
          <p style="margin: 8px 0 0; font-size: 14px; color: #FAFAF7;">متجر الأناقة</p>
        </div>

        <!-- Body -->
        <div style="padding: 30px;">
          <h2 style="color: #1F1F1F; margin-top: 0;">شكراً لك يا ${data.customerName}!</h2>
          <p style="color: #666; line-height: 1.6;">
            تم استلام طلبك بنجاح. هنتواصل معاك قريباً لتأكيد التفاصيل.
          </p>

          <div style="background: #FAFAF7; border: 1px solid #eee; border-radius: 6px; padding: 15px; margin: 20px 0; text-align: center;">
            <p style="margin: 0; color: #666; font-size: 13px;">رقم الطلب</p>
            <p style="margin: 8px 0 0; color: #C89B5A; font-size: 22px; font-weight: bold;">${data.orderNumber}</p>
          </div>

          <h3 style="color: #1F1F1F; border-bottom: 2px solid #C89B5A; padding-bottom: 8px;">تفاصيل الطلب</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <tbody>
              ${buildItemsHtml(data.items)}
            </tbody>
          </table>

          <table style="width: 100%; margin-top: 20px; border-top: 2px solid #eee; padding-top: 15px;">
            <tr>
              <td style="padding: 5px 0; color: #666;">المجموع الفرعي:</td>
              <td style="padding: 5px 0; text-align: left;">${data.subtotal} ج.م</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; color: #666;">الشحن:</td>
              <td style="padding: 5px 0; text-align: left;">${data.shipping === 0 ? "مجاني" : `${data.shipping} ج.م`}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; font-weight: bold; font-size: 18px; color: #1F1F1F; border-top: 1px solid #eee;">الإجمالي:</td>
              <td style="padding: 10px 0; text-align: left; font-weight: bold; font-size: 18px; color: #C89B5A; border-top: 1px solid #eee;">${data.total} ج.م</td>
            </tr>
          </table>

          <h3 style="color: #1F1F1F; margin-top: 30px;">بيانات الشحن</h3>
          <p style="color: #666; line-height: 1.6;">
            <strong>الاسم:</strong> ${data.customerName}<br />
            <strong>التليفون:</strong> ${data.phone}<br />
            <strong>المدينة:</strong> ${data.city}<br />
            <strong>العنوان:</strong> ${data.address}
          </p>

          <p style="color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 13px;">
            الدفع عند الاستلام. لو عندك أي استفسار، تواصل معانا على
            <a href="https://wa.me/201014766903" style="color: #C89B5A;">واتساب</a>.
          </p>
        </div>

        <!-- Footer -->
        <div style="background: #FAFAF7; padding: 20px; text-align: center; color: #999; font-size: 12px; border-top: 1px solid #eee;">
          © ${new Date().getFullYear()} Mood. جميع الحقوق محفوظة.
        </div>
      </div>
    </body>
    </html>
  `;
}

// قالب إشعار الأدمن بطلب جديد
export function buildAdminOrderEmail(
    data: OrderEmailData,
    customerEmail: string
): string {
    return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head><meta charset="UTF-8" /></head>
    <body style="font-family: Arial, sans-serif; background: #FAFAF7; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; padding: 30px; border: 1px solid #eee;">
        
        <div style="background: #C89B5A; color: white; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
          <h2 style="margin: 0;">🔔 طلب جديد!</h2>
        </div>

        <p style="color: #1F1F1F; font-size: 16px;">
          <strong>رقم الطلب:</strong> ${data.orderNumber}
        </p>

        <h3 style="color: #1F1F1F; border-bottom: 2px solid #C89B5A; padding-bottom: 8px;">بيانات العميل</h3>
        <p style="color: #666; line-height: 1.6;">
          <strong>الاسم:</strong> ${data.customerName}<br />
          <strong>الإيميل:</strong> ${customerEmail}<br />
          <strong>التليفون:</strong> ${data.phone}<br />
          <strong>المدينة:</strong> ${data.city}<br />
          <strong>العنوان:</strong> ${data.address}
        </p>

        <h3 style="color: #1F1F1F; margin-top: 30px; border-bottom: 2px solid #C89B5A; padding-bottom: 8px;">المنتجات</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tbody>${buildItemsHtml(data.items)}</tbody>
        </table>

        <p style="color: #1F1F1F; font-size: 18px; margin-top: 20px; text-align: left; font-weight: bold;">
          الإجمالي: <span style="color: #C89B5A;">${data.total} ج.م</span>
        </p>

        <a href="https://mood-khaki-beta.vercel.app/admin/dashboard/orders" 
           style="display: inline-block; background: #1F1F1F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">
          افتح لوحة التحكم
        </a>
      </div>
    </body>
    </html>
  `;
}

// قالب إشعار تغيير حالة الطلب
export function buildOrderStatusEmail(data: {
    orderNumber: string;
    customerName: string;
    status: string;
}): string {
    const statusInfo: Record<
        string,
        { label: string; color: string; message: string; emoji: string }
    > = {
        pending: {
            label: "قيد الانتظار",
            color: "#6B6B6B",
            message: "طلبك في انتظار التأكيد. هنراجعه ونتواصل معاك قريباً.",
            emoji: "⏳",
        },
        confirmed: {
            label: "تم التأكيد",
            color: "#C89B5A",
            message: "تم تأكيد طلبك بنجاح. هيتم تجهيزه في أقرب وقت.",
            emoji: "✅",
        },
        shipped: {
            label: "تم الشحن",
            color: "#3B82F6",
            message: "طلبك خرج للتوصيل! هيوصلك خلال 2-5 أيام عمل.",
            emoji: "🚚",
        },
        delivered: {
            label: "تم التوصيل",
            color: "#10B981",
            message: "تم توصيل طلبك بنجاح. نتمنى تكون مبسوط بالمنتج! 🎉",
            emoji: "🎉",
        },
        cancelled: {
            label: "ملغي",
            color: "#EF4444",
            message: "تم إلغاء طلبك. لو حصل خطأ، تواصل معانا.",
            emoji: "❌",
        },
    };

    const info = statusInfo[data.status] || statusInfo.pending;

    return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head><meta charset="UTF-8" /></head>
    <body style="font-family: Arial, sans-serif; background-color: #FAFAF7; margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; border: 1px solid #eee;">
        
        <div style="background: #1F1F1F; color: #FAFAF7; padding: 24px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px; color: #C89B5A;">Mood</h1>
          <p style="margin: 8px 0 0; font-size: 14px;">متجر الأناقة</p>
        </div>

        <div style="padding: 30px;">
          <h2 style="color: #1F1F1F; margin-top: 0;">
            مرحباً ${data.customerName}،
          </h2>

          <p style="color: #666; line-height: 1.6; font-size: 15px;">
            فيه تحديث على طلبك رقم 
            <strong style="color: #C89B5A;">${data.orderNumber}</strong>
          </p>

          <div style="background: ${info.color}15; border: 1px solid ${info.color}40; border-radius: 8px; padding: 20px; margin: 25px 0; text-align: center;">
            <p style="margin: 0; font-size: 40px;">${info.emoji}</p>
            <p style="margin: 10px 0 5px; color: #666; font-size: 13px;">الحالة الجديدة</p>
            <p style="margin: 0; color: ${info.color}; font-size: 22px; font-weight: bold;">
              ${info.label}
            </p>
          </div>

          <p style="color: #666; line-height: 1.6; font-size: 15px;">
            ${info.message}
          </p>

          <div style="text-align: center; margin-top: 30px;">
            <a href="https://mood-khaki-beta.vercel.app/account/orders" 
               style="display: inline-block; background: #1F1F1F; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              شوف تفاصيل الطلب
            </a>
          </div>

          <p style="color: #999; font-size: 13px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
            لو عندك أي استفسار، تواصل معانا على
            <a href="https://wa.me/201014766903" style="color: #C89B5A;">واتساب</a>
          </p>
        </div>

        <div style="background: #FAFAF7; padding: 20px; text-align: center; color: #999; font-size: 12px; border-top: 1px solid #eee;">
          © ${new Date().getFullYear()} Mood. جميع الحقوق محفوظة.
        </div>
      </div>
    </body>
    </html>
  `;
}

// قالب إشعار رسالة تواصل جديدة
export function buildContactEmail(data: {
    name: string;
    email: string;
    message: string;
}): string {
    return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head><meta charset="UTF-8" /></head>
    <body style="font-family: Arial, sans-serif; background-color: #FAFAF7; margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; border: 1px solid #eee;">
        
        <div style="background: #C89B5A; color: white; padding: 20px; text-align: center;">
          <h2 style="margin: 0; font-size: 22px;">📬 رسالة جديدة من صفحة تواصل معنا</h2>
        </div>

        <div style="padding: 30px;">
          
          <h3 style="color: #1F1F1F; margin-top: 0; border-bottom: 2px solid #C89B5A; padding-bottom: 8px;">
            بيانات المُرسل
          </h3>

          <p style="color: #666; line-height: 1.6; font-size: 15px;">
            <strong>الاسم:</strong> ${data.name}<br />
            <strong>الإيميل:</strong> <a href="mailto:${data.email}" style="color: #C89B5A;">${data.email}</a>
          </p>

          <h3 style="color: #1F1F1F; margin-top: 30px; border-bottom: 2px solid #C89B5A; padding-bottom: 8px;">
            الرسالة
          </h3>

          <div style="background: #FAFAF7; border-radius: 6px; padding: 20px; margin-top: 15px;">
            <p style="color: #1F1F1F; line-height: 1.7; white-space: pre-wrap; margin: 0; font-size: 15px;">
${data.message}
            </p>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="mailto:${data.email}?subject=رد على رسالتك - Mood" 
               style="display: inline-block; background: #1F1F1F; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              الرد على الرسالة
            </a>
          </div>
        </div>

        <div style="background: #FAFAF7; padding: 20px; text-align: center; color: #999; font-size: 12px; border-top: 1px solid #eee;">
          © ${new Date().getFullYear()} Mood. جميع الحقوق محفوظة.
        </div>
      </div>
    </body>
    </html>
  `;
}