import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import orderApi from "../api/orderApi";
import cartApi from "../api/cartApi";

export default function PaymentResult() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const hasVerified = useRef(false);

  const [status, setStatus] = useState("loading"); // loading | success | failed
  const [message, setMessage] = useState("");

  const user = (() => {
    try { return JSON.parse(localStorage.getItem("user")); }
    catch { return null; }
  })();

  useEffect(() => {
    if (hasVerified.current) return;
    hasVerified.current = true;

    const queryString = search.startsWith("?") ? search.slice(1) : search;

    orderApi
      .verifyVNPayPayment(queryString)
      .then((data) => {
        if (data?.success) {
          setStatus("success");
          setMessage("Thanh toán thành công! Đơn hàng của bạn đang được xử lý.");
          const fromCart = sessionStorage.getItem("vnpay_from_cart") === "true";
          sessionStorage.removeItem("vnpay_from_cart");
          if (fromCart && user?._id) {
            cartApi.clearCart(user._id).catch(() => { });
          }
        } else {
          setStatus("failed");
          setMessage(data?.message || "Thanh toán thất bại hoặc bị huỷ.");
        }
      })
      .catch(() => {
        setStatus("failed");
        setMessage("Không thể xác minh kết quả thanh toán. Vui lòng liên hệ hỗ trợ.");
      });
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Đang xác nhận thanh toán...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-8 text-center">
        {status === "success" ? (
          <>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Thanh toán thành công</h1>
            <p className="text-gray-500 mb-6">{message}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => navigate("/")}
                className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 text-sm font-medium transition"
              >
                Tiếp tục mua sắm
              </button>
              <button
                onClick={() => navigate("/don-hang")}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
              >
                Xem đơn hàng
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Thanh toán thất bại</h1>
            <p className="text-gray-500 mb-6">{message}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => navigate("/gio-hang")}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
              >
                Quay lại giỏ hàng
              </button>
              <button
                onClick={() => navigate("/")}
                className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 text-sm font-medium transition"
              >
                Trang chủ
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
