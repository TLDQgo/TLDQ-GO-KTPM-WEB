import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { ChevronLeft, Banknote, CreditCard, Wallet } from "lucide-react";
import orderApi from "../api/orderApi";
import cartApi from "../api/cartApi";

function formatPrice(price) {
  return Number(price || 0).toLocaleString("vi-VN") + "đ";
}

const PAYMENT_OPTIONS = [
  {
    value: "COD",
    label: "Thanh toán khi nhận hàng",
    sub: "Trả tiền mặt khi nhận hàng",
    Icon: Banknote,
  },
  {
    value: "BankTransfer",
    label: "Chuyển khoản ngân hàng",
    sub: "Thẻ ATM / Internet Banking",
    Icon: CreditCard,
  },
  {
    value: "VNPay",
    label: "VNPay",
    sub: "ATM / QR Code / Ví điện tử",
    Icon: Wallet,
  },
];

export default function Checkout() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const items = state?.items ?? [];
  const from = state?.from ?? "product";

  const user = (() => {
    try { return JSON.parse(localStorage.getItem("user")); }
    catch { return null; }
  })();

  const [form, setForm] = useState({
    receiver_name: user?.full_name || "",
    phone_number: user?.phone || "",
    shipping_address:
      user?.customerProfile?.address_line ||
      user?.sellerProfile?.address_line ||
      "",
    payment_method: "COD",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!items.length) navigate("/");
  }, []);

  const total = items.reduce(
    (sum, item) => sum + (item.discount_price ?? item.price) * item.quantity,
    0,
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.receiver_name.trim() || !form.phone_number.trim() || !form.shipping_address.trim()) {
      toast.error("Vui lòng điền đầy đủ thông tin giao hàng!");
      return;
    }
    if (!/^[0-9]{9,11}$/.test(form.phone_number.trim())) {
      toast.error("Số điện thoại không hợp lệ (9–11 số)!");
      return;
    }
    if (!user) {
      toast.error("Vui lòng đăng nhập!");
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      const orderItems = items.map((i) => ({
        product_id: i.product_id,
        quantity: i.quantity,
      }));

      const basePayload = {
        customer_id: user._id,
        items: orderItems,
        shipping_address: form.shipping_address,
        receiver_name: form.receiver_name,
        phone_number: form.phone_number,
      };

      if (form.payment_method === "VNPay") {
        sessionStorage.setItem("vnpay_from_cart", from === "cart" ? "true" : "false");
        const result = await orderApi.createVNPayPayment(basePayload);
        window.location.href = result.paymentUrl;
        return;
      }

      await orderApi.createOrder({ ...basePayload, payment_method: form.payment_method });

      if (from === "cart") {
        await cartApi.clearCart(user._id);
        queryClient.invalidateQueries(["cart", user._id]);
      }

      toast.success("Đặt hàng thành công!");
      navigate("/");
    } catch (err) {
      toast.error(err?.response?.data?.message ?? err?.message ?? "Đặt hàng thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-gray-500 hover:text-gray-800 mb-6 text-sm transition"
      >
        <ChevronLeft size={18} />
        Quay lại
      </button>

      <h1 className="text-2xl font-bold text-gray-800 mb-8">Xác nhận đơn hàng</h1>

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* LEFT — Shipping info + Payment */}
          <div className="flex-1 space-y-6">
            {/* Shipping info */}
            <div className="bg-white rounded-2xl border p-6 shadow-sm">
              <h2 className="text-base font-semibold text-gray-800 mb-4">
                Thông tin nhận hàng
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Người nhận <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.receiver_name}
                    onChange={(e) => setForm({ ...form, receiver_name: e.target.value })}
                    placeholder="Nguyễn Văn A"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={form.phone_number}
                    onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
                    placeholder="0912345678"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Địa chỉ giao hàng <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={form.shipping_address}
                    onChange={(e) => setForm({ ...form, shipping_address: e.target.value })}
                    placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Payment method */}
            <div className="bg-white rounded-2xl border p-6 shadow-sm">
              <h2 className="text-base font-semibold text-gray-800 mb-4">
                Phương thức thanh toán
              </h2>

              <div className="space-y-3">
                {PAYMENT_OPTIONS.map(({ value, label, sub, Icon }) => {
                  const selected = form.payment_method === value;
                  return (
                    <label
                      key={value}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition ${
                        selected
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment_method"
                        value={value}
                        checked={selected}
                        onChange={() => setForm({ ...form, payment_method: value })}
                        className="hidden"
                      />
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                          selected ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        <Icon size={20} />
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-semibold ${selected ? "text-blue-700" : "text-gray-800"}`}>
                          {label}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          selected ? "border-blue-500" : "border-gray-300"
                        }`}
                      >
                        {selected && (
                          <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT — Order summary */}
          <div className="lg:w-80 h-fit space-y-4">
            <div className="bg-white rounded-2xl border p-6 shadow-sm">
              <h2 className="text-base font-semibold text-gray-800 mb-4">
                Tóm tắt đơn hàng ({items.length} sản phẩm)
              </h2>

              <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                {items.map((item, idx) => (
                  <div key={idx} className="flex gap-3">
                    <img
                      src={item.image || "/placeholder.png"}
                      alt={item.product_name}
                      className="w-14 h-14 object-cover rounded-lg shrink-0 border"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/56x56?text=SP";
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 line-clamp-2">
                        {item.product_name}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        x{item.quantity}
                      </p>
                    </div>
                    <div className="text-sm font-semibold text-gray-800 whitespace-nowrap">
                      {formatPrice((item.discount_price ?? item.price) * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t mt-4 pt-4 space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Tạm tính</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Phí vận chuyển</span>
                  <span className="text-green-600 font-medium">Miễn phí</span>
                </div>
              </div>

              <div className="border-t mt-4 pt-4 flex justify-between items-center">
                <span className="font-bold text-gray-800">Tổng cộng</span>
                <span className="text-xl font-bold text-red-500">
                  {formatPrice(total)}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold text-base hover:bg-blue-700 disabled:opacity-50 transition shadow-sm"
            >
              {loading ? "Đang xử lý..." : "Xác nhận đặt hàng"}
            </button>

            {form.payment_method === "VNPay" && (
              <p className="text-xs text-center text-gray-400">
                Bạn sẽ được chuyển sang cổng thanh toán VNPay để hoàn tất.
              </p>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
