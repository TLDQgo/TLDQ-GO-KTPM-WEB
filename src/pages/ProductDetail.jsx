import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Star, ChevronLeft, ShoppingBag, Store, Package } from "lucide-react";
import productApi from "../api/productApi";
import authApi from "../api/authApi";
import cartApi from "../api/cartApi";
import ProductPrice from "../components/common/ProductPrice";
import useAuthStore from "../store/useAuthStore";

function StarRating({ value = 0, max = 5, onChange }) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          onMouseEnter={() => onChange && setHovered(star)}
          onMouseLeave={() => onChange && setHovered(0)}
          className="focus:outline-none"
        >
          <Star
            size={20}
            className={
              star <= display
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }
          />
        </button>
      ))}
    </div>
  );
}

function ReviewCard({ review }) {
  const initial = (review.user_id || "?")[0].toUpperCase();
  const date = review.createdAt
    ? new Date(review.createdAt).toLocaleDateString("vi-VN")
    : "";
  return (
    <div className="border border-gray-100 rounded-xl p-4 bg-white">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-red-100 text-red-600 font-bold flex items-center justify-center text-sm shrink-0">
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between flex-wrap gap-1">
            <span className="text-sm font-semibold text-gray-800 truncate">
              {review.user_id}
            </span>
            <span className="text-xs text-gray-400">{date}</span>
          </div>
          <StarRating value={review.rating} />
          {review.comment && (
            <p className="mt-2 text-sm text-gray-700">{review.comment}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  const [mainImg, setMainImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  const {
    data: productData,
    isLoading: productLoading,
    isError: productError,
  } = useQuery({
    queryKey: ["product", id],
    queryFn: () => productApi.getById(id),
    staleTime: 2 * 60 * 1000,
  });

  const product = productData?.data ?? productData;

  const { data: sellerData } = useQuery({
    queryKey: ["sellerProfile", product?.seller_id],
    queryFn: () => authApi.getSellerPublicProfile(product.seller_id),
    enabled: !!product?.seller_id,
    staleTime: 5 * 60 * 1000,
  });

  const seller = sellerData?.data ?? sellerData;

  const { data: reviewsData } = useQuery({
    queryKey: ["reviews", id],
    queryFn: () => productApi.getReviews(id),
    staleTime: 60 * 1000,
  });

  const reviews = reviewsData?.data ?? [];

  const reviewMutation = useMutation({
    mutationFn: (data) => productApi.createReview(id, data),
    onSuccess: () => {
      toast.success("Đánh giá của bạn đã được gửi!");
      setReviewRating(5);
      setReviewComment("");
      queryClient.invalidateQueries({ queryKey: ["reviews", id] });
      queryClient.invalidateQueries({ queryKey: ["product", id] });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Gửi đánh giá thất bại");
    },
  });

  const handleBuyNow = () => {
    if (!user) {
      toast.warning("Vui lòng đăng nhập để đặt hàng!");
      return;
    }
    navigate("/checkout", {
      state: {
        items: [{
          product_id: product._id,
          product_name: product.name,
          quantity: qty,
          price: product.original_price ?? product.price,
          discount_price: product.discount_price ?? product.price,
          image: Array.isArray(product.images) ? product.images[0] : product.image_url,
        }],
        from: "product",
      },
    });
  };

  const handleAddToCart = async () => {
    if (!user) {
      toast.warning("Vui lòng đăng nhập để thêm vào giỏ hàng!");
      return;
    }
    setAddingToCart(true);
    try {
      await cartApi.addItem(user._id || user.id, {
        product_id: product._id,
        quantity: qty,
      });
      queryClient.invalidateQueries({ queryKey: ["cart", user._id || user.id] });
      toast.success("Đã thêm vào giỏ hàng!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Thêm vào giỏ thất bại");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!user) {
      toast.warning("Vui lòng đăng nhập để đánh giá!");
      return;
    }
    reviewMutation.mutate({
      user_id: user._id || user.id,
      rating: reviewRating,
      comment: reviewComment,
    });
  };

  if (productLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500 text-lg">Đang tải sản phẩm...</div>
      </div>
    );
  }

  if (productError || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-red-500 text-lg">Không tìm thấy sản phẩm.</p>
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg"
        >
          Về trang chủ
        </button>
      </div>
    );
  }

  const images =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : ["https://via.placeholder.com/400"];

  const categoryName =
    product.category_id?.name ?? (typeof product.category_id === "string" ? product.category_id : null);

  const ratingAvg = Number(product.rating_average || 0).toFixed(1);
  const totalReviews = reviews.length;
  const shopName = seller?.shop_name || "Nhà bán";

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb & Back */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 hover:text-blue-600 transition"
          >
            <ChevronLeft size={16} />
            Quay lại
          </button>
          <span>/</span>
          <Link to="/" className="hover:text-blue-600">
            Trang chủ
          </Link>
          {categoryName && (
            <>
              <span>/</span>
              <span>{categoryName}</span>
            </>
          )}
          <span>/</span>
          <span className="text-gray-800 font-medium line-clamp-1 max-w-[200px]">
            {product.name}
          </span>
        </div>

        {/* Product Info Block */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* Gallery */}
            <div className="p-6 border-b md:border-b-0 md:border-r border-gray-100">
              <div className="aspect-square rounded-xl overflow-hidden bg-gray-50 mb-3">
                <img
                  src={images[mainImg]}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 flex-wrap">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setMainImg(i)}
                      className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition ${
                        mainImg === i
                          ? "border-blue-500"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      <img
                        src={img}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="p-6 flex flex-col gap-4">
              {categoryName && (
                <span className="inline-block text-xs font-medium bg-blue-50 text-blue-600 px-2 py-1 rounded-full w-fit">
                  {categoryName}
                </span>
              )}

              <h1 className="text-2xl font-bold text-gray-900 leading-snug">
                {product.name}
              </h1>

              <div className="flex items-center gap-3 flex-wrap">
                <StarRating value={Math.round(product.rating_average || 0)} />
                <span className="text-sm text-gray-500">
                  {ratingAvg} ({totalReviews} đánh giá)
                </span>
                <span className="text-sm text-gray-400">|</span>
                <span className="text-sm text-gray-500">
                  Đã bán: <strong>{product.sold || 0}</strong>
                </span>
              </div>

              <div className="py-3 border-t border-b border-gray-100">
                <ProductPrice product={product} className="text-2xl" />
              </div>

              <div className="flex items-center gap-2">
                <Package size={16} className="text-gray-400" />
                <span
                  className={`text-sm font-medium ${
                    product.stock_quantity > 0
                      ? "text-green-600"
                      : "text-red-500"
                  }`}
                >
                  {product.stock_quantity > 0
                    ? `Còn ${product.stock_quantity} sản phẩm`
                    : "Hết hàng"}
                </span>
              </div>

              {/* Qty selector */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">Số lượng:</span>
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 text-lg font-medium"
                  >
                    −
                  </button>
                  <span className="w-10 text-center text-sm font-semibold">
                    {qty}
                  </span>
                  <button
                    onClick={() =>
                      setQty((q) =>
                        Math.min(product.stock_quantity || 99, q + 1)
                      )
                    }
                    className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 text-lg font-medium"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock_quantity === 0 || addingToCart}
                  className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed font-bold rounded-xl transition text-base"
                >
                  {addingToCart ? "Đang thêm..." : "Thêm vào giỏ"}
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={product.stock_quantity === 0}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white font-bold rounded-xl transition text-base"
                >
                  <ShoppingBag size={20} />
                  {product.stock_quantity === 0 ? "Hết hàng" : "Đặt ngay"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Mô tả sản phẩm
            </h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {product.description}
            </p>
          </div>
        )}

        {/* Seller Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Thông tin nhà bán
          </h2>
          <div className="flex items-start gap-4 flex-wrap">
            <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden shrink-0">
              {seller?.logo_url ? (
                <img
                  src={seller.logo_url}
                  alt={shopName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Store size={28} className="text-gray-400" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-800 text-base">{shopName}</p>
              {seller?.rating > 0 && (
                <div className="flex items-center gap-1 mt-1">
                  <StarRating value={Math.round(seller.rating)} />
                  <span className="text-sm text-gray-500">
                    {Number(seller.rating).toFixed(1)}
                  </span>
                </div>
              )}
              {seller?.description && (
                <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                  {seller.description}
                </p>
              )}
              {(seller?.address_line || seller?.shop_phone) && (
                <div className="mt-2 flex flex-wrap gap-4 text-xs text-gray-500">
                  {seller?.address_line && (
                    <span>Địa chỉ: {seller.address_line}</span>
                  )}
                  {seller?.shop_phone && (
                    <span>SĐT: {seller.shop_phone}</span>
                  )}
                </div>
              )}
            </div>
            <Link
              to={`/?seller=${product.seller_id}`}
              className="shrink-0 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              Xem shop
            </Link>
          </div>
        </div>

        {/* Reviews */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Đánh giá khách hàng
          </h2>

          {/* Rating Summary */}
          <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
            <div className="text-center">
              <p className="text-4xl font-bold text-gray-900">{ratingAvg}</p>
              <StarRating value={Math.round(product.rating_average || 0)} />
              <p className="text-xs text-gray-500 mt-1">
                {totalReviews} đánh giá
              </p>
            </div>
          </div>

          {/* Write Review Form */}
          {user ? (
            <form
              onSubmit={handleSubmitReview}
              className="mb-6 p-4 border border-gray-200 rounded-xl bg-gray-50"
            >
              <p className="text-sm font-semibold text-gray-700 mb-3">
                Viết đánh giá của bạn
              </p>
              <div className="mb-3">
                <label className="text-xs text-gray-500 mb-1 block">
                  Đánh giá sao
                </label>
                <StarRating
                  value={reviewRating}
                  onChange={setReviewRating}
                />
              </div>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Nhận xét về sản phẩm (không bắt buộc)..."
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 resize-none"
              />
              <button
                type="submit"
                disabled={reviewMutation.isPending}
                className="mt-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition"
              >
                {reviewMutation.isPending ? "Đang gửi..." : "Gửi đánh giá"}
              </button>
            </form>
          ) : (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
              <Link to="/login" className="underline font-medium">
                Đăng nhập
              </Link>{" "}
              để viết đánh giá.
            </div>
          )}

          {/* Review List */}
          {reviews.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">
              Chưa có đánh giá nào. Hãy là người đầu tiên!
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {reviews.map((r) => (
                <ReviewCard key={r._id} review={r} />
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
