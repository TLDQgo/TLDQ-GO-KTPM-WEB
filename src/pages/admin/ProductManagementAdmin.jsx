import React, { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:3002";

export default function ProductManagementAdmin() {
  const [products, setProducts] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(false);

  // 🔥 pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // =========================
  // FETCH PRODUCTS
  // =========================
  const fetchProducts = async (currentPage = page) => {
    try {
      setLoading(true);

      const res = await axios.get(`${API}/products/admin`, {
        params: {
          page: currentPage,
          keyword,
          status: filterStatus === "all" ? undefined : filterStatus,
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const items = res.data.items || [];
      const pagination = res.data.pagination || {};

      const normalized = items.map((p) => ({
        ...p,
        image: p.images?.[0] || "",
        categoryName: p.category_id?.name || "Chưa có danh mục",
        quantity: p.stock_quantity,
      }));

      setProducts(normalized);
      setTotalPages(pagination.totalPages || 1);
      setPage(pagination.page || currentPage);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // DEBOUNCE SEARCH
  // =========================
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [keyword, filterStatus]);

  // =========================
  // CHANGE PAGE
  // =========================
  const handleChangePage = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    fetchProducts(newPage);
  };

  // =========================
  // APPROVE
  // =========================
  const handleApprove = async (id) => {
    try {
      await axios.patch(
        `${API}/products/${id}/approve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      fetchProducts(page);
    } catch (error) {
      console.error(error);
    }
  };

  // =========================
  // REJECT
  // =========================
  const handleReject = async (id) => {
    try {
      await axios.patch(
        `${API}/products/${id}/reject`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      fetchProducts(page);
    } catch (error) {
      console.error(error);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-600";
      case "rejected":
        return "bg-red-100 text-red-600";
      default:
        return "bg-yellow-100 text-yellow-600";
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      {/* ================= TOP ================= */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
        <input
          type="text"
          placeholder="🔍 Tìm sản phẩm..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="px-4 py-2 border rounded-lg w-full md:w-1/3"
        />

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="all">Tất cả</option>
          <option value="pending">Chờ duyệt</option>
          <option value="approved">Đã duyệt</option>
          <option value="rejected">Đã hủy</option>
        </select>
      </div>

      {/* ================= TABLE ================= */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {/* HEADER */}
        <div className="grid grid-cols-7 gap-4 p-4 font-semibold border-b text-gray-600 text-sm">
          <div className="col-span-2">Sản phẩm</div>
          <div>Giá</div>
          <div>Danh mục</div>
          <div>Số lượng</div>
          <div>Ngày</div>
          <div>Trạng thái</div>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="text-center p-6 text-gray-400">Đang tải...</div>
        )}

        {/* LIST */}
        {!loading &&
          products.map((item) => (
            <div
              key={item._id}
              className="grid grid-cols-7 gap-4 p-4 items-center border-b hover:bg-gray-50"
            >
              <div className="col-span-2 flex items-center gap-3">
                <img
                  src={item.image || "https://via.placeholder.com/80"}
                  className="w-14 h-14 rounded-lg object-cover border"
                />
                <span className="font-medium text-sm">{item.name}</span>
              </div>

              <div className="text-red-500 font-semibold text-sm">
                {item.price?.toLocaleString()}đ
              </div>

              {/* FIX CATEGORY */}
              <div className="text-sm text-gray-600">{item.categoryName}</div>

              {/* FIX STOCK */}
              <div className="text-sm">{item.quantity}</div>

              <div className="text-sm text-gray-500">
                {new Date(item.createdAt).toLocaleDateString("vi-VN")}
              </div>

              <div className="flex flex-col gap-2">
                <span
                  className={`px-2 py-1 text-xs rounded-full w-fit ${getStatusStyle(
                    item.status,
                  )}`}
                >
                  {item.status}
                </span>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(item._id)}
                    className="px-2 py-1 text-xs bg-green-500 text-white rounded"
                  >
                    ✔
                  </button>

                  <button
                    onClick={() => handleReject(item._id)}
                    className="px-2 py-1 text-xs bg-red-500 text-white rounded"
                  >
                    ✖
                  </button>
                </div>
              </div>
            </div>
          ))}

        {/* EMPTY */}
        {!loading && products.length === 0 && (
          <div className="text-center p-6 text-gray-400">Không có sản phẩm</div>
        )}
      </div>

      {/* ================= PAGINATION ================= */}
      <div className="flex justify-center items-center gap-3 mt-6">
        <button
          onClick={() => handleChangePage(page - 1)}
          disabled={page === 1}
          className="px-3 py-1 bg-white border rounded disabled:opacity-50"
        >
          ◀
        </button>

        <span className="text-sm">
          Page {page} / {totalPages}
        </span>

        <button
          onClick={() => handleChangePage(page + 1)}
          disabled={page === totalPages}
          className="px-3 py-1 bg-white border rounded disabled:opacity-50"
        >
          ▶
        </button>
      </div>
    </div>
  );
}
