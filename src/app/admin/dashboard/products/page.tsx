"use client";

import { useState, useEffect } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAdmin } from "@/components/admin-context";
import { useProducts } from "@/components/products-context";
import { useToast } from "@/components/toast-context";
import type {
    Product,
    ProductSizes,
    ProductColorVariant,
} from "@/data/products";

type FormData = {
    name: string;
    nameEn: string;
    price: number;
    salePrice: number | null;
    image: string;
    category: "men" | "women" | "kids";
    description: string;
    isFeatured: boolean;
    sizes: ProductSizes;
    colors: ProductColorVariant[];
};

const emptySizes: ProductSizes = { S: 0, M: 0, L: 0, XL: 0, XXL: 0 };

const emptyForm: FormData = {
    name: "",
    nameEn: "",
    price: 0,
    salePrice: null,
    image: "",
    category: "men",
    description: "",
    isFeatured: false,
    sizes: { ...emptySizes },
    colors: [],
};

const SIZE_KEYS: Array<keyof ProductSizes> = ["S", "M", "L", "XL", "XXL"];

function calcTotal(sizes: ProductSizes, colors: ProductColorVariant[]): number {
    if (colors.length > 0) {
        return colors.reduce(
            (total, c) =>
                total +
                Object.values(c.sizes || emptySizes).reduce((a, b) => a + b, 0),
            0
        );
    }
    return Object.values(sizes).reduce((a, b) => a + b, 0);
}

export default function AdminProductsPage() {
    const router = useRouter();
    const { isLoggedIn } = useAdmin();
    const { showToast } = useToast();
    const { products, addProduct, updateProduct, deleteProduct } = useProducts();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState<FormData>(emptyForm);
    const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

    useEffect(() => {
        if (!isLoggedIn) router.push("/admin");
    }, [isLoggedIn, router]);

    if (!isLoggedIn) return null;

    const hasColors = formData.colors.length > 0;
    const totalStock = calcTotal(formData.sizes, formData.colors);

    const openAdd = () => {
        setEditingId(null);
        setFormData(emptyForm);
        setIsModalOpen(true);
    };

    const openEdit = (product: Product) => {
        setEditingId(product.id);
        setFormData({
            name: product.name,
            nameEn: product.nameEn,
            price: product.price,
            salePrice: product.salePrice ?? null,
            image: product.image,
            category: product.category,
            description: product.description,
            isFeatured: product.isFeatured || false,
            sizes: product.sizes || { ...emptySizes },
            colors: product.colors || [],
        });
        setIsModalOpen(true);
    };

    const handleChange = (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;
        if (type === "checkbox") {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData({ ...formData, [name]: checked });
        } else if (name === "price") {
            setFormData({ ...formData, price: Number(value) });
        } else if (name === "salePrice") {
            const num = value === "" ? null : Number(value);
            setFormData({ ...formData, salePrice: num });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSizeChange = (size: keyof ProductSizes, value: number) => {
        setFormData({
            ...formData,
            sizes: { ...formData.sizes, [size]: Math.max(0, value) },
        });
    };

    const addColor = () => {
        setFormData({
            ...formData,
            colors: [
                ...formData.colors,
                {
                    name: "",
                    hex: "#000000",
                    image: formData.image || "",
                    sizes: { ...emptySizes },
                },
            ],
        });
    };

    const updateColor = (
        idx: number,
        field: "name" | "hex" | "image",
        value: string
    ) => {
        const newColors = [...formData.colors];
        newColors[idx] = { ...newColors[idx], [field]: value };
        setFormData({ ...formData, colors: newColors });
    };

    const updateColorSize = (
        idx: number,
        size: keyof ProductSizes,
        value: number
    ) => {
        const newColors = [...formData.colors];
        newColors[idx] = {
            ...newColors[idx],
            sizes: {
                ...newColors[idx].sizes,
                [size]: Math.max(0, value),
            },
        };
        setFormData({ ...formData, colors: newColors });
    };

    const removeColor = (idx: number) => {
        setFormData({
            ...formData,
            colors: formData.colors.filter((_, i) => i !== idx),
        });
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        // Validate sale price
        if (
            formData.salePrice !== null &&
            formData.salePrice >= formData.price
        ) {
            showToast("سعر الخصم لازم يكون أقل من السعر الأصلي", "error");
            return;
        }

        const incompleteColors: string[] = [];
        formData.colors.forEach((c, i) => {
            if (!c.name.trim() || !c.image.trim()) {
                incompleteColors.push(`لون رقم ${i + 1}`);
            }
        });

        if (incompleteColors.length > 0) {
            showToast(
                `الألوان دي ناقصة: ${incompleteColors.join(", ")}`,
                "error"
            );
            return;
        }

        const productData = {
            ...formData,
            stock: totalStock,
        };

        if (editingId) {
            updateProduct(editingId, productData);
            showToast("تم حفظ التعديلات بنجاح", "success");
        } else {
            addProduct(productData);
            showToast("تم إضافة المنتج بنجاح", "success");
        }
        setIsModalOpen(false);
        setFormData(emptyForm);
        setEditingId(null);
    };

    const handleDelete = (id: number) => {
        deleteProduct(id);
        setConfirmDeleteId(null);
        showToast("تم حذف المنتج", "success");
    };

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12">
            {/* Header */}
            <div className="mb-6 md:mb-8">
                <Link href="/admin/dashboard" className="text-sm text-muted hover:text-gold">
                    ← رجوع للوحة التحكم
                </Link>
            </div>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 md:mb-8">
                <div>
                    <p className="text-gold text-xs font-medium tracking-widest uppercase mb-2">
                        Products
                    </p>
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-charcoal">
                        إدارة المنتجات
                    </h1>
                </div>
                <button
                    onClick={openAdd}
                    className="bg-charcoal hover:bg-gold text-cream hover:text-charcoal font-medium px-5 py-2.5 rounded-md transition-colors text-sm self-start md:self-auto"
                >
                    + إضافة منتج
                </button>
            </div>

            {/* ===== DESKTOP: Table ===== */}
            <div className="hidden md:block bg-white rounded-lg border border-charcoal/10 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-charcoal/5 border-b border-charcoal/10">
                        <tr>
                            <th className="text-right px-4 py-3 font-medium text-charcoal">الصورة</th>
                            <th className="text-right px-4 py-3 font-medium text-charcoal">الاسم</th>
                            <th className="text-right px-4 py-3 font-medium text-charcoal">السعر</th>
                            <th className="text-right px-4 py-3 font-medium text-charcoal">المتغيرات</th>
                            <th className="text-right px-4 py-3 font-medium text-charcoal">الإجمالي</th>
                            <th className="text-right px-4 py-3 font-medium text-charcoal">مميز</th>
                            <th className="text-left px-4 py-3 font-medium text-charcoal">إجراءات</th>
                        </tr>
                        </thead>
                        <tbody>
                        {products.map((p) => {
                            const sizes = p.sizes || emptySizes;
                            const colors = p.colors || [];
                            const total = calcTotal(sizes, colors);
                            const hasSale =
                                p.salePrice != null && p.salePrice < p.price;
                            return (
                                <tr
                                    key={p.id}
                                    className="border-b border-charcoal/5 last:border-b-0 hover:bg-cream/50 align-top"
                                >
                                    <td className="px-4 py-3">
                                        <div className="w-12 h-14 rounded-md overflow-hidden bg-cream">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={p.image}
                                                alt={p.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="font-medium text-charcoal">{p.name}</p>
                                        <p className="text-xs text-muted">{p.nameEn}</p>
                                        <p className="text-xs text-muted mt-1">
                                            {p.category === "men"
                                                ? "رجالي"
                                                : p.category === "women"
                                                    ? "نسائي"
                                                    : "أطفال"}
                                        </p>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        {hasSale ? (
                                            <div>
                                                <p className="text-error font-bold">
                                                    {p.salePrice} ج.م
                                                </p>
                                                <p className="text-xs text-muted line-through">
                                                    {p.price} ج.م
                                                </p>
                                            </div>
                                        ) : (
                                            <span className="text-charcoal">{p.price} ج.م</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        {colors.length > 0 ? (
                                            <div className="space-y-1.5 min-w-[200px]">
                                                {colors.map((c, i) => {
                                                    const colorTotal = Object.values(
                                                        c.sizes || emptySizes
                                                    ).reduce((a, b) => a + b, 0);
                                                    return (
                                                        <div key={i} className="flex items-center gap-2">
                                <span
                                    className="w-4 h-4 rounded-full border border-charcoal/20 flex-shrink-0"
                                    style={{ backgroundColor: c.hex }}
                                />
                                                            <span className="text-xs text-charcoal font-medium">
                                  {c.name}:
                                </span>
                                                            <span className="text-xs text-muted">
                                  {colorTotal}
                                </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="flex flex-wrap gap-1 min-w-[200px]">
                                                {SIZE_KEYS.map((size) => {
                                                    const qty = sizes[size] || 0;
                                                    return (
                                                        <span
                                                            key={size}
                                                            className={`text-xs px-2 py-0.5 rounded ${
                                                                qty === 0
                                                                    ? "bg-charcoal/5 text-charcoal/30"
                                                                    : "bg-charcoal/10 text-charcoal"
                                                            }`}
                                                        >
                                {size}: {qty}
                              </span>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        {total === 0 ? (
                                            <span className="text-error font-medium">نفد</span>
                                        ) : total < 10 ? (
                                            <span className="text-gold font-medium">{total}</span>
                                        ) : (
                                            <span className="text-charcoal font-medium">{total}</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        {p.isFeatured ? (
                                            <span className="text-gold">★</span>
                                        ) : (
                                            <span className="text-muted">—</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-left">
                                        <div className="flex items-center gap-3 justify-end">
                                            <button
                                                onClick={() => openEdit(p)}
                                                className="text-charcoal hover:text-gold transition-colors text-xs font-medium"
                                            >
                                                تعديل
                                            </button>
                                            <button
                                                onClick={() => setConfirmDeleteId(p.id)}
                                                className="text-error hover:underline text-xs font-medium"
                                            >
                                                حذف
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>
                {products.length === 0 && (
                    <div className="p-12 text-center text-muted">
                        مفيش منتجات. اضغط &quot;إضافة منتج&quot; عشان تبدأ.
                    </div>
                )}
            </div>

            {/* ===== MOBILE: Cards ===== */}
            <div className="md:hidden space-y-3">
                {products.length === 0 ? (
                    <div className="p-8 text-center text-muted bg-white rounded-lg border border-charcoal/10">
                        مفيش منتجات. اضغط &quot;إضافة منتج&quot; عشان تبدأ.
                    </div>
                ) : (
                    products.map((p) => {
                        const sizes = p.sizes || emptySizes;
                        const colors = p.colors || [];
                        const total = calcTotal(sizes, colors);
                        const hasSale =
                            p.salePrice != null && p.salePrice < p.price;
                        return (
                            <div
                                key={p.id}
                                className="bg-white rounded-lg border border-charcoal/10 p-4"
                            >
                                <div className="flex gap-3 mb-3">
                                    <div className="w-16 h-20 rounded-md overflow-hidden bg-cream flex-shrink-0">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={p.image}
                                            alt={p.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <p className="font-medium text-charcoal text-sm truncate">
                                                    {p.name}
                                                </p>
                                                <p className="text-xs text-muted truncate">{p.nameEn}</p>
                                            </div>
                                            {p.isFeatured && (
                                                <span className="text-gold text-sm flex-shrink-0">★</span>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted mt-1">
                                            {p.category === "men"
                                                ? "رجالي"
                                                : p.category === "women"
                                                    ? "نسائي"
                                                    : "أطفال"}
                                        </p>
                                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                                            {hasSale ? (
                                                <>
                          <span className="text-sm font-bold text-error">
                            {p.salePrice} ج.م
                          </span>
                                                    <span className="text-xs text-muted line-through">
                            {p.price} ج.م
                          </span>
                                                </>
                                            ) : (
                                                <span className="text-sm font-bold text-charcoal">
                          {p.price} ج.م
                        </span>
                                            )}
                                            <span
                                                className={`text-xs px-2 py-0.5 rounded-full ${
                                                    total === 0
                                                        ? "bg-error/10 text-error"
                                                        : total < 10
                                                            ? "bg-gold/20 text-gold-dark"
                                                            : "bg-success/10 text-success"
                                                }`}
                                            >
                        {total === 0 ? "نفد" : `${total} متوفر`}
                      </span>
                                        </div>
                                    </div>
                                </div>

                                {colors.length > 0 ? (
                                    <div className="mb-3 pb-3 border-t border-charcoal/10 pt-3">
                                        <p className="text-xs text-muted mb-2">الألوان:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {colors.map((c, i) => {
                                                const colorTotal = Object.values(
                                                    c.sizes || emptySizes
                                                ).reduce((a, b) => a + b, 0);
                                                return (
                                                    <div
                                                        key={i}
                                                        className="flex items-center gap-1.5 bg-cream rounded-full px-2 py-1"
                                                    >
                            <span
                                className="w-3 h-3 rounded-full border border-charcoal/20"
                                style={{ backgroundColor: c.hex }}
                            />
                                                        <span className="text-xs text-charcoal">
                              {c.name}
                            </span>
                                                        <span className="text-xs text-muted">
                              ({colorTotal})
                            </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mb-3 pb-3 border-t border-charcoal/10 pt-3">
                                        <p className="text-xs text-muted mb-2">المقاسات:</p>
                                        <div className="flex flex-wrap gap-1">
                                            {SIZE_KEYS.map((size) => {
                                                const qty = sizes[size] || 0;
                                                return (
                                                    <span
                                                        key={size}
                                                        className={`text-xs px-2 py-0.5 rounded ${
                                                            qty === 0
                                                                ? "bg-charcoal/5 text-charcoal/30"
                                                                : "bg-charcoal/10 text-charcoal"
                                                        }`}
                                                    >
                            {size}: {qty}
                          </span>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => openEdit(p)}
                                        className="flex-1 bg-charcoal hover:bg-gold text-cream hover:text-charcoal text-xs font-medium py-2 rounded-md transition-colors"
                                    >
                                        تعديل
                                    </button>
                                    <button
                                        onClick={() => setConfirmDeleteId(p.id)}
                                        className="flex-1 border border-error/30 text-error hover:bg-error/10 text-xs font-medium py-2 rounded-md transition-colors"
                                    >
                                        حذف
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <>
                    <div
                        onClick={() => setIsModalOpen(false)}
                        className="fixed inset-0 bg-charcoal/50 z-[80]"
                    />
                    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 pointer-events-none">
                        <div className="bg-cream rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto pointer-events-auto">
                            <div className="flex items-center justify-between p-6 border-b border-charcoal/10 sticky top-0 bg-cream z-10">
                                <h2 className="text-xl font-bold text-charcoal">
                                    {editingId ? "تعديل منتج" : "إضافة منتج جديد"}
                                </h2>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-2 text-charcoal hover:text-gold"
                                    aria-label="Close"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-medium text-charcoal mb-2">
                                            الاسم (عربي) *
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            required
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-md border border-charcoal/15 bg-white text-sm text-charcoal focus:outline-none focus:border-gold"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-charcoal mb-2">
                                            الاسم (إنجليزي) *
                                        </label>
                                        <input
                                            type="text"
                                            name="nameEn"
                                            required
                                            value={formData.nameEn}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-md border border-charcoal/15 bg-white text-sm text-charcoal focus:outline-none focus:border-gold"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                    <div>
                                        <label className="block text-sm font-medium text-charcoal mb-2">
                                            السعر الأصلي (ج.م) *
                                        </label>
                                        <input
                                            type="number"
                                            name="price"
                                            required
                                            min="0"
                                            value={formData.price}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-md border border-charcoal/15 bg-white text-sm text-charcoal focus:outline-none focus:border-gold"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-charcoal mb-2">
                                            سعر الخصم (ج.م)
                                        </label>
                                        <input
                                            type="number"
                                            name="salePrice"
                                            min="0"
                                            value={formData.salePrice ?? ""}
                                            onChange={handleChange}
                                            placeholder="اتركه فاضي لو مفيش خصم"
                                            className="w-full px-4 py-3 rounded-md border border-charcoal/15 bg-white text-sm text-charcoal focus:outline-none focus:border-gold"
                                        />
                                        {formData.salePrice !== null &&
                                            formData.salePrice >= formData.price && (
                                                <p className="text-xs text-error mt-1">
                                                    سعر الخصم لازم أقل من السعر الأصلي
                                                </p>
                                            )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-charcoal mb-2">
                                            التصنيف *
                                        </label>
                                        <select
                                            name="category"
                                            required
                                            value={formData.category}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-md border border-charcoal/15 bg-white text-sm text-charcoal focus:outline-none focus:border-gold"
                                        >
                                            <option value="men">رجالي</option>
                                            <option value="women">نسائي</option>
                                            <option value="kids">أطفال</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-charcoal mb-2">
                                        الصورة الرئيسية *
                                    </label>
                                    <input
                                        type="url"
                                        name="image"
                                        required
                                        value={formData.image}
                                        onChange={handleChange}
                                        placeholder="https://..."
                                        className="w-full px-4 py-3 rounded-md border border-charcoal/15 bg-white text-sm text-charcoal focus:outline-none focus:border-gold"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-charcoal mb-2">
                                        الوصف *
                                    </label>
                                    <textarea
                                        name="description"
                                        required
                                        rows={3}
                                        value={formData.description}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-md border border-charcoal/15 bg-white text-sm text-charcoal focus:outline-none focus:border-gold resize-none"
                                    />
                                </div>

                                {/* Colors Section */}
                                <div className="border-t border-charcoal/10 pt-5">
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <label className="block text-sm font-medium text-charcoal">
                                                الألوان والمقاسات
                                            </label>
                                            <p className="text-xs text-muted mt-1">
                                                {hasColors
                                                    ? "كل لون له مخزونه المستقل لكل مقاس"
                                                    : "لو مش هتضيف ألوان، استخدم المقاسات تحت"}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={addColor}
                                            className="text-sm text-gold hover:text-gold-dark font-medium whitespace-nowrap"
                                        >
                                            + إضافة لون
                                        </button>
                                    </div>

                                    {hasColors && (
                                        <div className="space-y-4 mb-4">
                                            {formData.colors.map((color, idx) => {
                                                const colorTotal = Object.values(color.sizes).reduce(
                                                    (a, b) => a + b,
                                                    0
                                                );
                                                return (
                                                    <div
                                                        key={idx}
                                                        className="bg-white rounded-md border border-charcoal/10 p-4"
                                                    >
                                                        <div className="grid grid-cols-12 gap-3 items-start mb-4">
                                                            <div className="col-span-12 md:col-span-1 flex items-center justify-center">
                                <span
                                    className="w-12 h-12 rounded-full border-2 border-charcoal/20"
                                    style={{ backgroundColor: color.hex }}
                                />
                                                            </div>

                                                            <div className="col-span-6 md:col-span-3">
                                                                <label className="block text-xs text-muted mb-1">
                                                                    اسم اللون *
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={color.name}
                                                                    onChange={(e) =>
                                                                        updateColor(idx, "name", e.target.value)
                                                                    }
                                                                    placeholder="أبيض"
                                                                    className="w-full px-3 py-2 rounded-md border border-charcoal/15 bg-white text-xs text-charcoal focus:outline-none focus:border-gold"
                                                                />
                                                            </div>

                                                            <div className="col-span-6 md:col-span-3">
                                                                <label className="block text-xs text-muted mb-1">
                                                                    اللون
                                                                </label>
                                                                <div className="flex items-center gap-1">
                                                                    <input
                                                                        type="color"
                                                                        value={color.hex}
                                                                        onChange={(e) =>
                                                                            updateColor(idx, "hex", e.target.value)
                                                                        }
                                                                        className="w-9 h-9 rounded border border-charcoal/15 cursor-pointer flex-shrink-0"
                                                                    />
                                                                    <input
                                                                        type="text"
                                                                        value={color.hex}
                                                                        onChange={(e) =>
                                                                            updateColor(idx, "hex", e.target.value)
                                                                        }
                                                                        className="flex-1 min-w-0 px-2 py-2 rounded-md border border-charcoal/15 bg-white text-xs text-charcoal focus:outline-none focus:border-gold"
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className="col-span-12 md:col-span-5">
                                                                <label className="block text-xs text-muted mb-1">
                                                                    صورة اللون *
                                                                </label>
                                                                <div className="flex items-center gap-2">
                                                                    <input
                                                                        type="url"
                                                                        value={color.image}
                                                                        onChange={(e) =>
                                                                            updateColor(idx, "image", e.target.value)
                                                                        }
                                                                        placeholder="https://..."
                                                                        className="flex-1 min-w-0 px-3 py-2 rounded-md border border-charcoal/15 bg-white text-xs text-charcoal focus:outline-none focus:border-gold"
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeColor(idx)}
                                                                        className="p-2 text-error hover:bg-error/10 rounded-md transition-colors flex-shrink-0"
                                                                        aria-label="حذف اللون"
                                                                    >
                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                                                            <polyline points="3 6 5 6 21 6" />
                                                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                                                        </svg>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <div className="flex items-center justify-between mb-2">
                                                                <label className="text-xs font-medium text-charcoal">
                                                                    مخزون كل مقاس
                                                                </label>
                                                                <span className="text-xs text-gold font-bold">
                                  الإجمالي: {colorTotal}
                                </span>
                                                            </div>
                                                            <div className="grid grid-cols-5 gap-2">
                                                                {SIZE_KEYS.map((size) => (
                                                                    <div key={size}>
                                                                        <label className="block text-[10px] text-center text-muted mb-1">
                                                                            {size}
                                                                        </label>
                                                                        <input
                                                                            type="number"
                                                                            min="0"
                                                                            value={color.sizes[size]}
                                                                            onChange={(e) =>
                                                                                updateColorSize(
                                                                                    idx,
                                                                                    size,
                                                                                    Number(e.target.value)
                                                                                )
                                                                            }
                                                                            className="w-full px-1.5 py-2 rounded-md border border-charcoal/15 bg-white text-xs text-charcoal text-center focus:outline-none focus:border-gold"
                                                                        />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {!hasColors && (
                                        <div className="bg-white rounded-md border border-charcoal/10 p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="text-xs font-medium text-charcoal">
                                                    مخزون كل مقاس
                                                </label>
                                                <span className="text-xs text-gold font-bold">
                          الإجمالي: {totalStock}
                        </span>
                                            </div>
                                            <div className="grid grid-cols-5 gap-3">
                                                {SIZE_KEYS.map((size) => (
                                                    <div key={size}>
                                                        <label className="block text-xs text-center font-medium text-charcoal mb-1.5">
                                                            {size}
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={formData.sizes[size]}
                                                            onChange={(e) =>
                                                                handleSizeChange(size, Number(e.target.value))
                                                            }
                                                            className="w-full px-2 py-2.5 rounded-md border border-charcoal/15 bg-white text-sm text-charcoal text-center focus:outline-none focus:border-gold"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-3 pt-3 border-t border-charcoal/10">
                                    <input
                                        type="checkbox"
                                        id="isFeatured"
                                        name="isFeatured"
                                        checked={formData.isFeatured}
                                        onChange={handleChange}
                                        className="w-4 h-4 accent-gold"
                                    />
                                    <label htmlFor="isFeatured" className="text-sm text-charcoal cursor-pointer">
                                        منتج مميز (هيظهر في الصفحة الرئيسية)
                                    </label>
                                </div>

                                <div className="flex gap-3 pt-3 border-t border-charcoal/10">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-charcoal hover:bg-gold text-cream hover:text-charcoal font-semibold h-12 rounded-md transition-colors"
                                    >
                                        {editingId ? "حفظ التعديلات" : "إضافة المنتج"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-6 border border-charcoal/15 hover:border-charcoal/30 text-charcoal font-medium rounded-md transition-colors"
                                    >
                                        إلغاء
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </>
            )}

            {/* Delete Confirmation */}
            {confirmDeleteId !== null && (
                <>
                    <div
                        onClick={() => setConfirmDeleteId(null)}
                        className="fixed inset-0 bg-charcoal/50 z-[100]"
                    />
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 pointer-events-none">
                        <div className="bg-cream rounded-lg shadow-2xl w-full max-w-sm p-6 pointer-events-auto">
                            <h3 className="text-lg font-bold text-charcoal mb-3">
                                تأكيد الحذف
                            </h3>
                            <p className="text-sm text-muted mb-6">
                                إنت متأكد إنك عايز تحذف المنتج ده؟ الخطوة دي مش هتقدر ترجع فيها.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleDelete(confirmDeleteId)}
                                    className="flex-1 bg-error hover:bg-error/90 text-white font-semibold h-11 rounded-md transition-colors"
                                >
                                    نعم، احذف
                                </button>
                                <button
                                    onClick={() => setConfirmDeleteId(null)}
                                    className="flex-1 border border-charcoal/15 hover:border-charcoal/30 text-charcoal font-medium rounded-md transition-colors"
                                >
                                    إلغاء
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}