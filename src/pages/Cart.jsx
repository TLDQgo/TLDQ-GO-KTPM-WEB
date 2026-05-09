import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import cartApi from "../api/cartApi";
import orderApi from "../api/orderApi";

function formatPrice(price) {
  return Number(price || 0).toLocaleString("vi-VN") + "đ";
}

function CheckoutModal({ isOpen, onClose, onConfirm, total, loading, defaultValues }) {
  const [form, setForm] = useState({
    receiver_name: defaultValues?.full_name || "",
    phone_number: defaultValues?.phone || "",
    shipping_address: defaultValues?.address || "",
    payment_method: "COD",
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.receiver_name.trim() || !form.phone_number.trim() || !form.shipping_address.trim()) {
      toast.error("Vui lòng điền đầy đủ thông tin giao hàng!");
      return;
    }
    if (!/^[0-9]{9,11}$/.test(form.phone_number.trim())) {
      toast.error("Số điện thoại không hợp lệ (9–11 số)!");
      return;
    }
    onConfirm(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-bold text-gray-800">Thông tin giao hàng</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Người nhận <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.receiver_name}
              onChange={(e) => setForm({ ...form, receiver_name: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nguyễn Văn A"
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
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0912345678"
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
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phương thức thanh toán
            </label>
            <select
              value={form.payment_method}
              onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
              className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="COD">Thanh toán khi nhận hàng (COD)</option>
              <option value="BankTransfer">Chuyển khoản / Thẻ</option>
            </select>
          </div>

          <div className="flex justify-between items-center pt-2 border-t">
            <span className="text-sm text-gray-600">Tổng thanh toán:</span>
            <span className="text-xl font-bold text-red-500">{formatPrice(total)}</span>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 text-sm font-medium transition"
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {loading ? "Đang đặt..." : "Xác nhận đặt hàng"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Cart() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const user = (() => {
    try { return JSON.parse(localStorage.getItem("user")); }
    catch { return null; }
  })();
  const userId = user?._id;

  const { data: cartData, isLoading } = useQuery({
    queryKey: ["cart", userId],
    queryFn: () => cartApi.getCart(userId),
    enabled: !!userId,
  });

  const cart = cartData?.data ?? cartData ?? { items: [] };
  const items = cart?.items ?? [];

  const removeMutation = useMutation({
    mutationFn: ({ productId }) => cartApi.removeItem(userId, productId),
    onSuccess: () => queryClient.invalidateQueries(["cart", userId]),
  });

  const updateMutation = useMutation({
    mutationFn: ({ productId, quantity }) =>
      cartApi.updateItem(userId, productId, { quantity }),
    onSuccess: () => queryClient.invalidateQueries(["cart", userId]),
  });

  const total = items.reduce(
    (sum, item) => sum + (item.discount_price ?? item.price) * item.quantity,
    0,
  );

  const handleConfirmOrder = async (shippingInfo) => {
    setCheckoutLoading(true);
    try {
      const orderItems = items.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
      }));
      await orderApi.createOrder({
        customer_id: userId,
        items: orderItems,
        shipping_address: shippingInfo.shipping_address,
        receiver_name: shippingInfo.receiver_name,
        phone_number: shippingInfo.phone_number,
        payment_method: shippingInfo.payment_method,
      });
      await cartApi.clearCart(userId);
      queryClient.invalidateQueries(["cart", userId]);
      setCheckoutOpen(false);
      toast.success("Đặt hàng thành công!");
    } catch (err) {
      toast.error(err?.response?.data?.message ?? err?.message ?? "Đặt hàng thất bại");
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (!userId) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <p className="text-gray-500 mb-4">Vui lòng đăng nhập để xem giỏ hàng.</p>
        <button
          onClick={() => navigate("/login")}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Đăng nhập
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center text-gray-400">
        Đang tải giỏ hàng...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Giỏ hàng của bạn</h1>

      {items.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-6xl mb-4">🛒</div>
          <p className="text-lg mb-4">Giỏ hàng trống</p>
          <button
            onClick={() => navigate("/")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Tiếp tục mua sắm
          </button>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Cart items */}
          <div className="flex-1 space-y-4">
            {items.map((item) => (
              <div
                key={item.product_id}
                className="flex gap-4 bg-white border rounded-xl p-4 shadow-sm"
              >
                <img
                  src={item.image || "/placeholder.png"}
                  alt={item.product_name}
                  className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/80x80?text=SP";
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p
                    className="font-medium text-gray-800 truncate cursor-pointer hover:text-blue-600"
                    onClick={() => navigate(`/san-pham/${item.product_id}`)}
                  >
                    {item.product_name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {item.discount_price < item.price ? (
                      <>
                        <span className="text-red-500 font-semibold">
                          {formatPrice(item.discount_price)}
                        </span>
                        <span className="text-gray-400 line-through text-sm">
                          {formatPrice(item.price)}
                        </span>
                      </>
                    ) : (
                      <span className="text-gray-800 font-semibold">
                        {formatPrice(item.price)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <button
                      className="w-7 h-7 rounded-full border flex items-center justify-center hover:bg-gray-100 disabled:opacity-40"
                      onClick={() =>
                        updateMutation.mutate({
                          productId: item.product_id,
                          quantity: item.quantity - 1,
                        })
                      }
                      disabled={item.quantity <= 1 || updateMutation.isPending}
                    >
                      −
                    </button>
                    <span className="w-6 text-center font-medium">{item.quantity}</span>
                    <button
                      className="w-7 h-7 rounded-full border flex items-center justify-center hover:bg-gray-100 disabled:opacity-40"
                      onClick={() =>
                        updateMutation.mutate({
                          productId: item.product_id,
                          quantity: item.quantity + 1,
                        })
                      }
                      disabled={updateMutation.isPending}
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <button
                    onClick={() => removeMutation.mutate({ productId: item.product_id })}
                    className="text-gray-400 hover:text-red-500 transition text-lg"
                    disabled={removeMutation.isPending}
                  >
                    ✕
                  </button>
                  <span className="font-semibold text-gray-800">
                    {formatPrice((item.discount_price ?? item.price) * item.quantity)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:w-72 h-fit bg-white border rounded-xl p-5 shadow-sm">
            <h2 className="font-semibold text-lg mb-4">Tóm tắt đơn hàng</h2>
            <div className="flex justify-between mb-2 text-gray-600 text-sm">
              <span>Tạm tính ({items.length} sản phẩm)</span>
              <span>{formatPrice(total)}</span>
            </div>
            <div className="flex justify-between mb-4 text-gray-600 text-sm">
              <span>Phí vận chuyển</span>
              <span className="text-green-600 font-medium">Miễn phí</span>
            </div>
            <div className="border-t pt-3 flex justify-between font-bold text-lg mb-4">
              <span>Tổng cộng</span>
              <span className="text-red-500">{formatPrice(total)}</span>
            </div>

            <button
              onClick={() => setCheckoutOpen(true)}
              disabled={items.length === 0}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
            >
              Đặt hàng
            </button>

            <button
              onClick={() => navigate("/")}
              className="w-full mt-2 border py-2 rounded-lg text-gray-600 hover:bg-gray-50 transition text-sm"
            >
              Tiếp tục mua sắm
            </button>
          </div>
        </div>
      )}

      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        onConfirm={handleConfirmOrder}
        total={total}
        loading={checkoutLoading}
        defaultValues={user}
      />
    </div>
  );
}
