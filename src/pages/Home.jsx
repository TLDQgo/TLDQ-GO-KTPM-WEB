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
  const [selectedProductForDetails, setSelectedProductForDetails] = useState(null);
  const [selectedProductForCheckout, setSelectedProductForCheckout] = useState(null);

  // Form states
  const [checkoutForm, setCheckoutForm] = useState({
    receiver_name: "",
    phone_number: "",
    shipping_address: "",
    quantity: 1,
    payment_method: "COD"
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
      payment_method: "COD"
    });
  };

  const submitOrder = async (e) => {
    e.preventDefault();
    if (!checkoutForm.receiver_name || !checkoutForm.phone_number || !checkoutForm.shipping_address) {
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
      const res = await fetch("http://localhost:3000/api/orders", {
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
    fetch("http://localhost:3000/api/products")
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
    <div className=" min-h-screen p-4">
      {/* TOP SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* LEFT BANNER */}
        <div className="md:col-span-2 relative rounded-2xl overflow-hidden">
          <img
            src="https://theme.hstatic.net/1000213518/1001329030/14/showssliimga1_1024x1024.png?v=770"
            alt="banner"
            className="w-full h-full object-cover"
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
              className="relative h-32 rounded-xl  cursor-pointer group"
            >
              {/* IMAGE BACKGROUND */}
              <img
                src={item.img}
                alt={item.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-300"
              />

              {/* OVERLAY */}
              <div className="absolute inset-0 bg-black/30"></div>

              {/* TEXT */}
              <div className="relative z-10 h-full flex items-center px-4">
                {/* <p className="text-white font-semibold text-lg">{item.title}</p> */}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CATEGORY SECTION */}
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-6 text-center">
        {categories.map((item, index) => (
          <div key={index} className="flex flex-col items-center">
            <div className="w-16 h-16 bg-white rounded-full shadow flex items-center justify-center mb-2 hover:scale-105 transition">
              <img
                src={item.img}
                alt={item.name}
                className="w-10 h-10 object-contain"
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
          className="w-full h-full object-cover mt-8 rounded-2xl"
        />
      </div>
      {/* Bàn học thông minh */}
      <div className="mt-10">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold border-b-2 border-blue-500 pb-2">
            BÀN HỌC THÔNG MINH
            <span className="text-gray-500 text-sm ml-2">(44 sản phẩm)</span>
          </h2>

          <div className="flex gap-2">
            <button className="px-3 py-1 border rounded-lg text-sm">
              Thương hiệu iSmart
            </button>
            <button className="px-3 py-1 border rounded-lg text-sm">
              Hanover cao cấp
            </button>
            <button className="px-3 py-1 border rounded-lg text-sm bg-blue-500 text-white">
              Tất Cả
            </button>
          </div>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {products.map((item, index) => (
            <div
              key={index}
              onClick={() => setSelectedProductForDetails(item)}
              className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden cursor-pointer"
            >
              {/* IMAGE */}
              <div className="relative">
                <img
                  src={item.images?.[0] || item.img || "https://via.placeholder.com/150"}
                  alt={item.name}
                  className="w-full h-48 object-cover"
                />

                {/* DISCOUNT */}
                <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                  Giảm 25%
                </span>

                {/* INSTALLMENT */}
                <span className="absolute top-2 right-2 bg-gray-100 text-xs px-2 py-1 rounded">
                  Trả góp 0%
                </span>
              </div>

              {/* CONTENT */}
              <div className="p-3">
                <p className="text-sm font-medium line-clamp-2 h-10">
                  {item.name}
                </p>

                <p className="text-red-500 font-bold mt-2 text-sm">
                  {item.price?.toLocaleString("vi-VN")}đ
                </p>

                <p className="text-gray-400 text-xs line-through">
                  {(item.price * 1.25 || 0).toLocaleString("vi-VN")}đ
                </p>

                {/* BUTTON */}
                <button 
                  onClick={(e) => handleOrder(item, e)}
                  className="mt-3 w-full border rounded-lg py-1 text-xs hover:bg-blue-500 hover:text-white transition"
                >
                  Đặt hàng ngay
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* VIEW ALL */}
        <div className="text-center mt-6">
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
          className="w-full h-full object-cover mt-8 rounded-2xl"
        />
      </div>
      {/* Bàn học thông minh */}
      <div className="mt-10">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold border-b-2 border-blue-500 pb-2">
            BÀN HỌC THÔNG MINH
            <span className="text-gray-500 text-sm ml-2">(44 sản phẩm)</span>
          </h2>

          <div className="flex gap-2">
            <button className="px-3 py-1 border rounded-lg text-sm">
              Thương hiệu iSmart
            </button>
            <button className="px-3 py-1 border rounded-lg text-sm">
              Hanover cao cấp
            </button>
            <button className="px-3 py-1 border rounded-lg text-sm bg-blue-500 text-white">
              Tất Cả
            </button>
          </div>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {products.map((item, index) => (
            <div
              key={index}
              onClick={() => setSelectedProductForDetails(item)}
              className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden cursor-pointer"
            >
              {/* IMAGE */}
              <div className="relative">
                <img
                  src={item.images?.[0] || item.img || "https://via.placeholder.com/150"}
                  alt={item.name}
                  className="w-full h-48 object-cover"
                />

                {/* DISCOUNT */}
                <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                  Giảm 25%
                </span>

                {/* INSTALLMENT */}
                <span className="absolute top-2 right-2 bg-gray-100 text-xs px-2 py-1 rounded">
                  Trả góp 0%
                </span>
              </div>

              {/* CONTENT */}
              <div className="p-3">
                <p className="text-sm font-medium line-clamp-2 h-10">
                  {item.name}
                </p>

                <p className="text-red-500 font-bold mt-2 text-sm">
                  {item.price?.toLocaleString("vi-VN")}đ
                </p>

                <p className="text-gray-400 text-xs line-through">
                  {(item.price * 1.25 || 0).toLocaleString("vi-VN")}đ
                </p>

                {/* BUTTON */}
                <button 
                  onClick={(e) => handleOrder(item, e)}
                  className="mt-3 w-full border rounded-lg py-1 text-xs hover:bg-blue-500 hover:text-white transition"
                >
                  Đặt hàng ngay
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* VIEW ALL */}
        <div className="text-center mt-6">
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
          className="w-full h-full object-cover mt-8 rounded-2xl"
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
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/2">
              <img 
                src={selectedProductForDetails.images?.[0] || selectedProductForDetails.img || "https://via.placeholder.com/300"} 
                alt={selectedProductForDetails.name}
                className="w-full h-auto rounded-lg object-contain bg-gray-50"
              />
            </div>
            <div className="w-full md:w-1/2 space-y-4">
              <h2 className="text-xl font-bold text-gray-800">{selectedProductForDetails.name}</h2>
              <p className="text-2xl font-bold text-red-500">
                {selectedProductForDetails.price?.toLocaleString("vi-VN")}đ
              </p>
              
              <div className="flex items-center gap-2">
                <span className="text-yellow-400">★</span>
                <span className="font-medium">{selectedProductForDetails.rating_average || 5.0}</span>
                <span className="text-gray-400 text-sm">/ 5 đánh giá</span>
              </div>

              <div className="pt-2 border-t text-sm text-gray-700 space-y-2">
                <p><span className="font-medium">Tình trạng: </span> {selectedProductForDetails.stock_quantity > 0 ? "Còn hàng" : "Hết hàng"}</p>
                <p><span className="font-medium">Thương hiệu: </span> {selectedProductForDetails.seller_id === "admin" ? "Chính hãng" : "Đối tác"}</p>
              </div>

              <p className="text-gray-600 text-sm mt-4">
                Sản phẩm cao cấp được thiết kế đặc biệt mang lại sự thoải mái tối đa cho người sử dụng. Phù hợp cho không gian làm việc chuyên nghiệp.
              </p>

              <button 
                onClick={(e) => {
                  setSelectedProductForDetails(null);
                  handleOrder(selectedProductForDetails, e);
                }}
                className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition mt-4"
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
            <div className="flex gap-4 p-3 bg-gray-50 rounded-lg border">
              <img 
                src={selectedProductForCheckout.images?.[0] || selectedProductForCheckout.img || "https://via.placeholder.com/80"} 
                alt="Product" 
                className="w-16 h-16 object-cover rounded"
              />
              <div>
                <p className="font-medium text-sm">{selectedProductForCheckout.name}</p>
                <p className="text-red-500 font-bold">{selectedProductForCheckout.price?.toLocaleString("vi-VN")}đ</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Người nhận (*)</label>
                <input 
                  required
                  type="text" 
                  value={checkoutForm.receiver_name}
                  onChange={(e) => setCheckoutForm({...checkoutForm, receiver_name: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 outline-none focus:ring-blue-500" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại (*)</label>
                <input 
                  required
                  type="tel" 
                  value={checkoutForm.phone_number}
                  onChange={(e) => setCheckoutForm({...checkoutForm, phone_number: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 outline-none focus:ring-blue-500" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ giao hàng (*)</label>
                <textarea 
                  required
                  value={checkoutForm.shipping_address}
                  onChange={(e) => setCheckoutForm({...checkoutForm, shipping_address: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 outline-none focus:ring-blue-500" 
                  rows="2"
                ></textarea>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-1/3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng</label>
                  <input 
                    type="number" 
                    min="1"
                    value={checkoutForm.quantity}
                    onChange={(e) => setCheckoutForm({...checkoutForm, quantity: parseInt(e.target.value) || 1})}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 outline-none focus:ring-blue-500" 
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phương thức thanh toán</label>
                  <select 
                    value={checkoutForm.payment_method}
                    onChange={(e) => setCheckoutForm({...checkoutForm, payment_method: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 outline-none bg-white focus:ring-blue-500"
                  >
                    <option value="COD">Thanh toán khi nhận hàng (COD)</option>
                    <option value="BankTransfer">Chuyển khoản / Thẻ</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Total */}
            <div className="border-t pt-4 mt-6">
              <div className="flex justify-between items-center mb-4">
                <span className="font-semibold text-gray-700">Tổng thanh toán:</span>
                <span className="text-xl font-bold text-red-600">
                  {((checkoutForm.quantity || 1) * selectedProductForCheckout.price).toLocaleString("vi-VN")}đ
                </span>
              </div>
              
              <button 
                type="submit"
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition"
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
