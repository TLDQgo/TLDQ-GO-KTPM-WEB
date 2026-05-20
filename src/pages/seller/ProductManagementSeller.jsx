import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Pencil, ExternalLink, Trash2, Plus, PackageX, Loader2 } from "lucide-react";
import productApi from "../../api/productApi";
import useAuthStore from "../../store/useAuthStore";
import Modal from "../../components/common/Modal";
import PriceInput from "../../components/common/PriceInput";

const STATUS_BADGE = {
  approved: { text: "Đã duyệt", cls: "bg-green-100 text-green-700" },
  pending:  { text: "Chờ duyệt", cls: "bg-yellow-100 text-yellow-700" },
  rejected: { text: "Bị từ chối", cls: "bg-red-100 text-red-600" },
};

export default function ProductManagementSeller() {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editImage, setEditImage] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    price: "",
    stock_quantity: "",
    description: "",
  });

  const user = useAuthStore((s) => s.user);
  const sellerId = user?._id;

  const fetchProducts = async (pageNumber = 1) => {
    if (!sellerId) return;
    try {
      const res = await productApi.getProductsBySeller(sellerId, pageNumber);
      const list = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.products)
        ? res.data.products
        : [];
      setProducts(list);
      setPagination(res.pagination || {});
    } catch {
      toast.error("Không thể tải danh sách sản phẩm");
    }
  };

  useEffect(() => {
    fetchProducts(page);
  }, [page, sellerId]);

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xoá sản phẩm này?")) return;
    try {
      await productApi.delete(id);
      setProducts((prev) => prev.filter((item) => item._id !== id));
      toast.success("Xoá sản phẩm thành công");
    } catch {
      toast.error("Xoá sản phẩm thất bại");
    }
  };

  const openEditModal = (item) => {
    setEditingProduct(item);
    setEditImage(null);
    setEditImagePreview(item.images?.[0] || "");
    setEditForm({
      name: item.name || "",
      price: String(item.price ?? ""),
      stock_quantity: String(item.stock_quantity ?? ""),
      description: item.description || "",
    });
    setIsEditOpen(true);
  };

  const closeEditModal = () => {
    setIsEditOpen(false);
    setEditingProduct(null);
    setEditImage(null);
    setEditImagePreview("");
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files?.[0] || null;
    setEditImage(file);
    setEditImagePreview(file ? URL.createObjectURL(file) : (editingProduct?.images?.[0] || ""));
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct?._id) return;
    setSaving(true);
    try {
      const payload = new FormData();
      payload.append("name", editForm.name.trim());
      payload.append("price", Number(editForm.price) || 0);
      payload.append("stock_quantity", Number(editForm.stock_quantity) || 0);
      payload.append("description", editForm.description.trim());
      if (editImage) payload.append("image", editImage);

      const res = await productApi.update(editingProduct._id, payload);
      const updated = res?.data || {};

      setProducts((prev) =>
        prev.map((item) =>
          item._id === editingProduct._id
            ? { ...item, ...updated, category_id: item.category_id }
            : item,
        ),
      );
      toast.success("Cập nhật sản phẩm thành công");
      closeEditModal();
    } catch {
      toast.error("Cập nhật sản phẩm thất bại");
    } finally {
      setSaving(false);
    }
  };

  const totalPages = pagination.totalPages || 1;

  return (
    <div className="max-w-6xl mx-auto">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">Quản lý sản phẩm</h1>
        <span className="text-sm text-gray-500">
          Tổng: <span className="font-semibold text-red-500">{pagination.totalItems || products.length}</span> sản phẩm
        </span>
      </div>

      {/* ACTION BAR */}
      <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-100 px-5 py-3 mb-5">
        <Link
          to="/seller/them-san-pham"
          className="flex items-center gap-2 bg-red-500 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-red-600 transition"
        >
          <Plus size={16} />
          Thêm sản phẩm mới
        </Link>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <PackageX className="w-12 h-12 mb-3 text-gray-300" />
            <p className="text-sm font-medium">Chưa có sản phẩm nào</p>
            <p className="text-xs mt-1">Bắt đầu bằng cách thêm sản phẩm mới</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Sản phẩm</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-600">Giá</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-600">Danh mục</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-600">Tồn kho</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-600">Trạng thái</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-600">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((item) => {
                const badge = STATUS_BADGE[item.status] || STATUS_BADGE.pending;
                return (
                  <tr key={item._id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {item.images?.[0] ? (
                          <img
                            src={item.images[0]}
                            alt=""
                            className="w-12 h-12 object-cover rounded-lg border border-gray-100 shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gray-100 shrink-0" />
                        )}
                        <span className="font-medium text-gray-800 line-clamp-2">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-red-500">
                      {Number(item.price || 0).toLocaleString("vi-VN")}đ
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600">
                      {item.category_id?.name || <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-700">
                      {item.stock_quantity ?? 0}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${badge.cls}`}>
                        {badge.text}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition"
                          title="Chỉnh sửa"
                        >
                          <Pencil size={15} />
                        </button>
                        <a
                          href={`/san-pham/${item._id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition inline-flex"
                          title="Xem trang sản phẩm"
                        >
                          <ExternalLink size={15} />
                        </a>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                          title="Xoá sản phẩm"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-end items-center mt-4 gap-1.5">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50 transition"
          >
            Trước
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1.5 text-sm border rounded-lg transition ${
                page === i + 1
                  ? "bg-red-500 text-white border-red-500"
                  : "hover:bg-gray-50"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50 transition"
          >
            Sau
          </button>
        </div>
      )}

      {/* EDIT MODAL */}
      <Modal
        isOpen={isEditOpen}
        onClose={closeEditModal}
        title="Chỉnh sửa sản phẩm"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleUpdateProduct} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Tên sản phẩm <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={editForm.name}
              onChange={handleEditChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <PriceInput
              label="Giá bán"
              name="price"
              value={editForm.price}
              onChange={handleEditChange}
              required
            />
            <PriceInput
              label="Tồn kho"
              name="stock_quantity"
              value={editForm.stock_quantity}
              onChange={handleEditChange}
              required
              suffix="cái"
              showText={false}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Mô tả</label>
            <textarea
              name="description"
              value={editForm.description}
              onChange={handleEditChange}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Cập nhật ảnh bìa
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleEditImageChange}
              className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 cursor-pointer"
            />
            {editImagePreview && (
              <img
                src={editImagePreview}
                alt="preview"
                className="w-20 h-20 object-cover rounded-lg border border-gray-200 mt-2"
              />
            )}
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={closeEditModal}
              className="px-4 py-2 border border-gray-300 text-sm text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-70"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
