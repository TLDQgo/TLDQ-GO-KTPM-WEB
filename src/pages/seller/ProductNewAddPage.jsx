import React, { useState } from "react";

export default function ProductNewAddPage() {
  const [form, setForm] = useState({
    name: "",
    price: "",
    stock: "",
    category: "",
    description: "",
    image: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image") {
      setForm({ ...form, image: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("DATA:", form);
    alert("Thêm sản phẩm thành công (demo)");
  };

  return (
    <div className=" bg-gray-100 min-h-screen">
      <div className="bg-white p-6 rounded shadow max-w-4xl ">
        {/* TITLE */}
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
              placeholder="Nhập tên sản phẩm..."
              required
            />
          </div>

          {/* PRICE */}
          <div>
            <label className="block mb-1 text-sm font-medium">Giá (VND)</label>
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              placeholder="Nhập giá..."
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
              placeholder="Nhập số lượng..."
              required
            />
          </div>

          {/* CATEGORY */}
          <div>
            <label className="block mb-1 text-sm font-medium">Danh mục</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            >
              <option value="">-- Chọn danh mục --</option>
              <option value="chair">Ghế</option>
              <option value="sofa">Sofa</option>
              <option value="table">Bàn</option>
              <option value="bed">Giường</option>
            </select>
          </div>

          {/* IMAGE */}
          <div>
            <label className="block mb-1 text-sm font-medium">
              Ảnh sản phẩm
            </label>
            <input
              type="file"
              name="image"
              onChange={handleChange}
              className="w-full"
            />

            {/* PREVIEW */}
            {form.image && (
              <img
                src={URL.createObjectURL(form.image)}
                alt="preview"
                className="mt-3 w-32 h-32 object-cover rounded"
              />
            )}
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
              placeholder="Mô tả sản phẩm..."
            />
          </div>

          {/* BUTTON */}
          <div className="flex gap-3">
            <button
              type="submit"
              className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600"
            >
              Lưu sản phẩm
            </button>

            <button
              type="button"
              className="border px-6 py-2 rounded hover:bg-gray-100"
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
