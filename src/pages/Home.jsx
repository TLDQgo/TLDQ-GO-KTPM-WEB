import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Modal from "../components/common/Modal";

const categories = [
  {
    name: "Sofa Thư Giãn",
    img: "https://theme.hstatic.net/1000213518/1001329030/14/showinfocaticon2_small.png?v=770",
  },
  {
    name: "Bàn Học Thông Minh",
    img: "https://theme.hstatic.net/1000213518/1001329030/14/showinfocaticon4_small.png?v=770",
  },
  {
    name: "Ghế Chống Gù",
    img: "https://theme.hstatic.net/1000213518/1001329030/14/showinfocaticon5_small.png?v=770",
  },
  {
    name: "Ghế Công Thái Học",
    img: "https://theme.hstatic.net/1000213518/1001329030/14/showinfocaticon6_small.png?v=770",
  },
  {
    name: "Bàn Nâng Hạ",
    img: "https://theme.hstatic.net/1000213518/1001329030/14/showinfocaticon7_small.png?v=770",
  },
  {
    name: "Phụ Kiện Ergonomics",
    img: "https://theme.hstatic.net/1000213518/1001329030/14/showinfocaticon8_small.png?v=770",
  },
  {
    name: "Sofa Chỉnh Điện",
    img: "https://theme.hstatic.net/1000213518/1001329030/14/showinfocaticon2_small.png?v=770",
  },
  {
    name: "Ghế Massage",
    img: "https://theme.hstatic.net/1000213518/1001329030/14/showinfocaticon4_small.png?v=770",
  },
];

export default function Home() {
  const [products, setProducts] = useState([]);

  // Modal states
  const [selectedProductForDetails, setSelectedProductForDetails] =
    useState(null);
  const [selectedProductForCheckout, setSelectedProductForCheckout] =
    useState(null);

  // Form states
  const [checkoutForm, setCheckoutForm] = useState({
    receiver_name: "",
    phone_number: "",
    shipping_address: "",
    quantity: 1,
    payment_method: "COD",
  });

  const handleOrder = (product, e) => {
    e.stopPropagation(); // Prevent opening product details
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      toast.warning("Vui lòng đăng nhập để đặt hàng!");
      return;
    }

    const user = JSON.parse(storedUser);
    setSelectedProductForCheckout(product);
    setCheckoutForm({
      receiver_name: user.full_name || user.username || "",
      phone_number: user.phone_number || "",
      shipping_address: user.address || "97 Võ Văn Ngân, Thủ Đức, TP.HCM",
      quantity: 1,
      payment_method: "COD",
    });
  };

  const submitOrder = async (e) => {
    e.preventDefault();
    if (
      !checkoutForm.receiver_name ||
      !checkoutForm.phone_number ||
      !checkoutForm.shipping_address
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin giao hàng!");
      return;
    }

    // Validate phone number roughly
    if (!/^[0-9]{10,11}$/.test(checkoutForm.phone_number)) {
      toast.error("Số điện thoại không hợp lệ! Vui lòng nhập 10-11 chữ số.");
      return;
    }

    const storedUser = localStorage.getItem("user");
    const user = JSON.parse(storedUser);

    try {
      const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
      const BASE_URL = isLocal ? (import.meta.env.VITE_API_URL || "http://18.143.172.207:3000") : "";
      const res = await fetch(`${BASE_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer_id: user._id || user.id,
          shipping_address: checkoutForm.shipping_address,
          receiver_name: checkoutForm.receiver_name,
          phone_number: checkoutForm.phone_number,
          payment_method: checkoutForm.payment_method,
          items: [
            {
              product_id: selectedProductForCheckout._id,
              quantity: checkoutForm.quantity,
            },
          ],
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Đặt hàng thành công!");
        setSelectedProductForCheckout(null); // Close modal
      } else {
        toast.error(`Lỗi: ${data.message || "Không thể đặt hàng"}`);
      }
    } catch (err) {
      console.error("Order error:", err);
      toast.error("Đã xảy ra lỗi hệ thống khi đặt hàng");
    }
  };

  useEffect(() => {
    // Fetch products from API Gateway
    const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    const BASE_URL = isLocal ? (import.meta.env.VITE_API_URL || "http://18.143.172.207:3000") : "";
    fetch(`${BASE_URL}/api/products`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.data) {
          setProducts(data.data);
        }
      })
      .catch((err) => console.error(err));

    // Kiểm tra xem có vị trí cuộn đã lưu không
    const scrollPosition = sessionStorage.getItem("scrollPosition");
    if (scrollPosition) {
      window.scrollTo(0, scrollPosition); // Cuộn đến vị trí đã lưu
      sessionStorage.removeItem("scrollPosition"); // Xóa vị trí cuộn sau khi đã sử dụng
    }
  }, []);
  return (
    <div className="min-h-screen p-4 ">
      {/* TOP SECTION */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* LEFT BANNER */}
        <div className="relative overflow-hidden md:col-span-2 rounded-2xl">
          <img
            src="https://theme.hstatic.net/1000213518/1001329030/14/showssliimga1_1024x1024.png?v=770"
            alt="banner"
            className="object-cover w-full h-full"
          />
        </div>

        {/* RIGHT BOXES */}
        <div className="grid grid-cols-1 gap-4">
          {[
            {
              title: "Học tập thông minh",
              img: "https://theme.hstatic.net/1000213518/1001329030/14/babannerrighimg1_grande.png?v=770",
            },
            {
              title: "Làm việc công thái học",
              img: "https://theme.hstatic.net/1000213518/1001329030/14/babannerrighimg2_grande.png?v=770",
            },
            {
              title: "Thư giãn & phục hồi sức khỏe",
              img: "https://theme.hstatic.net/1000213518/1001329030/14/babannerrighimg3_grande.png?v=770",
            },
          ].map((item, index) => (
            <div
              key={index}
              className="relative h-32 cursor-pointer rounded-xl group"
            >
              {/* IMAGE BACKGROUND */}
              <img
                src={item.img}
                alt={item.title}
                className="absolute inset-0 object-cover w-full h-full transition duration-300 group-hover:scale-105"
              />

              {/* OVERLAY */}
              <div className="absolute inset-0 bg-black/30"></div>

              {/* TEXT */}
              <div className="relative z-10 flex items-center h-full px-4">
                {/* <p className="text-lg font-semibold text-white">{item.title}</p> */}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CATEGORY SECTION */}
      <div className="grid grid-cols-2 gap-6 mt-8 text-center sm:grid-cols-4 md:grid-cols-8">
        {categories.map((item, index) => (
          <div key={index} className="flex flex-col items-center">
            <div className="flex items-center justify-center w-16 h-16 mb-2 transition bg-white rounded-full shadow hover:scale-105">
              <img
                src={item.img}
                alt={item.name}
                className="object-contain w-10 h-10"
              />
            </div>
            <p className="text-sm text-gray-600">{item.name}</p>
          </div>
        ))}
      </div>
      {/* BANNER */}
      <div>
        <img
          src="https://theme.hstatic.net/1000213518/1001329030/14/showbannerindimg_2048x2048.png?v=770"
          alt="banner"
          className="object-cover w-full h-full mt-8 rounded-2xl"
        />
      </div>
      {/* Bàn học thông minh */}
      <div className="mt-10">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="pb-2 text-xl font-bold border-b-2 border-blue-500">
            BÀN HỌC THÔNG MINH
            <span className="ml-2 text-sm text-gray-500">(44 sản phẩm)</span>
          </h2>

          <div className="flex gap-2">
            <button className="px-3 py-1 text-sm border rounded-lg">
              Thương hiệu iSmart
            </button>
            <button className="px-3 py-1 text-sm border rounded-lg">
              Hanover cao cấp
            </button>
            <button className="px-3 py-1 text-sm text-white bg-blue-500 border rounded-lg">
              Tất Cả
            </button>
          </div>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {products.map((item, index) => (
            <div
              key={index}
              onClick={() => setSelectedProductForDetails(item)}
              className="overflow-hidden transition bg-white shadow cursor-pointer rounded-xl hover:shadow-lg"
            >
              {/* IMAGE */}
              <div className="relative">
                <img
                  src={
                    item.images?.[0] ||
                    item.img ||
                    "https://via.placeholder.com/150"
                  }
                  alt={item.name}
                  className="object-cover w-full h-48"
                />

                {/* DISCOUNT */}
                <span className="absolute px-2 py-1 text-xs text-white bg-red-500 rounded top-2 left-2">
                  Giảm 25%
                </span>

                {/* INSTALLMENT */}
                <span className="absolute px-2 py-1 text-xs bg-gray-100 rounded top-2 right-2">
                  Trả góp 0%
                </span>
              </div>

              {/* CONTENT */}
              <div className="p-3">
                <p className="h-10 text-sm font-medium line-clamp-2">
                  {item.name}
                </p>

                <p className="mt-2 text-sm font-bold text-red-500">
                  {item.price?.toLocaleString("vi-VN")}đ
                </p>

                <p className="text-xs text-gray-400 line-through">
                  {(item.price * 1.25 || 0).toLocaleString("vi-VN")}đ
                </p>

                {/* BUTTON */}
                <button
                  onClick={(e) => handleOrder(item, e)}
                  className="w-full py-1 mt-3 text-xs transition border rounded-lg hover:bg-blue-500 hover:text-white"
                >
                  Đặt hàng ngay
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* VIEW ALL */}
        <div className="mt-6 text-center">
          <button className="px-4 py-2 border rounded-lg hover:bg-gray-100">
            Xem tất cả
          </button>
        </div>
      </div>
      {/* BANNER 2 */}
      <div>
        <img
          src="https://theme.hstatic.net/1000213518/1001329030/14/showbannerindimg2_2048x2048.png?v=770"
          alt="banner"
          className="object-cover w-full h-full mt-8 rounded-2xl"
        />
      </div>
      {/* Bàn học thông minh */}
      <div className="mt-10">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="pb-2 text-xl font-bold border-b-2 border-blue-500">
            BÀN HỌC THÔNG MINH
            <span className="ml-2 text-sm text-gray-500">(44 sản phẩm)</span>
          </h2>

          <div className="flex gap-2">
            <button className="px-3 py-1 text-sm border rounded-lg">
              Thương hiệu iSmart
            </button>
            <button className="px-3 py-1 text-sm border rounded-lg">
              Hanover cao cấp
            </button>
            <button className="px-3 py-1 text-sm text-white bg-blue-500 border rounded-lg">
              Tất Cả
            </button>
          </div>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {products.map((item, index) => (
            <div
              key={index}
              onClick={() => setSelectedProductForDetails(item)}
              className="overflow-hidden transition bg-white shadow cursor-pointer rounded-xl hover:shadow-lg"
            >
              {/* IMAGE */}
              <div className="relative">
                <img
                  src={
                    item.images?.[0] ||
                    item.img ||
                    "https://via.placeholder.com/150"
                  }
                  alt={item.name}
                  className="object-cover w-full h-48"
                />

                {/* DISCOUNT */}
                <span className="absolute px-2 py-1 text-xs text-white bg-red-500 rounded top-2 left-2">
                  Giảm 25%
                </span>

                {/* INSTALLMENT */}
                <span className="absolute px-2 py-1 text-xs bg-gray-100 rounded top-2 right-2">
                  Trả góp 0%
                </span>
              </div>

              {/* CONTENT */}
              <div className="p-3">
                <p className="h-10 text-sm font-medium line-clamp-2">
                  {item.name}
                </p>

                <p className="mt-2 text-sm font-bold text-red-500">
                  {item.price?.toLocaleString("vi-VN")}đ
                </p>

                <p className="text-xs text-gray-400 line-through">
                  {(item.price * 1.25 || 0).toLocaleString("vi-VN")}đ
                </p>

                {/* BUTTON */}
                <button
                  onClick={(e) => handleOrder(item, e)}
                  className="w-full py-1 mt-3 text-xs transition border rounded-lg hover:bg-blue-500 hover:text-white"
                >
                  Đặt hàng ngay
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* VIEW ALL */}
        <div className="mt-6 text-center">
          <button className="px-4 py-2 border rounded-lg hover:bg-gray-100">
            Xem tất cả
          </button>
        </div>
      </div>
      {/* BANNER 3 */}
      <div>
        <img
          src="https://theme.hstatic.net/1000213518/1001329030/14/showbannerindimg4_2048x2048.png?v=770"
          alt="banner"
          className="object-cover w-full h-full mt-8 rounded-2xl"
        />
      </div>

      {/* Product Details Modal */}
      <Modal
        isOpen={!!selectedProductForDetails}
        onClose={() => setSelectedProductForDetails(null)}
        title="Chi tiết sản phẩm"
        maxWidth="max-w-2xl"
      >
        {selectedProductForDetails && (
          <div className="flex flex-col gap-6 md:flex-row">
            <div className="w-full md:w-1/2">
              <img
                src={
                  selectedProductForDetails.images?.[0] ||
                  selectedProductForDetails.img ||
                  "https://via.placeholder.com/300"
                }
                alt={selectedProductForDetails.name}
                className="object-contain w-full h-auto rounded-lg bg-gray-50"
              />
            </div>
            <div className="w-full space-y-4 md:w-1/2">
              <h2 className="text-xl font-bold text-gray-800">
                {selectedProductForDetails.name}
              </h2>
              <p className="text-2xl font-bold text-red-500">
                {selectedProductForDetails.price?.toLocaleString("vi-VN")}đ
              </p>

              <div className="flex items-center gap-2">
                <span className="text-yellow-400">★</span>
                <span className="font-medium">
                  {selectedProductForDetails.rating_average || 5.0}
                </span>
                <span className="text-sm text-gray-400">/ 5 đánh giá</span>
              </div>

              <div className="pt-2 space-y-2 text-sm text-gray-700 border-t">
                <p>
                  <span className="font-medium">Tình trạng: </span>{" "}
                  {selectedProductForDetails.stock_quantity > 0
                    ? "Còn hàng"
                    : "Hết hàng"}
                </p>
                <p>
                  <span className="font-medium">Thương hiệu: </span>{" "}
                  {selectedProductForDetails.seller_id === "admin"
                    ? "Chính hãng"
                    : "Đối tác"}
                </p>
              </div>

              <p className="mt-4 text-sm text-gray-600">
                Sản phẩm cao cấp được thiết kế đặc biệt mang lại sự thoải mái
                tối đa cho người sử dụng. Phù hợp cho không gian làm việc chuyên
                nghiệp.
              </p>

              <button
                onClick={(e) => {
                  setSelectedProductForDetails(null);
                  handleOrder(selectedProductForDetails, e);
                }}
                className="w-full py-3 mt-4 font-semibold text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Đặt hàng ngay
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Checkout Modal */}
      <Modal
        isOpen={!!selectedProductForCheckout}
        onClose={() => setSelectedProductForCheckout(null)}
        title="Thông tin thanh toán"
      >
        {selectedProductForCheckout && (
          <form onSubmit={submitOrder} className="space-y-4">
            <div className="flex gap-4 p-3 border rounded-lg bg-gray-50">
              <img
                src={
                  selectedProductForCheckout.images?.[0] ||
                  selectedProductForCheckout.img ||
                  "https://via.placeholder.com/80"
                }
                alt="Product"
                className="object-cover w-16 h-16 rounded"
              />
              <div>
                <p className="text-sm font-medium">
                  {selectedProductForCheckout.name}
                </p>
                <p className="font-bold text-red-500">
                  {selectedProductForCheckout.price?.toLocaleString("vi-VN")}đ
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Người nhận (*)
                </label>
                <input
                  required
                  type="text"
                  value={checkoutForm.receiver_name}
                  onChange={(e) =>
                    setCheckoutForm({
                      ...checkoutForm,
                      receiver_name: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Số điện thoại (*)
                </label>
                <input
                  required
                  type="tel"
                  value={checkoutForm.phone_number}
                  onChange={(e) =>
                    setCheckoutForm({
                      ...checkoutForm,
                      phone_number: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Địa chỉ giao hàng (*)
                </label>
                <textarea
                  required
                  value={checkoutForm.shipping_address}
                  onChange={(e) =>
                    setCheckoutForm({
                      ...checkoutForm,
                      shipping_address: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  rows="2"
                ></textarea>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-1/3">
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Số lượng
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={checkoutForm.quantity}
                    onChange={(e) =>
                      setCheckoutForm({
                        ...checkoutForm,
                        quantity: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Phương thức thanh toán
                  </label>
                  <select
                    value={checkoutForm.payment_method}
                    onChange={(e) =>
                      setCheckoutForm({
                        ...checkoutForm,
                        payment_method: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-white border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="COD">Thanh toán khi nhận hàng (COD)</option>
                    <option value="BankTransfer">Chuyển khoản / Thẻ</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Total */}
            <div className="pt-4 mt-6 border-t">
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold text-gray-700">
                  Tổng thanh toán:
                </span>
                <span className="text-xl font-bold text-red-600">
                  {(
                    (checkoutForm.quantity || 1) *
                    selectedProductForCheckout.price
                  ).toLocaleString("vi-VN")}
                  đ
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-3 font-bold text-white transition bg-blue-600 rounded-xl hover:bg-blue-700"
              >
                Xác nhận đặt hàng
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
