import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const Header = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const loadUser = () => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user data", e);
      }
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    loadUser();
    // Lắng nghe sự kiện đăng nhập thay đổi để cập nhật Header ngay lập tức
    window.addEventListener("auth-change", loadUser);
    return () => window.removeEventListener("auth-change", loadUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  return (
    <header className="w-full border-b bg-white">
      <div className="max-w-7xl mx-auto flex items-center justify-between py-4 px-6">
        {/* Logo */}
        <Link to="/">
          <div className="text-blue-600 font-bold text-xl">TLDQ-GO</div>
        </Link>
        {/* Menu */}
        <nav className="hidden md:flex gap-8 text-gray-700 items-center">
          <Link to="/">Trang Chủ</Link>
          <a href="#">Giới Thiệu</a>
          <a href="#">Việc Làm</a>
          <a href="#">Liên Hệ</a>
          <a href="#">Tin Tức</a>
        </nav>
        {/* Actions */}
        <div className="flex gap-3 items-center">
          {user ? (
            <>
              <Link to="/profile" className="font-semibold text-gray-700 mr-4 hover:text-blue-600 transition">
                Chào, {user.full_name || user.email}
              </Link>
              <button 
                onClick={handleLogout}
                className="border px-4 py-2 rounded-lg text-red-600 border-red-600 hover:bg-red-50 transition"
              >
                Đăng Xuất
              </button>
            </>
          ) : (
            <>
              <Link to="/login">
                <button className="border px-4 py-2 rounded-lg hover:bg-gray-50 transition">
                  Đăng Nhập
                </button>
              </Link>
              <Link to="/register">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                  Đăng Ký
                </button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
