import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BarChart2,
  Package,
  ShoppingBag,
  LogOut,
} from "lucide-react";

const NAV = [
  { key: "/admin", label: "Tổng quan", icon: LayoutDashboard, exact: true },
  { key: "/admin/users", label: "Quản lý người dùng", icon: Users },
  { key: "/admin/stats", label: "Thống kê hệ thống", icon: BarChart2 },
];

export default function SidebarAdmin() {
  const { pathname } = useLocation();

  const isActive = (item) =>
    item.exact ? pathname === item.key : pathname.startsWith(item.key);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/admin/login";
  };

  return (
    <div className="w-[240px] h-full bg-gray-900 fixed top-[56px] left-0 bottom-0 flex flex-col py-4 border-r border-gray-700">
      <ul className="flex flex-col gap-1 px-3 flex-1">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);
          return (
            <Link to={item.key} key={item.key}>
              <li
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm cursor-pointer transition ${
                  active
                    ? "bg-indigo-600 text-white"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </li>
            </Link>
          );
        })}
      </ul>
      <div className="px-3 pb-2">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-red-400 transition"
        >
          <LogOut size={18} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  );
}
