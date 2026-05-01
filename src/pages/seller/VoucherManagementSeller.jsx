import React, { useEffect, useMemo, useState } from "react";
import Modal from "../../components/common/Modal";
import productApi from "../../api/productApi";
import voucherApi from "../../api/voucherApi";
import useAuthStore from "../../store/useAuthStore";

const createInitialForm = () => ({
  name: "",
  start_date: "",
  end_date: "",
  discount_percent: "",
  quantity: "",
  apply_scope: "all",
});

const DATE_TIME_ZONE = "Asia/Ho_Chi_Minh";
const DATE_TIME_ZONE_OFFSET = "+07:00";

const toDateTimeLocal = (value) => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: DATE_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${map.year}-${map.month}-${map.day}T${map.hour}:${map.minute}`;
};

const toDateTimePayload = (value) => {
  if (!value) return "";

  return `${value}:00${DATE_TIME_ZONE_OFFSET}`;
};

const formatDateTimeDisplay = (value) => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: DATE_TIME_ZONE,
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
};

function ProductPickerModal({ isOpen, onClose, title, products, selectedProductIds, onToggle }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="max-w-3xl"
    >
      <div className="space-y-3">
        {products.length === 0 ? (
          <p className="text-sm text-gray-500">Không có sản phẩm để chọn.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto pr-1">
            {products.map((item) => {
              const checked = selectedProductIds.includes(item._id);

              return (
                <label
                  key={item._id}
                  className={`border rounded p-2 flex items-center gap-2 cursor-pointer ${checked ? "border-red-400 bg-red-50" : "bg-white"}`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggle(item._id)}
                  />
                  <img
                    src={item.images?.[0]}
                    alt=""
                    className="w-12 h-12 rounded object-cover"
                  />
                  <div className="min-w-0">
                    <p className="text-sm truncate">{item.name}</p>
                    <p className="text-xs text-gray-500">
                      {Number(item.price || 0).toLocaleString()}đ
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t">
          <button
            type="button"
            className="px-3 py-2 border rounded"
            onClick={onClose}
          >
            Đóng
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default function VoucherManagementSeller() {
  const user = useAuthStore((s) => s.user);
  const sellerId = user?._id;

  const [products, setProducts] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [isPickingProducts, setIsPickingProducts] = useState(false);
  const [isEditPickingProducts, setIsEditPickingProducts] = useState(false);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [form, setForm] = useState(createInitialForm());
  const [selectedProductIds, setSelectedProductIds] = useState([]);

  const [editForm, setEditForm] = useState(createInitialForm());
  const [editSelectedProductIds, setEditSelectedProductIds] = useState([]);
  const [editingVoucher, setEditingVoucher] = useState(null);

  const selectedProducts = useMemo(
    () => products.filter((p) => selectedProductIds.includes(p._id)),
    [products, selectedProductIds],
  );

  const editSelectedProducts = useMemo(
    () => products.filter((p) => editSelectedProductIds.includes(p._id)),
    [products, editSelectedProductIds],
  );

  const fetchProducts = async () => {
    if (!sellerId) return;
    try {
      const res = await productApi.getProductsBySeller(sellerId, 1);
      setProducts(res?.data || []);
    } catch (error) {
      console.error("Lỗi load products:", error);
    }
  };

  const fetchVouchers = async () => {
    if (!sellerId) return;
    try {
      const res = await voucherApi.getBySeller(sellerId);
      setVouchers(res?.data || []);
    } catch (error) {
      console.error("Lỗi load vouchers:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchVouchers();
  }, [sellerId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleScopeChange = (scope) => {
    setForm((prev) => ({ ...prev, apply_scope: scope }));
    if (scope === "all") {
      setSelectedProductIds([]);
    }
  };

  const handleEditScopeChange = (scope) => {
    setEditForm((prev) => ({ ...prev, apply_scope: scope }));
    if (scope === "all") {
      setEditSelectedProductIds([]);
    }
  };

  const toggleProduct = (productId) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );
  };

  const toggleEditProduct = (productId) => {
    setEditSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );
  };

  const buildPayload = (voucherForm, productIds) => ({
    seller_id: sellerId,
    name: voucherForm.name.trim(),
    start_date: toDateTimePayload(voucherForm.start_date),
    end_date: toDateTimePayload(voucherForm.end_date),
    discount_percent: Number(voucherForm.discount_percent),
    quantity: Number(voucherForm.quantity),
    apply_scope: voucherForm.apply_scope,
    product_ids: voucherForm.apply_scope === "specific" ? productIds : [],
  });

  const validatePayload = (voucherForm, productIds) => {
    if (!voucherForm.name.trim()) {
      return "❌ Tên voucher không được để trống";
    }

    if (!voucherForm.start_date || !voucherForm.end_date) {
      return "❌ Vui lòng chọn đầy đủ thời gian bắt đầu và kết thúc";
    }

    if (new Date(toDateTimePayload(voucherForm.end_date)) <= new Date(toDateTimePayload(voucherForm.start_date))) {
      return "❌ Thời gian kết thúc phải sau thời gian bắt đầu";
    }

    const percent = Number(voucherForm.discount_percent);
    if (!Number.isFinite(percent) || percent < 1 || percent > 100) {
      return "❌ Phần trăm giảm phải từ 1 đến 100";
    }

    const quantity = Number(voucherForm.quantity);
    if (!Number.isInteger(quantity) || quantity < 1) {
      return "❌ Số lượng voucher phải là số nguyên dương";
    }

    if (voucherForm.apply_scope === "specific" && productIds.length === 0) {
      return "❌ Vui lòng chọn ít nhất 1 sản phẩm";
    }

    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!sellerId) {
      alert("❌ Không tìm thấy seller để tạo voucher");
      return;
    }

    const validationError = validatePayload(form, selectedProductIds);
    if (validationError) {
      alert(validationError);
      return;
    }

    setLoading(true);
    try {
      const payload = buildPayload(form, selectedProductIds);
      await voucherApi.create(payload);
      alert("✅ Tạo voucher thành công");

      setForm(createInitialForm());
      setSelectedProductIds([]);
      await fetchVouchers();
    } catch (error) {
      console.error("Lỗi tạo voucher:", error);
      alert(error?.response?.data?.message || "❌ Tạo voucher thất bại");
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (voucher) => {
    setEditingVoucher(voucher);
    setEditForm({
      name: voucher.name || "",
      start_date: toDateTimeLocal(voucher.start_date),
      end_date: toDateTimeLocal(voucher.end_date),
      discount_percent: String(voucher.discount_percent ?? ""),
      quantity: String(voucher.quantity ?? ""),
      apply_scope: voucher.apply_scope || "all",
    });
    setEditSelectedProductIds(
      Array.isArray(voucher.product_ids)
        ? voucher.product_ids.map((item) => item?._id || item).filter(Boolean)
        : [],
    );
  };

  const closeEditModal = () => {
    setEditingVoucher(null);
    setEditForm(createInitialForm());
    setEditSelectedProductIds([]);
    setIsEditPickingProducts(false);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();

    if (!sellerId || !editingVoucher) {
      alert("❌ Không tìm thấy voucher để cập nhật");
      return;
    }

    const validationError = validatePayload(editForm, editSelectedProductIds);
    if (validationError) {
      alert(validationError);
      return;
    }

    setUpdatingId(editingVoucher._id);
    try {
      const payload = buildPayload(editForm, editSelectedProductIds);
      await voucherApi.update(editingVoucher._id, payload);
      alert("✅ Cập nhật voucher thành công");
      closeEditModal();
      await fetchVouchers();
    } catch (error) {
      console.error("Lỗi cập nhật voucher:", error);
      alert(error?.response?.data?.message || "❌ Cập nhật voucher thất bại");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteVoucher = async (voucher) => {
    if (!sellerId) {
      alert("❌ Không tìm thấy seller để xóa voucher");
      return;
    }

    const confirmed = window.confirm(`Bạn có chắc chắn muốn xóa voucher \"${voucher.name}\" không?`);
    if (!confirmed) return;

    setDeletingId(voucher._id);
    try {
      await voucherApi.remove(voucher._id, { seller_id: sellerId });
      if (editingVoucher?._id === voucher._id) {
        closeEditModal();
      }
      await fetchVouchers();
      alert("✅ Xóa voucher thành công");
    } catch (error) {
      console.error("Lỗi xóa voucher:", error);
      alert(error?.response?.data?.message || "❌ Xóa voucher thất bại");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="mb-4">
        <h1 className="text-xl font-semibold">Quản lý voucher</h1>
        <p className="text-sm text-gray-600 mt-1">
          Tạo voucher theo toàn bộ sản phẩm hoặc chọn sản phẩm cụ thể.
        </p>
      </div>

      <div className="bg-white rounded shadow p-4 mb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium">Tên voucher</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-sm font-medium">Thời gian bắt đầu</label>
              <input
                type="datetime-local"
                name="start_date"
                value={form.start_date}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                required
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">Thời gian kết thúc</label>
              <input
                type="datetime-local"
                name="end_date"
                value={form.end_date}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-sm font-medium">Phần trăm giảm (%)</label>
              <input
                type="number"
                name="discount_percent"
                min="1"
                max="100"
                value={form.discount_percent}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                required
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">Số lượng voucher</label>
              <input
                type="number"
                name="quantity"
                min="1"
                value={form.quantity}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                required
              />
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Áp dụng cho</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleScopeChange("all")}
                className={`px-4 py-2 border rounded ${form.apply_scope === "all" ? "bg-red-50 border-red-400 text-red-600" : "bg-white"}`}
              >
                Toàn bộ sản phẩm
              </button>
              <button
                type="button"
                onClick={() => handleScopeChange("specific")}
                className={`px-4 py-2 border rounded ${form.apply_scope === "specific" ? "bg-red-50 border-red-400 text-red-600" : "bg-white"}`}
              >
                Sản phẩm cụ thể
              </button>
            </div>
          </div>

          {form.apply_scope === "specific" && (
            <div className="border rounded p-3 bg-gray-50">
              <button
                type="button"
                onClick={() => setIsPickingProducts(true)}
                className="px-3 py-2 bg-white border rounded hover:bg-gray-100"
              >
                Chọn sản phẩm
              </button>

              <p className="text-sm text-gray-600 mt-2">
                Đã chọn: <span className="font-semibold">{selectedProductIds.length}</span> sản phẩm
              </p>

              {selectedProducts.length > 0 && (
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedProducts.map((item) => (
                    <div key={item._id} className="border rounded p-2 bg-white flex items-center gap-2">
                      <img src={item.images?.[0]} alt="" className="w-10 h-10 rounded object-cover" />
                      <div className="min-w-0">
                        <p className="text-sm truncate">{item.name}</p>
                        <p className="text-xs text-gray-500">{Number(item.price || 0).toLocaleString()}đ</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-70"
            >
              {loading ? "Đang tạo..." : "Tạo voucher"}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded shadow overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="font-semibold">Danh sách voucher đã tạo</h2>
        </div>

        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Tên voucher</th>
              <th className="p-3">Giảm</th>
              <th className="p-3">Thời gian</th>
              <th className="p-3">Số lượng</th>
              <th className="p-3">Phạm vi</th>
              <th className="p-3">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {vouchers.length === 0 ? (
              <tr>
                <td className="p-4 text-center text-gray-500" colSpan={6}>
                  Chưa có voucher nào
                </td>
              </tr>
            ) : (
              vouchers.map((item) => (
                <tr key={item._id} className="border-t">
                  <td className="p-3">{item.name}</td>
                  <td className="p-3 text-center">{item.discount_percent}%</td>
                  <td className="p-3 text-center text-xs">
                    <div>{formatDateTimeDisplay(item.start_date)}</div>
                    <div>{formatDateTimeDisplay(item.end_date)}</div>
                  </td>
                  <td className="p-3 text-center">{item.quantity}</td>
                  <td className="p-3 text-center">
                    {item.apply_scope === "all"
                      ? "Toàn bộ sản phẩm"
                      : `${item.product_ids?.length || 0} sản phẩm cụ thể`}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(item)}
                        className="px-3 py-1.5 border rounded text-gray-700 hover:bg-gray-50"
                      >
                        Sửa
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteVoucher(item)}
                        disabled={deletingId === item._id}
                        className="px-3 py-1.5 border rounded text-red-600 border-red-300 hover:bg-red-50 disabled:opacity-70"
                      >
                        {deletingId === item._id ? "Đang xóa..." : "Xóa"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isPickingProducts}
        onClose={() => setIsPickingProducts(false)}
        title="Chọn sản phẩm áp dụng voucher"
        maxWidth="max-w-3xl"
      >
        <div className="space-y-3">
          {products.length === 0 ? (
            <p className="text-sm text-gray-500">Không có sản phẩm để chọn.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto pr-1">
              {products.map((item) => {
                const checked = selectedProductIds.includes(item._id);

                return (
                  <label
                    key={item._id}
                    className={`border rounded p-2 flex items-center gap-2 cursor-pointer ${checked ? "border-red-400 bg-red-50" : "bg-white"}`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleProduct(item._id)}
                    />
                    <img src={item.images?.[0]} alt="" className="w-12 h-12 rounded object-cover" />
                    <div className="min-w-0">
                      <p className="text-sm truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">{Number(item.price || 0).toLocaleString()}đ</p>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      </Modal>

      <Modal
        isOpen={Boolean(editingVoucher)}
        onClose={closeEditModal}
        title="Cập nhật voucher"
        maxWidth="max-w-4xl"
      >
        <form onSubmit={handleUpdateSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium">Tên voucher</label>
            <input
              type="text"
              name="name"
              value={editForm.name}
              onChange={handleEditChange}
              className="w-full border p-2 rounded"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-sm font-medium">Thời gian bắt đầu</label>
              <input
                type="datetime-local"
                name="start_date"
                value={editForm.start_date}
                onChange={handleEditChange}
                className="w-full border p-2 rounded"
                required
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">Thời gian kết thúc</label>
              <input
                type="datetime-local"
                name="end_date"
                value={editForm.end_date}
                onChange={handleEditChange}
                className="w-full border p-2 rounded"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-sm font-medium">Phần trăm giảm (%)</label>
              <input
                type="number"
                name="discount_percent"
                min="1"
                max="100"
                value={editForm.discount_percent}
                onChange={handleEditChange}
                className="w-full border p-2 rounded"
                required
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">Số lượng voucher</label>
              <input
                type="number"
                name="quantity"
                min="1"
                value={editForm.quantity}
                onChange={handleEditChange}
                className="w-full border p-2 rounded"
                required
              />
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Áp dụng cho</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleEditScopeChange("all")}
                className={`px-4 py-2 border rounded ${editForm.apply_scope === "all" ? "bg-red-50 border-red-400 text-red-600" : "bg-white"}`}
              >
                Toàn bộ sản phẩm
              </button>
              <button
                type="button"
                onClick={() => handleEditScopeChange("specific")}
                className={`px-4 py-2 border rounded ${editForm.apply_scope === "specific" ? "bg-red-50 border-red-400 text-red-600" : "bg-white"}`}
              >
                Sản phẩm cụ thể
              </button>
            </div>
          </div>

          {editForm.apply_scope === "specific" && (
            <div className="border rounded p-3 bg-gray-50">
              <button
                type="button"
                onClick={() => setIsEditPickingProducts(true)}
                className="px-3 py-2 bg-white border rounded hover:bg-gray-100"
              >
                Chọn sản phẩm
              </button>

              <p className="text-sm text-gray-600 mt-2">
                Đã chọn: <span className="font-semibold">{editSelectedProductIds.length}</span> sản phẩm
              </p>

              {editSelectedProducts.length > 0 && (
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                  {editSelectedProducts.map((item) => (
                    <div key={item._id} className="border rounded p-2 bg-white flex items-center gap-2">
                      <img src={item.images?.[0]} alt="" className="w-10 h-10 rounded object-cover" />
                      <div className="min-w-0">
                        <p className="text-sm truncate">{item.name}</p>
                        <p className="text-xs text-gray-500">{Number(item.price || 0).toLocaleString()}đ</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t">
            <button
              type="button"
              onClick={closeEditModal}
              className="px-4 py-2 border rounded"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={Boolean(updatingId)}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-70"
            >
              {updatingId ? "Đang cập nhật..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </Modal>

      <ProductPickerModal
        isOpen={isEditPickingProducts}
        onClose={() => setIsEditPickingProducts(false)}
        title="Chọn sản phẩm áp dụng voucher"
        products={products}
        selectedProductIds={editSelectedProductIds}
        onToggle={toggleEditProduct}
      />
    </div>
  );
}