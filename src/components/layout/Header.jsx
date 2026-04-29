import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../../store/useAuthStore";

const Header = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const setUserStore = useAuthStore((s) => s.setUser);

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
    window.addEventListener("auth-change", loadUser);
    return () => window.removeEventListener("auth-change", loadUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  return (
    <header className="w-full border-b bg-white">
      <div className="max-w-7xl mx-auto flex items-center justify-between py-4 px-6">
        {/* LOGO */}
        <Link to="/">
          <div className="text-blue-600 font-bold text-xl">TLDQ-GO</div>
        </Link>

        {/* MENU */}
        <nav className="hidden md:flex gap-8 text-gray-700 items-center">
          <Link to="/" className="hover:text-blue-600">
            Trang Chủ
          </Link>
          <a href="#" className="hover:text-blue-600">
            Giới Thiệu
          </a>
          <a href="#" className="hover:text-blue-600">
            Việc Làm
          </a>
          <a href="#" className="hover:text-blue-600">
            Liên Hệ
          </a>
          <a href="#" className="hover:text-blue-600">
            Tin Tức
          </a>
        </nav>

        {/* ACTIONS */}
        <div className="flex gap-3 items-center">
          {user ? (
            <>
              {/* USER */}
              <Link
                to="/profile"
                className="font-semibold text-gray-700 hover:text-blue-600 transition flex items-center gap-2"
              >
                {user.avatar_url && (
                  <img
                    src={user.avatar_url}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full object-cover"
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                )}
                Chào, {user.full_name || user.email}
              </Link>

              {/* LOGOUT */}
              <button
                onClick={handleLogout}
                className="border px-4 py-2 rounded-lg text-red-600 border-red-600 hover:bg-red-50 transition"
              >
                Đăng Xuất
              </button>
            </>
          ) : (
            <>
              {/* LOGIN BUTTON */}
              <Link to="/login">
                <button className="border px-4 py-2 rounded-lg hover:bg-gray-50 transition">
                  Đăng Nhập
                </button>
              </Link>

              {/* REGISTER */}
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
