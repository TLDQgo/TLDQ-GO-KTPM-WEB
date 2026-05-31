import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Store, Star, Package, Clock, MapPin, Phone, Mail,
  Truck, RotateCcw, ChevronLeft, ChevronRight,
} from "lucide-react";
import authApi from "../api/authApi";
import productApi from "../api/productApi";
import ProductPrice from "../components/common/ProductPrice";

function StarRating({ value = 0, max = 5 }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }, (_, i) => i + 1).map((s) => (
        <Star
          key={s}
          size={14}
          className={s <= Math.round(value) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
        />
      ))}
    </div>
  );
}

function RatingBar({ star, count, total }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-4 text-right text-gray-500">{star}</span>
      <Star size={11} className="fill-yellow-400 text-yellow-400 shrink-0" />
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-6 text-gray-400">{count}</span>
    </div>
  );
}

export default function ShopPage() {
  const { sellerId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("products");
  const [productPage, setProductPage] = useState(1);
  const [reviewPage, setReviewPage] = useState(1);

  const { data: sellerRaw, isLoading: sellerLoading } = useQuery({
    queryKey: ["sellerProfile", sellerId],
    queryFn: () => authApi.getSellerPublicProfile(sellerId),
    staleTime: 5 * 60 * 1000,
  });
  const seller = sellerRaw?.data ?? sellerRaw;

  const { data: productsRaw, isLoading: productsLoading } = useQuery({
    queryKey: ["sellerProducts", sellerId, productPage],
    queryFn: () => productApi.getProductsBySeller(sellerId, productPage),
    staleTime: 2 * 60 * 1000,
    enabled: activeTab === "products",
  });
  const products = productsRaw?.data ?? [];
  const productPagination = productsRaw?.pagination ?? {};

  const { data: reviewsRaw, isLoading: reviewsLoading } = useQuery({
    queryKey: ["sellerReviews", sellerId, reviewPage],
    queryFn: () => productApi.getSellerReviews(sellerId, reviewPage),
    staleTime: 60 * 1000,
    enabled: activeTab === "reviews",
  });
  const reviews = reviewsRaw?.data ?? [];
  const reviewPagination = reviewsRaw ?? {};

  // Rating distribution from reviews
  const ratingDist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));
  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : seller?.rating?.toFixed(1) || "0.0";

  const tabs = [
    { id: "products", label: "Sản Phẩm" },
    { id: "reviews", label: "Đánh Giá" },
    { id: "info", label: "Thông Tin Shop" },
  ];

  if (sellerLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Store className="w-12 h-12 text-gray-300" />
        <p className="text-gray-500">Không tìm thấy cửa hàng này.</p>
        <button onClick={() => navigate(-1)} className="text-sm text-blue-600 hover:underline">
          Quay lại
        </button>
      </div>
    );
  }

  const shopName = seller.shop_name || "Cửa hàng";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ===== SHOP HEADER ===== */}
      <div className="relative">
        {/* Banner */}
        <div className="relative h-44 md:h-52 bg-gradient-to-r from-orange-400 to-rose-500 overflow-hidden">
          {seller.banner_url && (
            <img
              src={seller.banner_url}
              alt="Banner"
              className="w-full h-full object-cover"
              onError={(e) => { e.target.style.display = "none"; }}
            />
          )}
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Shop meta row */}
        <div className="bg-white shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-start gap-4 flex-wrap">
              {/* Logo */}
              <div className="relative -mt-10 shrink-0">
                <div className="w-20 h-20 rounded-full border-4 border-white bg-white shadow-md overflow-hidden">
                  {seller.logo_url ? (
                    <img
                      src={seller.logo_url}
                      alt={shopName}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = "none"; }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <Store className="w-9 h-9 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 pt-1">
                <h1 className="text-xl font-bold text-gray-900 truncate">{shopName}</h1>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mt-1.5 text-sm text-gray-500">
                  {(seller.rating > 0 || reviews.length > 0) && (
                    <span className="flex items-center gap-1">
                      <Star size={14} className="fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold text-gray-700">{avgRating}</span>
                      {reviewPagination.total > 0 && (
                        <span>({reviewPagination.total} đánh giá)</span>
                      )}
                    </span>
                  )}
                  {productPagination.totalItems > 0 && (
                    <span className="flex items-center gap-1">
                      <Package size={14} />
                      {productPagination.totalItems} sản phẩm
                    </span>
                  )}
                  {seller.operating_hours && (
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {seller.operating_hours}
                    </span>
                  )}
                </div>
                {seller.description && (
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">{seller.description}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== TABS ===== */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-3.5 text-sm font-medium transition border-b-2 ${
                  activeTab === tab.id
                    ? "text-orange-500 border-orange-500"
                    : "text-gray-500 border-transparent hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* ===== TAB: PRODUCTS ===== */}
        {activeTab === "products" && (
          <div>
            {productsLoading ? (
              <div className="flex justify-center py-16">
                <div className="animate-spin w-8 h-8 border-4 border-orange-400 border-t-transparent rounded-full" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p>Cửa hàng chưa có sản phẩm nào.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {products.map((item) => (
                    <div
                      key={item._id}
                      onClick={() => navigate(`/san-pham/${item._id}`)}
                      className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
                    >
                      <img
                        src={item.images?.[0] || "https://via.placeholder.com/200"}
                        alt={item.name}
                        className="w-full aspect-square object-cover"
                        onError={(e) => { e.target.src = "https://via.placeholder.com/200"; }}
                      />
                      <div className="p-2.5">
                        <p className="text-xs font-medium line-clamp-2 text-gray-800 mb-1.5">
                          {item.name}
                        </p>
                        {item.rating_average > 0 && (
                          <div className="flex items-center gap-1 mb-1">
                            <StarRating value={item.rating_average} />
                            <span className="text-[10px] text-gray-400">
                              ({item.rating_average.toFixed(1)})
                            </span>
                          </div>
                        )}
                        <ProductPrice product={item} className="text-sm" showBadge={false} />
                        {item.sold > 0 && (
                          <p className="text-[10px] text-gray-400 mt-0.5">Đã bán {item.sold}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {productPagination.totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-8">
                    <button
                      onClick={() => setProductPage((p) => Math.max(1, p - 1))}
                      disabled={productPage === 1}
                      className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="text-sm text-gray-600 px-2">
                      {productPage} / {productPagination.totalPages}
                    </span>
                    <button
                      onClick={() => setProductPage((p) => Math.min(productPagination.totalPages, p + 1))}
                      disabled={productPage === productPagination.totalPages}
                      className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ===== TAB: REVIEWS ===== */}
        {activeTab === "reviews" && (
          <div>
            {reviewsLoading ? (
              <div className="flex justify-center py-16">
                <div className="animate-spin w-8 h-8 border-4 border-orange-400 border-t-transparent rounded-full" />
              </div>
            ) : (
              <>
                {/* Rating summary */}
                {reviewPagination.total > 0 && (
                  <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5 flex flex-col sm:flex-row items-center gap-6">
                    <div className="text-center shrink-0">
                      <p className="text-5xl font-bold text-gray-900">{avgRating}</p>
                      <StarRating value={parseFloat(avgRating)} max={5} />
                      <p className="text-xs text-gray-500 mt-1">{reviewPagination.total} đánh giá</p>
                    </div>
                    <div className="flex-1 w-full sm:w-auto space-y-1.5">
                      {ratingDist.map(({ star, count }) => (
                        <RatingBar key={star} star={star} count={count} total={reviews.length} />
                      ))}
                    </div>
                  </div>
                )}

                {reviews.length === 0 ? (
                  <div className="text-center py-16 text-gray-400">
                    <Star className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>Chưa có đánh giá nào cho cửa hàng này.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((r) => {
                      const displayName = r.user_name || "Khách hàng";
                      const initial = displayName[0].toUpperCase();
                      const date = r.createdAt
                        ? new Date(r.createdAt).toLocaleDateString("vi-VN")
                        : "";
                      return (
                        <div key={r._id} className="bg-white rounded-2xl border border-gray-100 p-5">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 font-bold flex items-center justify-center text-sm shrink-0">
                              {initial}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between flex-wrap gap-1">
                                <span className="text-sm font-semibold text-gray-800">
                                  {displayName}
                                </span>
                                <span className="text-xs text-gray-400">{date}</span>
                              </div>
                              <StarRating value={r.rating} />
                              {r.product_name && (
                                <button
                                  onClick={() => navigate(`/san-pham/${r.product_id}`)}
                                  className="mt-1 flex items-center gap-1.5 text-xs text-blue-500 hover:underline"
                                >
                                  {r.product_image && (
                                    <img
                                      src={r.product_image}
                                      alt=""
                                      className="w-5 h-5 rounded object-cover border border-gray-200"
                                    />
                                  )}
                                  {r.product_name}
                                </button>
                              )}
                              {r.comment && (
                                <p className="mt-2 text-sm text-gray-700">{r.comment}</p>
                              )}
                              {r.images?.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                  {r.images.map((url, i) => (
                                    <img
                                      key={i}
                                      src={url}
                                      alt={`Ảnh ${i + 1}`}
                                      className="w-20 h-20 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition"
                                      onClick={() => window.open(url, "_blank")}
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Pagination */}
                    {reviewPagination.totalPages > 1 && (
                      <div className="flex justify-center items-center gap-2 mt-4">
                        <button
                          onClick={() => setReviewPage((p) => Math.max(1, p - 1))}
                          disabled={reviewPage === 1}
                          className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <span className="text-sm text-gray-600 px-2">
                          {reviewPage} / {reviewPagination.totalPages}
                        </span>
                        <button
                          onClick={() => setReviewPage((p) => Math.min(reviewPagination.totalPages, p + 1))}
                          disabled={reviewPage === reviewPagination.totalPages}
                          className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ===== TAB: INFO ===== */}
        {activeTab === "info" && (
          <div className="max-w-2xl space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
              <h2 className="font-semibold text-gray-800">Thông tin liên hệ</h2>
              <div className="space-y-3">
                {seller.address_line && (
                  <div className="flex items-start gap-3 text-sm">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                    <span className="text-gray-700">{seller.address_line}</span>
                  </div>
                )}
                {seller.shop_phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="text-gray-700">{seller.shop_phone}</span>
                  </div>
                )}
                {seller.shop_email && (
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="text-gray-700">{seller.shop_email}</span>
                  </div>
                )}
                {seller.operating_hours && (
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="text-gray-700">{seller.operating_hours}</span>
                  </div>
                )}
              </div>
            </div>

            {(seller.shipping_policy || seller.return_policy) && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
                <h2 className="font-semibold text-gray-800">Chính sách cửa hàng</h2>
                {seller.shipping_policy && (
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                      <Truck className="w-4 h-4 text-gray-400" />
                      Vận chuyển
                    </div>
                    <p className="text-sm text-gray-600 pl-6">{seller.shipping_policy}</p>
                  </div>
                )}
                {seller.return_policy && (
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                      <RotateCcw className="w-4 h-4 text-gray-400" />
                      Đổi / Trả hàng
                    </div>
                    <p className="text-sm text-gray-600 pl-6">{seller.return_policy}</p>
                  </div>
                )}
              </div>
            )}

            {seller.description && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h2 className="font-semibold text-gray-800 mb-2">Giới thiệu</h2>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {seller.description}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
