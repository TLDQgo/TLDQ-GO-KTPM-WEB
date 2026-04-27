import React, { useEffect, useState } from "react";
import productApi from "../api/productApi";

export default function ProductGrid({
  categoryName = "",
  onClickItem,
  onOrder,
}) {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);

      let res;

      if (categoryName) {
        res = await productApi.getByCategoryName(categoryName, page);
      } else {
        res = await productApi.getProductsWithPage(page);
      }

      setProducts(res.data);
      setPagination(res.pagination);
    } catch (err) {
      console.error("Lỗi load sản phẩm:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, categoryName]);

  return (
    <div>
      {/* LOADING */}
      {loading && (
        <div className="text-center py-10">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      )}

      {/* GRID */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {products.map((item) => (
          <div
            key={item._id}
            onClick={() => onClickItem(item)}
            className="overflow-hidden transition bg-white shadow cursor-pointer rounded-xl hover:shadow-lg"
          >
            <img
              src={item.images?.[0] || "https://via.placeholder.com/150"}
              alt={item.name}
              className="object-cover w-full h-48"
            />

            <div className="p-3">
              <p className="h-10 text-sm font-medium line-clamp-2">
                {item.name}
              </p>

              <p className="mt-2 text-sm font-bold text-red-500">
                {item.price?.toLocaleString("vi-VN")}đ
              </p>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOrder(item, e);
                }}
                className="w-full py-1 mt-3 text-xs border rounded-lg hover:bg-blue-500 hover:text-white"
              >
                Đặt hàng
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* PAGINATION */}
      <div className="flex justify-center mt-6 gap-2">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="px-3 py-1 border rounded"
        >
          Prev
        </button>

        {[...Array(pagination.totalPages || 1)].map((_, i) => (
          <button
            key={i}
            onClick={() => setPage(i + 1)}
            className={`px-3 py-1 border rounded ${
              page === i + 1 ? "bg-blue-500 text-white" : ""
            }`}
          >
            {i + 1}
          </button>
        ))}

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
