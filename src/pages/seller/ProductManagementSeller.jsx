import React, { useEffect, useState } from "react";
import productApi from "../../api/productApi";
import useAuthStore from "../../store/useAuthStore";

export default function ProductManagementSeller() {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const user = useAuthStore((s) => s.user);
  const sellerId = user?._id;

  // CALL API
  const fetchProducts = async (pageNumber = 1) => {
    if (!sellerId) return;
    try {
      const res = await productApi.getProductsBySeller(sellerId, pageNumber);

      console.log("API response:", res);

      setProducts(res.data);
      setPagination(res.pagination);
    } catch (error) {
      console.error("Lỗi fetch products:", error);
    }
  };

  useEffect(() => {
    fetchProducts(page);
  }, [page, sellerId]);
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xoá sản phẩm này?")) return;

    try {
      await productApi.delete(id);

      // 👉 update UI ngay (không cần gọi lại API)
      setProducts((prev) => prev.filter((item) => item._id !== id));

      alert("✅ Xoá thành công");
    } catch (error) {
      console.error("Lỗi xoá:", error);
      alert("❌ Xoá thất bại");
    }
  };
  return (
    <div className="bg-gray-100 min-h-screen p-4">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Quản lý sản phẩm</h1>

        <div className="text-sm text-gray-500">
          Tổng sản phẩm:{" "}
          <span className="text-red-500">{pagination.totalItems || 0}</span>
        </div>
      </div>

      {/* ACTION */}
      <div className="flex justify-between items-center bg-white p-4 rounded shadow mb-4">
        <a
          href="/seller/them-san-pham"
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          + Thêm sản phẩm mới
        </a>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Sản phẩm</th>
              <th className="p-3">Giá</th>
              <th className="p-3">Danh mục</th>
              <th className="p-3">Số lượng</th>
              <th className="p-3">Thao tác</th>
            </tr>
          </thead>

          <tbody>
            {products.map((item) => (
              <tr key={item._id} className="border-t hover:bg-gray-50">
                <td className="p-3 flex gap-3 items-center">
                  <img
                    src={item.images?.[0]}
                    alt=""
                    className="w-16 h-16 object-cover rounded"
                  />
                  <span>{item.name}</span>
                </td>

                <td className="p-3 text-center text-red-500 font-semibold">
                  {item.price?.toLocaleString()}đ
                </td>

                <td className="p-3 text-center">
                  {item.category_id?.name || "Chưa có"}
                </td>

                <td className="p-3 text-center">{item.stock_quantity}</td>

                <td className="p-3">
                  <div className="flex justify-center gap-2">
                    <button className="px-2 py-1 border rounded">✏️</button>
                    <button className="px-2 py-1 border rounded">👁</button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="px-2 py-1 border text-red-500 rounded hover:bg-red-50"
                    >
                      🗑
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex justify-end mt-4 gap-2">
        {/* PREV */}
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="px-3 py-1 border rounded"
        >
          Prev
        </button>

        {/* PAGE NUMBERS */}
        {[...Array(pagination.totalPages || 1)].map((_, i) => (
          <button
            key={i}
            onClick={() => setPage(i + 1)}
            className={`px-3 py-1 border rounded ${
              page === i + 1 ? "bg-red-500 text-white" : ""
            }`}
          >
            {i + 1}
          </button>
        ))}

        {/* NEXT */}
        <button
          disabled={page === pagination.totalPages}
          onClick={() => setPage(page + 1)}
          className="px-3 py-1 border rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
}
