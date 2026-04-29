import React, { useEffect, useState } from "react";
import productApi from "../../api/productApi";
import useAuthStore from "../../store/useAuthStore";
import Modal from "../../components/common/Modal";

export default function ProductManagementSeller() {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editImage, setEditImage] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState("");
  const [editForm, setEditForm] = useState({
    name: "",
    price: "",
    stock_quantity: "",
    description: "",
  });
  const user = useAuthStore((s) => s.user);
  const sellerId = user?._id;

  // CALL API
  const fetchProducts = async (pageNumber = 1) => {
    if (!sellerId) return;
    try {
      const res = await productApi.getProductsBySeller(sellerId, pageNumber);

      console.log("API response:", res);

      setProducts(res.data);
      setPagination(res.pagination);
    } catch (error) {
      console.error("Lỗi fetch products:", error);
    }
  };

  useEffect(() => {
    fetchProducts(page);
  }, [page, sellerId]);
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xoá sản phẩm này?")) return;

    try {
      await productApi.delete(id);

      // 👉 update UI ngay (không cần gọi lại API)
      setProducts((prev) => prev.filter((item) => item._id !== id));

      alert("✅ Xoá thành công");
    } catch (error) {
      console.error("Lỗi xoá:", error);
      alert("❌ Xoá thất bại");
    }
  };

  const openEditModal = (item) => {
    setEditingProduct(item);
    setEditImage(null);
    setEditImagePreview(item.images?.[0] || "");
    setEditForm({
      name: item.name || "",
      price: item.price ?? "",
      stock_quantity: item.stock_quantity ?? "",
      description: item.description || "",
    });
    setIsEditOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files?.[0] || null;
    setEditImage(file);

    if (file) {
      setEditImagePreview(URL.createObjectURL(file));
      return;
    }

    setEditImagePreview(editingProduct?.images?.[0] || "");
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct?._id) return;

    try {
      const payload = new FormData();
      payload.append("name", editForm.name);
      payload.append("price", Number(editForm.price) || 0);
      payload.append("stock_quantity", Number(editForm.stock_quantity) || 0);
      payload.append("description", editForm.description);

      if (editImage) {
        payload.append("image", editImage);
      }

      const res = await productApi.update(editingProduct._id, payload);
      const updatedProduct = res?.data || payload;

      setProducts((prev) =>
        prev.map((item) =>
          item._id === editingProduct._id
            ? { ...item, ...updatedProduct, category_id: item.category_id }
            : item,
        ),
      );

      setIsEditOpen(false);
      setEditingProduct(null);
      setEditImage(null);
      setEditImagePreview("");
      alert("✅ Cập nhật sản phẩm thành công");
    } catch (error) {
      console.error("Lỗi cập nhật sản phẩm:", error);
      alert("❌ Cập nhật sản phẩm thất bại");
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Quản lý sản phẩm</h1>

        <div className="text-sm text-gray-500">
          Tổng sản phẩm:{" "}
          <span className="text-red-500">{pagination.totalItems || 0}</span>
        </div>
      </div>

      {/* ACTION */}
      <div className="flex justify-between items-center bg-white p-4 rounded shadow mb-4">
        <a
          href="/seller/them-san-pham"
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          + Thêm sản phẩm mới
        </a>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Sản phẩm</th>
              <th className="p-3">Giá</th>
              <th className="p-3">Danh mục</th>
              <th className="p-3">Số lượng</th>
              <th className="p-3">Thao tác</th>
            </tr>
          </thead>

          <tbody>
            {products.map((item) => (
              <tr key={item._id} className="border-t hover:bg-gray-50">
                <td className="p-3 flex gap-3 items-center">
                  <img
                    src={item.images?.[0]}
                    alt=""
                    className="w-16 h-16 object-cover rounded"
                  />
                  <span>{item.name}</span>
                </td>

                <td className="p-3 text-center text-red-500 font-semibold">
                  {item.price?.toLocaleString()}đ
                </td>

                <td className="p-3 text-center">
                  {item.category_id?.name || "Chưa có"}
                </td>

                <td className="p-3 text-center">{item.stock_quantity}</td>

                <td className="p-3">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => openEditModal(item)}
                      className="px-2 py-1 border rounded"
                    >
                      ✏️
                    </button>
                    <a
                      href={`/?productId=${item._id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-1 border rounded inline-flex items-center justify-center"
                      title="Xem bên phía user"
                    >
                      👁
                    </a>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="px-2 py-1 border text-red-500 rounded hover:bg-red-50"
                    >
                      🗑
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex justify-end mt-4 gap-2">
        {/* PREV */}
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="px-3 py-1 border rounded"
        >
          Prev
        </button>

        {/* PAGE NUMBERS */}
        {[...Array(pagination.totalPages || 1)].map((_, i) => (
          <button
            key={i}
            onClick={() => setPage(i + 1)}
            className={`px-3 py-1 border rounded ${page === i + 1 ? "bg-red-500 text-white" : ""
              }`}
          >
            {i + 1}
          </button>
        ))}

        {/* NEXT */}
        <button
          disabled={page === pagination.totalPages}
          onClick={() => setPage(page + 1)}
          className="px-3 py-1 border rounded"
        >
          Next
        </button>
      </div>

      <Modal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setEditImage(null);
          setEditImagePreview("");
        }}
        title="Cập nhật sản phẩm"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleUpdateProduct} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium">Tên sản phẩm</label>
            <input
              type="text"
              name="name"
              value={editForm.name}
              onChange={handleEditChange}
              className="w-full border p-2 rounded"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Giá</label>
            <input
              type="number"
              min="0"
              name="price"
              value={editForm.price}
              onChange={handleEditChange}
              className="w-full border p-2 rounded"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Số lượng</label>
            <input
              type="number"
              min="0"
              name="stock_quantity"
              value={editForm.stock_quantity}
              onChange={handleEditChange}
              className="w-full border p-2 rounded"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Mô tả</label>
            <textarea
              name="description"
              value={editForm.description}
              onChange={handleEditChange}
              className="w-full border p-2 rounded"
              rows={4}
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Ảnh sản phẩm (cập nhật 1 ảnh)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleEditImageChange}
              className="w-full"
            />

            {editImagePreview && (
              <img
                src={editImagePreview}
                alt="preview"
                className="w-24 h-24 object-cover rounded border mt-2"
              />
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditOpen(false)}
              className="px-4 py-2 border rounded"
            >
              Huỷ
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Lưu thay đổi
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
