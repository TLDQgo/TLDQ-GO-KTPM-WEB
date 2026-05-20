import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Zap, Trash2, Pencil, X, Check } from "lucide-react";
import productApi from "../../api/productApi";
import useAuthStore from "../../store/useAuthStore";

const STATUS_LABEL = {
  upcoming: { text: "Sắp diễn ra", cls: "bg-yellow-100 text-yellow-700" },
  active:   { text: "Đang diễn ra", cls: "bg-green-100 text-green-700" },
  ended:    { text: "Đã kết thúc", cls: "bg-gray-100 text-gray-500" },
};

function formatVND(n) {
  return Number(n || 0).toLocaleString("vi-VN") + "đ";
}

function formatDT(dt) {
  return dt ? new Date(dt).toLocaleString("vi-VN") : "";
}

export default function FlashSaleManagement() {
  const user = useAuthStore((s) => s.user);
  const sellerId = user?._id;
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    product_id: "",
    sale_price: "",
    start_time: "",
    end_time: "",
    quantity_limit: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const startEdit = (fs) => {
    setEditingId(fs._id);
    setEditForm({
      sale_price: fs.sale_price,
      start_time: fs.start_time ? new Date(fs.start_time).toISOString().slice(0, 16) : "",
      end_time: fs.end_time ? new Date(fs.end_time).toISOString().slice(0, 16) : "",
      quantity_limit: fs.quantity_limit ?? 0,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const { data: productsData } = useQuery({
    queryKey: ["sellerProducts", sellerId],
    queryFn: () => productApi.getProductsBySeller(sellerId, 1),
    enabled: !!sellerId,
    staleTime: 2 * 60_000,
  });

  const products = (() => {
    const raw = productsData;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw.data)) return raw.data;
    if (raw.data && Array.isArray(raw.data.products)) return raw.data.products;
    return [];
  })().filter((p) => p.status === "approved");

  const { data: flashSalesData, isLoading } = useQuery({
    queryKey: ["flashSalesBySeller", sellerId],
    queryFn: () => productApi.getFlashSalesBySeller(sellerId),
    enabled: !!sellerId,
    staleTime: 60_000,
  });

  const flashSales = flashSalesData?.data ?? [];

  const createMutation = useMutation({
    mutationFn: (data) => productApi.createFlashSale(data),
    onSuccess: () => {
      toast.success("Tạo Flash Sale thành công!");
      setForm({ product_id: "", sale_price: "", start_time: "", end_time: "", quantity_limit: "" });
      queryClient.invalidateQueries({ queryKey: ["flashSalesBySeller", sellerId] });
    },
    onError: (err) => toast.error(err?.response?.data?.message || "Tạo thất bại"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => productApi.updateFlashSale(id, { ...data, seller_id: sellerId }),
    onSuccess: () => {
      toast.success("Cập nhật flash sale thành công!");
      cancelEdit();
      queryClient.invalidateQueries({ queryKey: ["flashSalesBySeller", sellerId] });
    },
    onError: (err) => toast.error(err?.response?.data?.message || "Cập nhật thất bại"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => productApi.deleteFlashSale(id, sellerId),
    onSuccess: () => {
      toast.success("Đã xóa flash sale");
      queryClient.invalidateQueries({ queryKey: ["flashSalesBySeller", sellerId] });
    },
    onError: (err) => toast.error(err?.response?.data?.message || "Xóa thất bại"),
  });

  const handleDelete = (id) => {
    if (!window.confirm("Xác nhận xóa flash sale này?")) return;
    deleteMutation.mutate(id);
  };

  const handleSaveEdit = (id) => {
    if (!editForm.sale_price || !editForm.start_time || !editForm.end_time) {
      toast.warning("Vui lòng điền đầy đủ thông tin");
      return;
    }
    updateMutation.mutate({ id, data: editForm });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.product_id || !form.sale_price || !form.start_time || !form.end_time) {
      toast.warning("Vui lòng điền đầy đủ thông tin");
      return;
    }
    createMutation.mutate({ ...form, seller_id: sellerId });
  };

  const selectedProduct = products.find((p) => p._id === form.product_id);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Zap className="w-6 h-6 text-yellow-500 fill-yellow-400" />
        <h1 className="text-xl font-bold text-gray-800">Quản lý Flash Sale</h1>
      </div>

      {/* CREATE FORM */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <h2 className="text-base font-semibold text-gray-700 mb-4">Tạo Flash Sale mới</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-600 mb-1">Sản phẩm</label>
            <select
              value={form.product_id}
              onChange={(e) => setForm((f) => ({ ...f, product_id: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-400"
            >
              <option value="">-- Chọn sản phẩm --</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} — {formatVND(p.price)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Giá sale (đ)
              {selectedProduct && (
                <span className="ml-2 text-xs text-gray-400">
                  Giá gốc: {formatVND(selectedProduct.price)}
                </span>
              )}
            </label>
            <input
              type="number"
              min={0}
              value={form.sale_price}
              onChange={(e) => setForm((f) => ({ ...f, sale_price: e.target.value }))}
              placeholder="VD: 150000"
              className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Số lượng giới hạn (0 = không giới hạn)</label>
            <input
              type="number"
              min={0}
              value={form.quantity_limit}
              onChange={(e) => setForm((f) => ({ ...f, quantity_limit: e.target.value }))}
              placeholder="VD: 50"
              className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Thời gian bắt đầu</label>
            <input
              type="datetime-local"
              value={form.start_time}
              onChange={(e) => setForm((f) => ({ ...f, start_time: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Thời gian kết thúc</label>
            <input
              type="datetime-local"
              value={form.end_time}
              onChange={(e) => setForm((f) => ({ ...f, end_time: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-6 py-2 bg-red-500 text-white text-sm font-semibold rounded-lg hover:bg-red-600 transition disabled:opacity-60"
            >
              {createMutation.isPending ? "Đang tạo..." : "Tạo Flash Sale"}
            </button>
          </div>
        </form>
      </div>

      {/* LIST */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-700">Danh sách Flash Sale</h2>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Đang tải...</div>
        ) : flashSales.length === 0 ? (
          <div className="p-8 text-center text-gray-400">Chưa có flash sale nào</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {flashSales.map((fs) => {
              const statusInfo = STATUS_LABEL[fs.status] || STATUS_LABEL.ended;
              const product = fs.product_id;
              const isEditing = editingId === fs._id;
              return (
                <div key={fs._id} className="p-4">
                  {isEditing ? (
                    /* EDIT MODE */
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-gray-700 truncate">
                        {product?.name || "Sản phẩm đã xóa"}
                        <span className="ml-2 text-xs text-gray-400 font-normal">Giá gốc: {formatVND(fs.original_price)}</span>
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Giá sale (đ)</label>
                          <input
                            type="number"
                            value={editForm.sale_price}
                            onChange={(e) => setEditForm((f) => ({ ...f, sale_price: e.target.value }))}
                            className="w-full border rounded-lg px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-400"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Số lượng giới hạn</label>
                          <input
                            type="number"
                            value={editForm.quantity_limit}
                            onChange={(e) => setEditForm((f) => ({ ...f, quantity_limit: e.target.value }))}
                            className="w-full border rounded-lg px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-400"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Bắt đầu</label>
                          <input
                            type="datetime-local"
                            value={editForm.start_time}
                            onChange={(e) => setEditForm((f) => ({ ...f, start_time: e.target.value }))}
                            className="w-full border rounded-lg px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-400"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Kết thúc</label>
                          <input
                            type="datetime-local"
                            value={editForm.end_time}
                            onChange={(e) => setEditForm((f) => ({ ...f, end_time: e.target.value }))}
                            className="w-full border rounded-lg px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-400"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveEdit(fs._id)}
                          disabled={updateMutation.isPending}
                          className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition disabled:opacity-60"
                        >
                          <Check size={14} /> Lưu
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="flex items-center gap-1.5 px-4 py-1.5 border text-sm rounded-lg hover:bg-gray-50 transition text-gray-600"
                        >
                          <X size={14} /> Hủy
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* VIEW MODE */
                    <div className="flex items-center gap-4">
                      {product?.images?.[0] && (
                        <img src={product.images[0]} alt={product.name} className="w-14 h-14 object-cover rounded-lg shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{product?.name || "Sản phẩm đã xóa"}</p>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <span className="text-red-600 font-bold text-sm">{formatVND(fs.sale_price)}</span>
                          <span className="text-gray-400 line-through text-xs">{formatVND(fs.original_price)}</span>
                          <span className="bg-red-100 text-red-600 text-xs font-bold px-1.5 rounded">-{fs.discount_percent}%</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{formatDT(fs.start_time)} → {formatDT(fs.end_time)}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusInfo.cls}`}>{statusInfo.text}</span>
                        <button
                          onClick={() => startEdit(fs)}
                          className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition"
                          title="Sửa flash sale"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(fs._id)}
                          disabled={deleteMutation.isPending}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                          title="Xóa flash sale"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
