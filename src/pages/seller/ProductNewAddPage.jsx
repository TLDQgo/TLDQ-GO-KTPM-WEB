import React, { useEffect, useState } from "react";
import axios from "axios";
import categoryApi from "../../api/categoryApi";
import productApi from "../../api/productApi";
export default function ProductNewAddPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false); // 🔥 state loading

  const [form, setForm] = useState({
    name: "",
    price: "",
    stock: "",
    category_id: "",
    description: "",
    images: [],
  });

  // 👉 load category từ API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryApi.getAll();

        console.log("Category API:", res);

        setCategories(res.data); // ⚠️ chú ý chỗ này
      } catch (err) {
        console.error("Lỗi load category:", err);
      }
    };

    fetchCategories();
  }, []);

  // 👉 handle change
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "images") {
      setForm({ ...form, images: files });
    } else {
      setForm({ ...form, [name]: value });
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true); // 🔥 bắt đầu loading

    try {
      const formData = new FormData();

      formData.append("name", form.name);
      formData.append("price", form.price);
      formData.append("stock_quantity", form.stock);
      formData.append("category_id", form.category_id);
      formData.append("seller_id", "123");
      formData.append("description", form.description);

      if (form.images && form.images.length > 0) {
        Array.from(form.images).forEach((file) => {
          formData.append("images", file);
        });
      }

      const res = await productApi.createProduct(formData);

      alert("✅ Thêm sản phẩm thành công");
      console.log("DATA:", res);

      setForm({
        name: "",
        price: "",
        stock: "",
        category_id: "",
        description: "",
        images: [],
      });
    } catch (err) {
      console.error("Lỗi:", err);
      alert("❌ Tạo sản phẩm thất bại");
    } finally {
      setLoading(false); // 🔥 dừng loading
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="bg-white p-6 rounded shadow max-w-4xl">
        <h1 className="text-xl font-semibold mb-6">Thêm sản phẩm mới</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* NAME */}
          <div>
            <label className="block mb-1 text-sm font-medium">
              Tên sản phẩm
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            />
          </div>

          {/* PRICE */}
          <div>
            <label className="block mb-1 text-sm font-medium">Giá</label>
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            />
          </div>

          {/* STOCK */}
          <div>
            <label className="block mb-1 text-sm font-medium">Số lượng</label>
            <input
              type="number"
              name="stock"
              value={form.stock}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            />
          </div>

          {/* CATEGORY (API) */}
          <div>
            <label className="block mb-1 text-sm font-medium">Danh mục</label>
            <select
              name="category_id"
              value={form.category_id}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            >
              <option value="">-- Chọn danh mục --</option>
              {categories.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          {/* IMAGE MULTIPLE */}
          <div>
            <label className="block mb-1 text-sm font-medium">
              Ảnh sản phẩm
            </label>
            <input
              type="file"
              name="images"
              multiple
              onChange={handleChange}
              className="w-full"
            />

            {/* preview */}
            <div className="flex gap-2 mt-3">
              {form.images &&
                Array.from(form.images).map((img, index) => (
                  <img
                    key={index}
                    src={URL.createObjectURL(img)}
                    alt=""
                    className="w-20 h-20 object-cover rounded"
                  />
                ))}
            </div>
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="block mb-1 text-sm font-medium">Mô tả</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              rows="4"
            />
          </div>

          {/* BUTTON */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 flex items-center gap-2"
            >
              {loading && (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              )}
              {loading ? "Đang lưu..." : "Lưu sản phẩm"}
            </button>

            <button
              type="button"
              className="border px-6 py-2 rounded"
              onClick={() => window.history.back()}
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
