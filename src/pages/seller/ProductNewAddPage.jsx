import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ImagePlus, X, Loader2 } from "lucide-react";
import categoryApi from "../../api/categoryApi";
import productApi from "../../api/productApi";
import useAuthStore from "../../store/useAuthStore";
import PriceInput from "../../components/common/PriceInput";

export default function ProductNewAddPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const sellerId = user?._id;

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [previews, setPreviews] = useState([]);

  const [form, setForm] = useState({
    name: "",
    price: "",
    stock: "",
    category_id: "",
    description: "",
    images: [],
  });

  useEffect(() => {
    categoryApi.getAll().then((res) => setCategories(res.data || [])).catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((err) => ({ ...err, [name]: "" }));
  };

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const newPreviews = files.map((f) => ({ file: f, url: URL.createObjectURL(f) }));
    setPreviews((p) => [...p, ...newPreviews]);
    setForm((f) => ({ ...f, images: [...f.images, ...files] }));
    if (errors.images) setErrors((err) => ({ ...err, images: "" }));
  };

  const removeImage = (idx) => {
    URL.revokeObjectURL(previews[idx].url);
    setPreviews((p) => p.filter((_, i) => i !== idx));
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Vui lòng nhập tên sản phẩm";
    if (!form.price || Number(form.price) <= 0) e.price = "Vui lòng nhập giá hợp lệ";
    if (!form.stock || Number(form.stock) < 0) e.stock = "Vui lòng nhập số lượng";
    if (!form.category_id) e.category_id = "Vui lòng chọn danh mục";
    if (form.images.length === 0) e.images = "Vui lòng thêm ít nhất 1 ảnh";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (!sellerId) { toast.error("Bạn chưa đăng nhập"); return; }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name.trim());
      fd.append("price", form.price);
      fd.append("stock_quantity", form.stock);
      fd.append("category_id", form.category_id);
      fd.append("seller_id", sellerId);
      fd.append("description", form.description.trim());
      form.images.forEach((f) => fd.append("images", f));

      await productApi.createProduct(fd);
      toast.success("Thêm sản phẩm thành công!");
      previews.forEach((p) => URL.revokeObjectURL(p.url));
      navigate("/seller/quan-ly-san-pham");
    } catch {
      toast.error("Tạo sản phẩm thất bại, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-xl font-bold text-gray-800">Thêm sản phẩm mới</h1>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="space-y-5">

          {/* SECTION: Thông tin cơ bản */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
            <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Thông tin cơ bản</h2>

            {/* Tên */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Tên sản phẩm <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="VD: Ghế gaming cao cấp XG-500"
                className={`w-full border rounded-lg px-3 py-2.5 text-sm outline-none transition ${
                  errors.name ? "border-red-400 bg-red-50" : "border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                }`}
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>

            {/* Danh mục */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Danh mục <span className="text-red-500">*</span>
              </label>
              <select
                name="category_id"
                value={form.category_id}
                onChange={handleChange}
                className={`w-full border rounded-lg px-3 py-2.5 text-sm outline-none transition ${
                  errors.category_id ? "border-red-400 bg-red-50" : "border-gray-300 hover:border-gray-400 focus:border-blue-500"
                }`}
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
              {errors.category_id && <p className="mt-1 text-xs text-red-500">{errors.category_id}</p>}
            </div>

            {/* Giá + Tồn kho — 2 cột */}
            <div className="grid grid-cols-2 gap-4">
              <PriceInput
                label="Giá bán"
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="VD: 350000"
                required
                error={errors.price}
              />
              <PriceInput
                label="Số lượng tồn kho"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                placeholder="VD: 100"
                required
                error={errors.stock}
                suffix="cái"
                showText={false}
              />
            </div>
          </div>

          {/* SECTION: Mô tả */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">Mô tả sản phẩm</h2>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Mô tả chi tiết về sản phẩm, chất liệu, kích thước, tính năng..."
              rows={5}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition resize-none"
            />
          </div>

          {/* SECTION: Ảnh */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">
              Ảnh sản phẩm <span className="text-red-500">*</span>
            </h2>

            <div className="flex flex-wrap gap-3">
              {previews.map((p, i) => (
                <div key={i} className="relative w-24 h-24 group">
                  <img src={p.url} alt="" className="w-full h-full object-cover rounded-lg border border-gray-200" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow"
                  >
                    <X size={11} />
                  </button>
                  {i === 0 && (
                    <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1.5 rounded">Ảnh bìa</span>
                  )}
                </div>
              ))}

              {previews.length < 5 && (
                <label className={`w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed rounded-lg cursor-pointer transition ${
                  errors.images ? "border-red-400 bg-red-50" : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                }`}>
                  <ImagePlus className="w-6 h-6 text-gray-400 mb-1" />
                  <span className="text-xs text-gray-400">Thêm ảnh</span>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleImages} />
                </label>
              )}
            </div>
            {errors.images && <p className="mt-2 text-xs text-red-500">{errors.images}</p>}
            <p className="mt-2 text-xs text-gray-400">Tối đa 5 ảnh. Ảnh đầu tiên là ảnh bìa hiển thị chính.</p>
          </div>

          {/* ACTIONS */}
          <div className="flex gap-3 pb-8">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-red-500 text-white text-sm font-semibold rounded-lg hover:bg-red-600 transition disabled:opacity-70"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Đang lưu..." : "Lưu sản phẩm"}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2.5 border border-gray-300 text-sm text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Hủy
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
