import React, { useEffect, useState } from "react";
import productApi from "../api/productApi";
import ProductPrice from "./common/ProductPrice";

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
        res = await productApi.getProductsByCategoryName(categoryName, page);
      } else {
        res = await productApi.getProductsWithPage(page);
      }

      if (res && res.data) {
        setProducts(res.data);
        setPagination(res.pagination || {});
      }
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
            className="overflow-hidden transition bg-white shadow cursor-pointer rounded-xl hover:shadow-lg h-full flex flex-col"
          >
            <img
              src={item.images?.[0] || "https://via.placeholder.com/150"}
              alt={item.name}
              className="object-cover w-full h-48"
            />

            <div className="p-3 flex flex-col flex-1">
              <p className="text-sm font-medium line-clamp-2 h-10 mb-2">
                {item.name}
              </p>

              <div className="mt-auto">
                <ProductPrice product={item} />
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOrder(item, e);
                  }}
                  className="w-full py-2 mt-3 text-xs border rounded-lg hover:bg-blue-600 hover:text-white transition-colors duration-200 font-medium"
                >
                  Đặt hàng
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* PAGINATION */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center mt-8 gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50 transition"
          >
            Trước
          </button>

          {[...Array(pagination.totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`w-10 h-10 border rounded-lg transition ${
                page === i + 1 ? "bg-blue-600 text-white font-bold" : "hover:bg-gray-50"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            disabled={page === pagination.totalPages}
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50 transition"
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
}
