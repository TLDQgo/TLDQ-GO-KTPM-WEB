import React, { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import orderApi from "../../api/orderApi";
import useOrderStore from "../../store/useOrderStore";
import useAuthStore from "../../store/useAuthStore";
import { format } from "date-fns";

const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  preparing: "bg-indigo-100 text-indigo-800",
  delivering: "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const STATUS_LABELS = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  preparing: "Đang đóng gói",
  delivering: "Đang giao hàng",
  completed: "Hoàn thành",
  cancelled: "Đã huỷ",
};

export default function OrderManagementSeller() {
  const queryClient = useQueryClient();
  const { orders, setOrders, updateOrderStatusLocally } = useOrderStore();

  const user = useAuthStore((s) => s.user);
  const sellerId = user?.role === "seller" ? user._id : null;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["sellerOrders", sellerId],
    queryFn: () => orderApi.getOrdersBySeller(sellerId),
    enabled: !!sellerId && sellerId !== "system",
  });

  useEffect(() => {
    const list = data?.data ?? data;
    if (Array.isArray(list)) {
      setOrders(list);
    }
  }, [data, setOrders]);

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }) =>
      orderApi.updateOrderStatus(orderId, status),
    onMutate: async ({ orderId, status }) => {
      await queryClient.cancelQueries({ queryKey: ["sellerOrders", sellerId] });
      const previousOrders = queryClient.getQueryData(["sellerOrders", sellerId]);

      updateOrderStatusLocally(orderId, status);

      queryClient.setQueryData(["sellerOrders", sellerId], (old) => {
        const list = old?.data ?? old;
        if (!Array.isArray(list)) return old;
        const updated = list.map((order) =>
          order._id === orderId ? { ...order, status } : order
        );
        return old?.data ? { ...old, data: updated } : updated;
      });

      return { previousOrders };
    },
    onError: (err, variables, context) => {
      if (context?.previousOrders) {
        queryClient.setQueryData(
          ["sellerOrders", sellerId],
          context.previousOrders
        );
        const list = context.previousOrders?.data ?? context.previousOrders;
        if (Array.isArray(list)) setOrders(list);
      }
      alert("Lỗi cập nhật trạng thái đơn: " + err.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["sellerOrders", sellerId] });
    },
  });

  const handleUpdateStatus = (orderId, status) => {
    if (status === "cancelled") {
      if (!window.confirm("Bạn có chắc muốn huỷ đơn hàng này?")) return;
    }
    updateStatusMutation.mutate({ orderId, status });
  };

  if (!sellerId)
    return (
      <div className="p-8 text-center text-orange-500 font-semibold">
        ⚠️ Bạn chưa đăng nhập. Vui lòng{" "}
        <a href="/login-seller" className="underline text-blue-600">
          đăng nhập Seller
        </a>{" "}
        để xem danh sách đơn hàng.
      </div>
    );

  if (isLoading)
    return (
      <div className="p-4 text-center text-gray-500">
        Đang tải danh sách đơn hàng...
      </div>
    );

  if (isError)
    return (
      <div className="p-4 text-center text-red-500">
        ❌ Lỗi: {error?.response?.data?.message || error?.message || "Failed to load orders"}
      </div>
    );

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý Đơn hàng</h1>
        <div className="text-sm text-gray-600 bg-white px-4 py-2 rounded-lg shadow-sm">
          Tổng đơn hàng: <span className="font-bold text-red-500">{orders.length}</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-600 uppercase">
                <th className="p-4 font-semibold">Mã đơn</th>
                <th className="p-4 font-semibold">Khách hàng</th>
                <th className="p-4 font-semibold">Sản phẩm</th>
                <th className="p-4 font-semibold">Tổng tiền</th>
                <th className="p-4 font-semibold">Trạng thái</th>
                <th className="p-4 font-semibold text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">
                    Chưa có đơn hàng nào
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr
                    key={order._id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="p-4">
                      <div className="font-medium text-gray-900">
                        #{order._id.substring(order._id.length - 6).toUpperCase()}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {order.createdAt
                          ? format(new Date(order.createdAt), "dd/MM/yyyy HH:mm")
                          : ""}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-gray-800">
                        {order.receiver_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.phone_number}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        {order.items?.map((item) => (
                          <div key={item.product_id} className="text-sm text-gray-700">
                            <span className="font-medium">{item.product_name}</span>
                            <span className="text-gray-500 ml-1">×{item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-red-600">
                        {order.total_amount?.toLocaleString()} đ
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${STATUS_COLORS[order.status] || "bg-gray-100 text-gray-800"
                          }`}
                      >
                        {STATUS_LABELS[order.status] || order.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center flex-wrap gap-2">
                        {order.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(order._id, "confirmed")}
                              className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition"
                            >
                              Duyệt đơn
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(order._id, "cancelled")}
                              className="px-3 py-1.5 border border-red-200 text-red-600 text-xs font-medium rounded hover:bg-red-50 transition"
                            >
                              Huỷ
                            </button>
                          </>
                        )}
                        {order.status === "confirmed" && (
                          <button
                            onClick={() => handleUpdateStatus(order._id, "preparing")}
                            className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded hover:bg-indigo-700 transition"
                          >
                            Đã Đóng gói
                          </button>
                        )}
                        {order.status === "preparing" && (
                          <button
                            onClick={() => handleUpdateStatus(order._id, "delivering")}
                            className="px-3 py-1.5 bg-purple-600 text-white text-xs font-medium rounded hover:bg-purple-700 transition"
                          >
                            Giao hàng
                          </button>
                        )}
                        {order.status === "delivering" && (
                          <button
                            onClick={() => handleUpdateStatus(order._id, "completed")}
                            className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition"
                          >
                            Giao thành công
                          </button>
                        )}
                        {["confirmed", "preparing"].includes(order.status) && (
                          <button
                            onClick={() => handleUpdateStatus(order._id, "cancelled")}
                            className="px-3 py-1.5 border border-red-200 text-red-600 text-xs font-medium rounded hover:bg-red-50 transition"
                          >
                            Huỷ
                          </button>
                        )}
                        {["completed", "cancelled"].includes(order.status) && (
                          <span className="text-xs text-gray-400 italic">
                            Không có thao tác
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
