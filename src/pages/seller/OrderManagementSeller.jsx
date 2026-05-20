import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { ShoppingBag, Eye, User, MapPin, CreditCard, Package } from "lucide-react";
import { format } from "date-fns";
import orderApi from "../../api/orderApi";
import useOrderStore from "../../store/useOrderStore";
import useAuthStore from "../../store/useAuthStore";
import Modal from "../../components/common/Modal";

const STATUS_COLORS = {
  awaiting_payment: "bg-orange-100 text-orange-700",
  pending:          "bg-yellow-100 text-yellow-700",
  confirmed:        "bg-blue-100 text-blue-700",
  preparing:        "bg-indigo-100 text-indigo-700",
  delivering:       "bg-purple-100 text-purple-700",
  completed:        "bg-green-100 text-green-700",
  cancelled:        "bg-red-100 text-red-600",
};

const STATUS_LABELS = {
  awaiting_payment: "Chờ thanh toán",
  pending:          "Chờ xác nhận",
  confirmed:        "Đã xác nhận",
  preparing:        "Đang đóng gói",
  delivering:       "Đang giao hàng",
  completed:        "Hoàn thành",
  cancelled:        "Đã huỷ",
};

const PAYMENT_LABELS = {
  cod:   "Thanh toán khi nhận hàng (COD)",
  vnpay: "Thanh toán VNPay",
  bank:  "Chuyển khoản ngân hàng",
};

function StatusBadge({ status }) {
  return (
    <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[status] || "bg-gray-100 text-gray-600"}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

function SectionTitle({ icon: Icon, children }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon className="w-4 h-4 text-gray-400" />
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{children}</h4>
    </div>
  );
}

function OrderDetailModal({ order, onClose, onUpdateStatus, isPending }) {
  if (!order) return null;

  const address = typeof order.shipping_address === "object"
    ? [order.shipping_address?.street, order.shipping_address?.ward, order.shipping_address?.district, order.shipping_address?.city]
        .filter(Boolean).join(", ")
    : order.shipping_address || "—";

  const itemsTotal = order.items?.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0
  ) || 0;

  return (
    <Modal
      isOpen={!!order}
      onClose={onClose}
      title={`Chi tiết đơn hàng #${order._id.slice(-8).toUpperCase()}`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-5">

        {/* Status + date */}
        <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
          <div>
            <p className="text-xs text-gray-400 mb-1">Ngày đặt</p>
            <p className="text-sm font-semibold text-gray-700">
              {order.createdAt ? format(new Date(order.createdAt), "HH:mm — dd/MM/yyyy") : "—"}
            </p>
          </div>
          <StatusBadge status={order.status} />
        </div>

        {/* Customer info */}
        <div>
          <SectionTitle icon={User}>Thông tin người nhận</SectionTitle>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-0.5">Họ tên</p>
              <p className="text-sm font-semibold text-gray-800">{order.receiver_name || "—"}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-0.5">Số điện thoại</p>
              <p className="text-sm font-semibold text-gray-800">{order.phone_number || "—"}</p>
            </div>
          </div>
        </div>

        {/* Shipping address */}
        <div>
          <SectionTitle icon={MapPin}>Địa chỉ giao hàng</SectionTitle>
          <div className="bg-gray-50 rounded-lg px-4 py-3 text-sm text-gray-700">
            {address}
          </div>
        </div>

        {/* Payment */}
        <div>
          <SectionTitle icon={CreditCard}>Thanh toán</SectionTitle>
          <div className="bg-gray-50 rounded-lg px-4 py-3 text-sm text-gray-700">
            {PAYMENT_LABELS[order.payment_method] || order.payment_method || "—"}
          </div>
        </div>

        {/* Note */}
        {order.note && (
          <div className="bg-yellow-50 border border-yellow-100 rounded-lg px-4 py-3 text-sm text-yellow-800">
            <span className="font-medium">Ghi chú: </span>{order.note}
          </div>
        )}

        {/* Items */}
        <div>
          <SectionTitle icon={Package}>Sản phẩm đặt mua</SectionTitle>
          <div className="border border-gray-100 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500">Sản phẩm</th>
                  <th className="px-3 py-2.5 text-center text-xs font-semibold text-gray-500">SL</th>
                  <th className="px-3 py-2.5 text-right text-xs font-semibold text-gray-500">Đơn giá</th>
                  <th className="px-3 py-2.5 text-right text-xs font-semibold text-gray-500">Thành tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {order.items?.map((item, idx) => (
                  <tr key={item.product_id || idx} className="hover:bg-gray-50">
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2.5">
                        {item.image ? (
                          <img src={item.image} alt="" className="w-10 h-10 object-cover rounded-lg border border-gray-100 shrink-0" />
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 rounded-lg shrink-0" />
                        )}
                        <span className="font-medium text-gray-800 line-clamp-2">{item.product_name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-center text-gray-600">{item.quantity}</td>
                    <td className="px-3 py-2.5 text-right text-gray-600">
                      {Number(item.price || 0).toLocaleString("vi-VN")}đ
                    </td>
                    <td className="px-3 py-2.5 text-right font-semibold text-gray-800">
                      {(Number(item.price || 0) * Number(item.quantity || 1)).toLocaleString("vi-VN")}đ
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Total */}
        <div className="flex justify-end items-center gap-4 border-t border-gray-100 pt-4">
          <span className="text-sm text-gray-500">Tổng thanh toán</span>
          <span className="text-xl font-bold text-red-600">
            {Number(order.total_amount || itemsTotal).toLocaleString("vi-VN")}đ
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-2 pt-1">
          {order.status === "pending" && (
            <>
              <button
                onClick={() => { onUpdateStatus(order._id, "confirmed"); onClose(); }}
                disabled={isPending}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-60"
              >
                Duyệt đơn
              </button>
              <button
                onClick={() => { onUpdateStatus(order._id, "cancelled"); onClose(); }}
                disabled={isPending}
                className="px-4 py-2 border border-red-200 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition disabled:opacity-60"
              >
                Huỷ đơn
              </button>
            </>
          )}
          {order.status === "confirmed" && (
            <>
              <button
                onClick={() => { onUpdateStatus(order._id, "preparing"); onClose(); }}
                disabled={isPending}
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition disabled:opacity-60"
              >
                Đóng gói
              </button>
              <button
                onClick={() => { onUpdateStatus(order._id, "cancelled"); onClose(); }}
                disabled={isPending}
                className="px-4 py-2 border border-red-200 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition disabled:opacity-60"
              >
                Huỷ đơn
              </button>
            </>
          )}
          {order.status === "preparing" && (
            <>
              <button
                onClick={() => { onUpdateStatus(order._id, "delivering"); onClose(); }}
                disabled={isPending}
                className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition disabled:opacity-60"
              >
                Giao hàng
              </button>
              <button
                onClick={() => { onUpdateStatus(order._id, "cancelled"); onClose(); }}
                disabled={isPending}
                className="px-4 py-2 border border-red-200 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition disabled:opacity-60"
              >
                Huỷ đơn
              </button>
            </>
          )}
          {order.status === "delivering" && (
            <button
              onClick={() => { onUpdateStatus(order._id, "completed"); onClose(); }}
              disabled={isPending}
              className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition disabled:opacity-60"
            >
              Giao thành công
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition"
          >
            Đóng
          </button>
        </div>

      </div>
    </Modal>
  );
}

export default function OrderManagementSeller() {
  const queryClient = useQueryClient();
  const { orders, setOrders, updateOrderStatusLocally } = useOrderStore();
  const user = useAuthStore((s) => s.user);
  const sellerId = user?.role === "seller" ? user._id : null;

  const [selectedOrder, setSelectedOrder] = useState(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["sellerOrders", sellerId],
    queryFn: () => orderApi.getOrdersBySeller(sellerId),
    enabled: !!sellerId && sellerId !== "system",
  });

  useEffect(() => {
    const list = data?.data ?? data;
    if (Array.isArray(list)) setOrders(list);
  }, [data, setOrders]);

  // Sync selectedOrder với dữ liệu mới nhất từ store
  useEffect(() => {
    if (selectedOrder) {
      const fresh = orders.find((o) => o._id === selectedOrder._id);
      if (fresh) setSelectedOrder(fresh);
    }
  }, [orders]);

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }) => orderApi.updateOrderStatus(orderId, status),
    onMutate: async ({ orderId, status }) => {
      await queryClient.cancelQueries({ queryKey: ["sellerOrders", sellerId] });
      const previousOrders = queryClient.getQueryData(["sellerOrders", sellerId]);
      updateOrderStatusLocally(orderId, status);
      queryClient.setQueryData(["sellerOrders", sellerId], (old) => {
        const list = old?.data ?? old;
        if (!Array.isArray(list)) return old;
        const updated = list.map((o) => o._id === orderId ? { ...o, status } : o);
        return old?.data ? { ...old, data: updated } : updated;
      });
      return { previousOrders };
    },
    onError: (err, _vars, context) => {
      if (context?.previousOrders) {
        queryClient.setQueryData(["sellerOrders", sellerId], context.previousOrders);
        setOrders(context.previousOrders.data ?? context.previousOrders);
      }
      toast.error("Cập nhật trạng thái thất bại: " + (err?.response?.data?.message || err.message));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["sellerOrders", sellerId] });
    },
  });

  const handleUpdateStatus = (orderId, status) => {
    if (status === "cancelled" && !window.confirm("Bạn có chắc muốn huỷ đơn hàng này?")) return;
    updateStatusMutation.mutate({ orderId, status });
  };

  if (!sellerId)
    return (
      <div className="p-8 text-center text-orange-500 font-semibold">
        Bạn chưa đăng nhập. Vui lòng{" "}
        <a href="/login-seller" className="underline text-blue-600">đăng nhập Seller</a>{" "}
        để xem danh sách đơn hàng.
      </div>
    );

  if (isLoading)
    return (
      <div className="max-w-6xl mx-auto">
        <h1 className="text-xl font-bold text-gray-800 mb-6">Quản lý Đơn hàng</h1>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-400 text-sm">
          Đang tải danh sách đơn hàng...
        </div>
      </div>
    );

  if (isError)
    return (
      <div className="max-w-6xl mx-auto">
        <h1 className="text-xl font-bold text-gray-800 mb-6">Quản lý Đơn hàng</h1>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-red-500 text-sm">
          Lỗi: {error?.response?.data?.message || error?.message || "Không thể tải đơn hàng"}
        </div>
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">Quản lý Đơn hàng</h1>
        <span className="text-sm text-gray-500">
          Tổng: <span className="font-semibold text-red-500">{orders.length}</span> đơn hàng
        </span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <ShoppingBag className="w-12 h-12 mb-3 text-gray-300" />
            <p className="text-sm font-medium">Chưa có đơn hàng nào</p>
            <p className="text-xs mt-1">Đơn hàng mới sẽ xuất hiện ở đây</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Mã đơn</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Khách hàng</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Sản phẩm</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Tổng tiền</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Trạng thái</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((order) => (
                  <tr
                    key={order._id}
                    className="hover:bg-gray-50 transition cursor-pointer"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-800 font-mono">
                        #{order._id.slice(-6).toUpperCase()}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {order.createdAt ? format(new Date(order.createdAt), "dd/MM/yyyy HH:mm") : ""}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{order.receiver_name}</p>
                      <p className="text-xs text-gray-400">{order.phone_number}</p>
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <div className="space-y-1">
                        {order.items?.slice(0, 2).map((item) => (
                          <div key={item.product_id} className="flex items-center gap-1 text-xs text-gray-700">
                            <span className="font-medium truncate max-w-[120px]">{item.product_name}</span>
                            <span className="text-gray-400 shrink-0">×{item.quantity}</span>
                          </div>
                        ))}
                        {order.items?.length > 2 && (
                          <p className="text-xs text-gray-400">+{order.items.length - 2} sản phẩm khác</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-bold text-red-600">
                        {Number(order.total_amount || 0).toLocaleString("vi-VN")}đ
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-center flex-wrap gap-1.5">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition"
                          title="Xem chi tiết"
                        >
                          <Eye size={15} />
                        </button>
                        {order.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(order._id, "confirmed")}
                              disabled={updateStatusMutation.isPending}
                              className="px-2.5 py-1 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-60"
                            >
                              Duyệt
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(order._id, "cancelled")}
                              disabled={updateStatusMutation.isPending}
                              className="px-2.5 py-1 border border-red-200 text-red-600 text-xs font-medium rounded-lg hover:bg-red-50 transition disabled:opacity-60"
                            >
                              Huỷ
                            </button>
                          </>
                        )}
                        {order.status === "confirmed" && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(order._id, "preparing")}
                              disabled={updateStatusMutation.isPending}
                              className="px-2.5 py-1 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition disabled:opacity-60"
                            >
                              Đóng gói
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(order._id, "cancelled")}
                              disabled={updateStatusMutation.isPending}
                              className="px-2.5 py-1 border border-red-200 text-red-600 text-xs font-medium rounded-lg hover:bg-red-50 transition disabled:opacity-60"
                            >
                              Huỷ
                            </button>
                          </>
                        )}
                        {order.status === "preparing" && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(order._id, "delivering")}
                              disabled={updateStatusMutation.isPending}
                              className="px-2.5 py-1 bg-purple-600 text-white text-xs font-medium rounded-lg hover:bg-purple-700 transition disabled:opacity-60"
                            >
                              Giao hàng
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(order._id, "cancelled")}
                              disabled={updateStatusMutation.isPending}
                              className="px-2.5 py-1 border border-red-200 text-red-600 text-xs font-medium rounded-lg hover:bg-red-50 transition disabled:opacity-60"
                            >
                              Huỷ
                            </button>
                          </>
                        )}
                        {order.status === "delivering" && (
                          <button
                            onClick={() => handleUpdateStatus(order._id, "completed")}
                            disabled={updateStatusMutation.isPending}
                            className="px-2.5 py-1 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition disabled:opacity-60"
                          >
                            Hoàn thành
                          </button>
                        )}
                        {["completed", "cancelled", "awaiting_payment"].includes(order.status) && (
                          <span className="text-xs text-gray-300 italic">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onUpdateStatus={handleUpdateStatus}
        isPending={updateStatusMutation.isPending}
      />
    </div>
  );
}
