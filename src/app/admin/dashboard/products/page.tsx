"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAdmin } from "@/components/admin-context";
import { useProducts } from "@/components/products-context";
import type { Product } from "@/data/products";

type FormData = {
    name: string;
    nameEn: string;
    price: number;
    image: string;
    category: "men" | "women" | "kids";
    description: string;
    isFeatured: boolean;
};

const emptyForm: FormData = {
    name: "",
    nameEn: "",
    price: 0,
    image: "",
    category: "men",
    description: "",
    isFeatured: false,
};

export default function AdminProductsPage() {
    const router = useRouter();
    const { isLoggedIn } = useAdmin();
    const { products, addProduct, updateProduct, deleteProduct, resetProducts } = useProducts();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState<FormData>(emptyForm);
    const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

    useEffect(() => {
        if (!isLoggedIn) router.push("/admin");
    }, [isLoggedIn, router]);

    if (!isLoggedIn) return null;

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
            image: product.image,
            category: product.category,
            description: product.description,
            isFeatured: product.isFeatured || false,
        });
        setIsModalOpen(true);
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;
        if (type === "checkbox") {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData({ ...formData, [name]: checked });
        } else if (name === "price") {
            setFormData({ ...formData, price: Number(value) });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingId) {
            updateProduct(editingId, formData);
        } else {
            addProduct(formData);
        }
        setIsModalOpen(false);
        setFormData(emptyForm);
        setEditingId(null);
    };

    const handleDelete = (id: number) => {
        deleteProduct(id);
        setConfirmDeleteId(null);
    };

    return (
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
            {/* Header */}
            <div className="mb-8">
                <Link href="/admin/dashboard" className="text-sm text-muted hover:text-gold">
                    ← رجوع للوحة التحكم
                </Link>
            </div>

            <div className="flex items-center justify-between mb-8">
                <div>
                    <p className="text-gold text-xs font-medium tracking-widest uppercase mb-2">
                        Products
                    </p>
                    <h1 className="text-3xl md:text-4xl font-bold text-charcoal">
                        إدارة المنتجات
                    </h1>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={resetProducts}
                        className="text-sm text-muted hover:text-charcoal border border-charcoal/15 hover:border-charcoal/30 px-4 py-2 rounded-md transition-colors"
                    >
                        استرجاع الافتراضي
                    </button>
                    <button
                        onClick={openAdd}
                        className="bg-charcoal hover:bg-gold text-cream hover:text-charcoal font-medium px-5 py-2.5 rounded-md transition-colors text-sm"
                    >
                        + إضافة منتج
                    </button>
                </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-lg border border-charcoal/10 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-charcoal/5 border-b border-charcoal/10">
                        <tr>
                            <th className="text-right px-4 py-3 font-medium text-charcoal">الصورة</th>
                            <th className="text-right px-4 py-3 font-medium text-charcoal">الاسم</th>
                            <th className="text-right px-4 py-3 font-medium text-charcoal">السعر</th>
                            <th className="text-right px-4 py-3 font-medium text-charcoal">التصنيف</th>
                            <th className="text-right px-4 py-3 font-medium text-charcoal">مميز</th>
                            <th className="text-left px-4 py-3 font-medium text-charcoal">إجراءات</th>
                        </tr>
                        </thead>
                        <tbody>
                        {products.map((p) => (
                            <tr key={p.id} className="border-b border-charcoal/5 last:border-b-0 hover:bg-cream/50">
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
                                </td>
                                <td className="px-4 py-3 text-charcoal">{p.price} ج.م</td>
                                <td className="px-4 py-3 text-charcoal">
                                    {p.category === "men" ? "رجالي" : p.category === "women" ? "نسائي" : "أطفال"}
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
                        ))}
                        </tbody>
                    </table>
                </div>

                {products.length === 0 && (
                    <div className="p-12 text-center text-muted">
                        مفيش منتجات. اضغط "إضافة منتج" عشان تبدأ.
                    </div>
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
                        <div className="bg-cream rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto pointer-events-auto">
                            <div className="flex items-center justify-between p-6 border-b border-charcoal/10">
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

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-medium text-charcoal mb-2">
                                            السعر (ج.م) *
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
                                        رابط الصورة *
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

                                <div className="flex items-center gap-3">
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