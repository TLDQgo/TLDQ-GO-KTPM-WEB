import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/useAuthStore";
import {
  Home,
  Package,
  ShoppingCart,
  BarChart2,
  Tag,
  Truck,
  Wallet,
  Settings,
  HelpCircle,
  LogOut,
} from "lucide-react";

export default function SidebarSeller() {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const [activeItem, setActiveItem] = useState("home");

  const handleItemClick = (item) => {
    setActiveItem(item);
  };

  const handleLogout = () => {
    logout();
    window.dispatchEvent(new Event("auth-change"));
    navigate("/login-seller");
  };

  return (
    <div className="w-[260px] h-full bg-white p-4 fixed top-[60px] left-0 pt-6 border-r border-gray-200">
      {/* MENU */}
      <ul className="flex flex-col space-y-2 text-sm">
        <Link to="/seller">
          <li
            className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition ${
              activeItem === "home"
                ? "bg-red-50 text-red-500 font-semibold"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            onClick={() => handleItemClick("home")}
          >
            <Home size={18} />
            <span>Trang chủ</span>
          </li>
        </Link>

        <Link to="/seller/quan-ly-san-pham">
          <li
            className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition ${
              activeItem === "products"
                ? "bg-red-50 text-red-500 font-semibold"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            onClick={() => handleItemClick("products")}
          >
            <Package size={18} />
            <span>Quản lý sản phẩm</span>
          </li>
        </Link>

        <Link to="/seller/orders">
          <li
            className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition ${
              activeItem === "orders"
                ? "bg-red-50 text-red-500 font-semibold"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            onClick={() => handleItemClick("orders")}
          >
            <ShoppingCart size={18} />
            <span>Đơn hàng</span>
          </li>
        </Link>

        <Link to="/seller/thong-ke">
          <li
            className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition ${
              activeItem === "stats"
                ? "bg-red-50 text-red-500 font-semibold"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            onClick={() => handleItemClick("stats")}
          >
            <BarChart2 size={18} />
            <span>Thống kê doanh thu</span>
          </li>
        </Link>

        <Link to="/seller/promotions">
          <li
            className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition ${
              activeItem === "promotions"
                ? "bg-red-50 text-red-500 font-semibold"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            onClick={() => handleItemClick("promotions")}
          >
            <Tag size={18} />
            <span>Khuyến mãi</span>
          </li>
        </Link>

        <Link to="/seller/shipping">
          <li
            className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition ${
              activeItem === "shipping"
                ? "bg-red-50 text-red-500 font-semibold"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            onClick={() => handleItemClick("shipping")}
          >
            <Truck size={18} />
            <span>Kho & vận chuyển</span>
          </li>
        </Link>

        <Link to="/seller/finance">
          <li
            className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition ${
              activeItem === "finance"
                ? "bg-red-50 text-red-500 font-semibold"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            onClick={() => handleItemClick("finance")}
          >
            <Wallet size={18} />
            <span>Tài chính</span>
          </li>
        </Link>

        <Link to="/seller/settings">
          <li
            className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition ${
              activeItem === "settings"
                ? "bg-red-50 text-red-500 font-semibold"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            onClick={() => handleItemClick("settings")}
          >
            <Settings size={18} />
            <span>Cài đặt Shop</span>
          </li>
        </Link>

        <Link to="/seller/support">
          <li
            className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition ${
              activeItem === "support"
                ? "bg-red-50 text-red-500 font-semibold"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            onClick={() => handleItemClick("support")}
          >
            <HelpCircle size={18} />
            <span>Hỗ trợ</span>
          </li>
        </Link>

        {/* LOGOUT */}
        <li
          className="flex items-center gap-3 p-2 mt-4 text-red-500 rounded-md cursor-pointer hover:bg-red-50 transition"
          onClick={handleLogout}
        >
          <LogOut size={18} />
          <span>Đăng xuất</span>
        </li>
      </ul>
    </div>
  );
}
