import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import cartApi from "../api/cartApi";

function formatPrice(price) {
  return Number(price || 0).toLocaleString("vi-VN") + "đ";
}

export default function Cart() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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

  const handleCheckout = () => {
    const checkoutItems = items.map((item) => ({
      product_id: item.product_id,
      product_name: item.product_name,
      quantity: item.quantity,
      price: item.price,
      discount_price: item.discount_price,
      image: item.image,
    }));
    navigate("/checkout", { state: { items: checkoutItems, from: "cart" } });
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
              onClick={handleCheckout}
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
    </div>
  );
}
