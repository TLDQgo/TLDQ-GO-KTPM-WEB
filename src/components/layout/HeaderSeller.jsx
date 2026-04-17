import React from "react";
import { Bell, Mail, ShoppingCart, Menu } from "lucide-react";

export default function HeaderSeller() {
  return (
    <div className="flex items-center justify-between px-6 py-3 bg-white shadow fixed top-0 left-0 right-0 z-50">
      {/* LEFT */}
      <div className="flex items-center gap-4">
        {/* LOGO */}
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 text-white bg-red-500 rounded">
            🛒
          </div>
          <a href="/seller">
            <span className="text-lg font-semibold">Seller Center</span>
          </a>
        </div>

        {/* MENU ICON */}
        <Menu className="w-5 h-5 text-gray-600 cursor-pointer" />

        {/* TEXT */}
        <span className="text-gray-500">Seller Center</span>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-6">
        {/* ICONS */}
        <div className="relative">
          <Mail className="w-5 h-5 text-gray-600 cursor-pointer" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        </div>

        <div className="relative">
          <ShoppingCart className="w-5 h-5 text-gray-600 cursor-pointer" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        </div>

        <div className="relative">
          <Bell className="w-5 h-5 text-gray-600 cursor-pointer" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        </div>

        {/* USER */}
        <div className="flex items-center gap-2 cursor-pointer">
          <span className="text-sm text-gray-600">Xin chào, Quý</span>
          <img
            src="https://i.pravatar.cc/40"
            alt="avatar"
            className="w-8 h-8 rounded-full"
          />
        </div>
      </div>
    </div>
  );
}
