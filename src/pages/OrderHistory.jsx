import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronUp, ShoppingBag, Package } from "lucide-react";
import orderApi from "../api/orderApi";

function formatPrice(price) {
  return Number(price || 0).toLocaleString("vi-VN") + "đ";
}

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

const STATUS_LABEL = {
  awaiting_payment: { label: "Chờ thanh toán", color: "bg-orange-100 text-orange-700" },
  pending:          { label: "Chờ xác nhận",   color: "bg-yellow-100 text-yellow-700" },
  confirmed:        { label: "Đã xác nhận",    color: "bg-blue-100 text-blue-700" },
  preparing:        { label: "Đang đóng gói",  color: "bg-indigo-100 text-indigo-700" },
  delivering:       { label: "Đang giao hàng", color: "bg-purple-100 text-purple-700" },
  completed:        { label: "Hoàn thành",     color: "bg-green-100 text-green-700" },
  cancelled:        { label: "Đã huỷ",         color: "bg-red-100 text-red-700" },
};

const PAYMENT_LABEL = {
  COD:          "Thanh toán khi nhận hàng",
  BankTransfer: "Chuyển khoản ngân hàng",
  VNPay:        "VNPay",
};

const PAYMENT_STATUS_LABEL = {
  pending: { label: "Chưa thanh toán", color: "text-yellow-600" },
  paid:    { label: "Đã thanh toán",   color: "text-green-600" },
  failed:  { label: "Thất bại",        color: "text-red-600" },
};

function OrderCard({ order }) {
  const [open, setOpen] = useState(false);
  const status = STATUS_LABEL[order.status] ?? { label: order.status, color: "bg-gray-100 text-gray-700" };
  const paymentStatus = PAYMENT_STATUS_LABEL[order.payment_status] ?? { label: order.payment_status, color: "text-gray-600" };

  return (
    <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
      {/* Header row */}
      <div
        className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono text-gray-400">#{order._id.slice(-8).toUpperCase()}</span>
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${status.color}`}>
              {status.label}
            </span>
            {order.payment_method === "VNPay" && (
              <span className={`text-xs font-medium ${paymentStatus.color}`}>
                · {paymentStatus.label}
              </span>
            )}
          </div>
          <span className="text-xs text-gray-400">{formatDate(order.createdAt)}</span>
        </div>

        <div className="flex items-center gap-4 shrink-0 ml-4">
          <div className="text-right">
            <p className="text-sm font-bold text-red-500">{formatPrice(order.total_amount)}</p>
            <p className="text-xs text-gray-400">{order.items?.length ?? 0} sản phẩm</p>
          </div>
          {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </div>
      </div>

      {/* Expanded detail */}
      {open && (
        <div className="border-t px-5 py-4 space-y-4 bg-gray-50">
          {/* Items */}
          <div className="space-y-3">
            {order.items?.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center shrink-0">
                  <Package size={16} className="text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{item.product_name}</p>
                  <p className="text-xs text-gray-500">x{item.quantity} · {formatPrice(item.price)}/cái</p>
                </div>
                <p className="text-sm font-semibold text-gray-700 whitespace-nowrap">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          {/* Shipping + Payment info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600 border-t pt-3">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Giao hàng</p>
              <p className="font-medium text-gray-800">{order.receiver_name}</p>
              <p>{order.phone_number}</p>
              <p className="text-xs text-gray-500 mt-0.5">{order.shipping_address}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Thanh toán</p>
              <p className="font-medium text-gray-800">{PAYMENT_LABEL[order.payment_method] ?? order.payment_method}</p>
              <p className={`text-sm font-semibold ${paymentStatus.color}`}>{paymentStatus.label}</p>
            </div>
          </div>

          {/* Total */}
          <div className="flex justify-between items-center border-t pt-3">
            <span className="text-sm text-gray-600">Tổng đơn hàng</span>
            <span className="text-base font-bold text-red-500">{formatPrice(order.total_amount)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

const FILTER_TABS = [
  { key: "all",              label: "Tất cả" },
  { key: "awaiting_payment", label: "Chờ thanh toán" },
  { key: "pending",          label: "Chờ xác nhận" },
  { key: "confirmed",        label: "Đã xác nhận" },
  { key: "delivering",       label: "Đang giao" },
  { key: "completed",        label: "Hoàn thành" },
  { key: "cancelled",        label: "Đã huỷ" },
];

export default function OrderHistory() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");

  const user = (() => {
    try { return JSON.parse(localStorage.getItem("user")); }
    catch { return null; }
  })();

  const { data, isLoading } = useQuery({
    queryKey: ["customerOrders", user?._id],
    queryFn: () => orderApi.getOrdersByCustomer(user._id),
    enabled: !!user?._id,
  });

  const orders = data?.data ?? [];

  const filtered = activeTab === "all"
    ? orders
    : orders.filter((o) => o.status === activeTab);

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <p className="text-gray-500 mb-4">Vui lòng đăng nhập để xem đơn hàng.</p>
        <button
          onClick={() => navigate("/login")}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Đăng nhập
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <ShoppingBag size={22} className="text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-800">Đơn hàng của tôi</h1>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {FILTER_TABS.map((tab) => {
          const count = tab.key === "all"
            ? orders.length
            : orders.filter((o) => o.status === tab.key).length;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition border ${
                activeTab === tab.key
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:text-blue-600"
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span className={`text-xs rounded-full px-1.5 py-0.5 font-bold ${
                  activeTab === tab.key ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-gray-400">Đang tải đơn hàng...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <ShoppingBag size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg">Không có đơn hàng nào</p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 text-sm"
          >
            Mua sắm ngay
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => (
            <OrderCard key={order._id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
