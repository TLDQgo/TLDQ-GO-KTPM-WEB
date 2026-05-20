import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Search } from "lucide-react";
import productApi from "../api/productApi";
import ProductPrice from "../components/common/ProductPrice";

const SORT_OPTIONS = [
  { value: "newest", label: "Mới nhất" },
  { value: "best_seller", label: "Bán chạy" },
  { value: "price_asc", label: "Giá tăng dần" },
  { value: "price_desc", label: "Giá giảm dần" },
  { value: "rating", label: "Đánh giá cao" },
];

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const q = searchParams.get("q") || "";
  const sort = searchParams.get("sort") || "newest";
  const page = parseInt(searchParams.get("page") || "1");
  const minRatingParam = parseInt(searchParams.get("minRating") || "0");

  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["search", q, sort, minPrice, maxPrice, minRatingParam, page],
    queryFn: () =>
      productApi.search({
        q: q || undefined,
        sort,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
        minRating: minRatingParam > 0 ? minRatingParam : undefined,
        page,
        limit: 12,
      }),
    enabled: true,
    staleTime: 2 * 60 * 1000,
  });

  const products = data?.data ?? [];
  const pagination = data?.pagination ?? {};

  const updateParams = (updates) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([k, v]) => {
      if (v !== undefined && v !== "") next.set(k, v);
      else next.delete(k);
    });
    next.set("page", "1");
    setSearchParams(next);
  };

  const handleOrder = (product, e) => {
    e.stopPropagation();
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      toast.warning("Vui lòng đăng nhập để đặt hàng!");
      return;
    }
    navigate("/checkout", {
      state: {
        items: [
          {
            product_id: product._id,
            product_name: product.name,
            quantity: 1,
            price: product.original_price ?? product.price,
            discount_price: product.discount_price ?? product.price,
            image: Array.isArray(product.images) ? product.images[0] : product.image_url,
          },
        ],
        from: "product",
      },
    });
  };

  const handleApplyFilter = () => {
    updateParams({ minPrice, maxPrice });
  };

  const handleResetFilter = () => {
    setMinPrice("");
    setMaxPrice("");
    const next = new URLSearchParams(searchParams);
    next.delete("minPrice");
    next.delete("maxPrice");
    next.delete("minRating");
    next.set("page", "1");
    setSearchParams(next);
  };

  const handleRatingFilter = (star) => {
    updateParams({ minRating: star === minRatingParam ? undefined : star });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-800">
          {q ? (
            <>
              Kết quả tìm kiếm cho:{" "}
              <span className="text-blue-600">"{q}"</span>
            </>
          ) : (
            "Tất cả sản phẩm"
          )}
        </h1>
        {!isLoading && (
          <p className="text-sm text-gray-500 mt-1">
            {pagination.totalItems ?? 0} sản phẩm
          </p>
        )}
      </div>

      <div className="flex gap-6">
        {/* SIDEBAR FILTER */}
        <aside className="hidden md:block w-56 shrink-0">
          <div className="border rounded-xl p-4 space-y-5">
            <div>
              <h3 className="font-semibold text-sm text-gray-700 mb-2">Sắp xếp</h3>
              <div className="space-y-1">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => updateParams({ sort: opt.value })}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition ${
                      sort === opt.value
                        ? "bg-blue-600 text-white"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-sm text-gray-700 mb-2">Đánh giá tối thiểu</h3>
              <div className="space-y-1">
                {[5, 4, 3, 2, 1].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRatingFilter(star)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition ${
                      minRatingParam === star
                        ? "bg-yellow-400 text-white font-medium"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    {"★".repeat(star)}{"☆".repeat(5 - star)}{star < 5 ? " trở lên" : ""}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-sm text-gray-700 mb-2">Khoảng giá</h3>
              <div className="space-y-2">
                <input
                  type="number"
                  placeholder="Giá tối thiểu"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full border rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-400"
                />
                <input
                  type="number"
                  placeholder="Giá tối đa"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full border rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-400"
                />
                <button
                  onClick={handleApplyFilter}
                  className="w-full bg-blue-600 text-white text-sm py-1.5 rounded-lg hover:bg-blue-700 transition"
                >
                  Áp dụng
                </button>
                {(minPrice || maxPrice || minRatingParam > 0) && (
                  <button
                    onClick={handleResetFilter}
                    className="w-full border text-sm py-1.5 rounded-lg hover:bg-gray-50 transition text-gray-600"
                  >
                    Xóa bộ lọc
                  </button>
                )}
              </div>
            </div>
          </div>
        </aside>

        {/* PRODUCT GRID */}
        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="rounded-xl bg-gray-100 animate-pulse h-64" />
              ))}
            </div>
          ) : isError ? (
            <div className="text-center py-20 text-red-500">Có lỗi xảy ra. Vui lòng thử lại.</div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Không tìm thấy sản phẩm nào phù hợp.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => navigate(`/san-pham/${item._id}`)}
                    className="overflow-hidden transition bg-white shadow cursor-pointer rounded-xl hover:shadow-lg"
                  >
                    <img
                      src={item.images?.[0] || "https://via.placeholder.com/150"}
                      alt={item.name}
                      className="object-cover w-full h-48"
                    />
                    <div className="p-3">
                      <p className="text-sm font-medium line-clamp-2">{item.name}</p>
                      <div className="mt-2">
                        <ProductPrice product={item} className="text-sm" showBadge={false} />
                      </div>
                      <button
                        onClick={(e) => handleOrder(item, e)}
                        className="w-full py-1 mt-3 text-xs border rounded-lg hover:bg-blue-500 hover:text-white transition"
                      >
                        Đặt hàng
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* PAGINATION */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    disabled={page === 1}
                    onClick={() => updateParams({ page: page - 1 })}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    Prev
                  </button>
                  {[...Array(pagination.totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => updateParams({ page: i + 1 })}
                      className={`px-3 py-1 border rounded ${
                        page === i + 1 ? "bg-blue-500 text-white" : ""
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    disabled={page === pagination.totalPages}
                    onClick={() => updateParams({ page: page + 1 })}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
