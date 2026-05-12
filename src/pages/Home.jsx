import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Modal from "../components/common/Modal";
import apiProduct from "../api/productApi";
import ProductPrice from "../components/common/ProductPrice";
const categories = [
  {
    name: "Sofa Thư Giãn",
    img: "https://theme.hstatic.net/1000213518/1001329030/14/showinfocaticon2_small.png?v=770",
  },
  {
    name: "Bàn Học Thông Minh",
    img: "https://theme.hstatic.net/1000213518/1001329030/14/showinfocaticon4_small.png?v=770",
  },
  {
    name: "Ghế Chống Gù",
    img: "https://theme.hstatic.net/1000213518/1001329030/14/showinfocaticon5_small.png?v=770",
  },
  {
    name: "Ghế Công Thái Học",
    img: "https://theme.hstatic.net/1000213518/1001329030/14/showinfocaticon6_small.png?v=770",
  },
  {
    name: "Bàn Nâng Hạ",
    img: "https://theme.hstatic.net/1000213518/1001329030/14/showinfocaticon7_small.png?v=770",
  },
  {
    name: "Phụ Kiện Ergonomics",
    img: "https://theme.hstatic.net/1000213518/1001329030/14/showinfocaticon8_small.png?v=770",
  },
  {
    name: "Sofa Chỉnh Điện",
    img: "https://theme.hstatic.net/1000213518/1001329030/14/showinfocaticon2_small.png?v=770",
  },
  {
    name: "Ghế Massage",
    img: "https://theme.hstatic.net/1000213518/1001329030/14/showinfocaticon4_small.png?v=770",
  },
];

export default function Home() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false); // 🔥 thêm
  // Modal states
  const [selectedProductForDetails, setSelectedProductForDetails] =
    useState(null);
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [categoryPage, setCategoryPage] = useState(1);
  const [categoryTotalPages, setCategoryTotalPages] = useState(1);
  const [gheProducts, setGheProducts] = useState([]);
  const [ghePage, setGhePage] = useState(1);
  const [gheTotalPages, setGheTotalPages] = useState(1);

  const handleOrder = (product, e) => {
    e.stopPropagation();
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      toast.warning("Vui lòng đăng nhập để đặt hàng!");
      return;
    }
    navigate("/checkout", {
      state: {
        items: [{
          product_id: product._id,
          product_name: product.name,
          quantity: 1,
          price: product.original_price ?? product.price,
          discount_price: product.discount_price ?? product.price,
          image: Array.isArray(product.images) ? product.images[0] : product.image_url,
        }],
        from: "product",
      },
    });
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        const res = await apiProduct.getProductsWithPage(page);
        console.log("API response:", res);
        // 🔥 axios trả data nằm trong res.data
        if (res && res.data) {
          setProducts(res.data);
          setTotalPages(res.pagination.totalPages);
        }
      } catch (error) {
        console.error("Fetch products error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [page]);
  // loctheo bán chạy nhất
  const displayProducts = isBestSeller
    ? [...products].sort((a, b) => (b.sold || 0) - (a.sold || 0))
    : products;
  // tim category
  useEffect(() => {
    const fetchCategoryProducts = async () => {
      try {
        setLoading(true);

        const res = await apiProduct.getProductsByCategoryName(
          "Bàn Học",
          categoryPage,
        );

        if (res && res.data) {
          setCategoryProducts(res.data || []);
          setCategoryTotalPages(res.pagination?.totalPages || 1);
        }
      } catch (error) {
        console.error("Fetch category products error:", error);
        setCategoryProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryProducts();
  }, [categoryPage]);

  useEffect(() => {
    const fetchGhe = async () => {
      try {
        setLoading(true);

        const res = await apiProduct.getProductsByCategoryName(
          "Ghế công thái học",
          ghePage,
        );

        if (res) {
          setGheProducts(res.data || []);
          setGheTotalPages(res.pagination?.totalPages || 1);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchGhe();
  }, [ghePage]);
  return (
    <div className="min-h-screen p-4 ">
      {/* TOP SECTION */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* LEFT BANNER */}
        <div className="relative overflow-hidden md:col-span-2 rounded-2xl">
          <img
            src="https://theme.hstatic.net/1000213518/1001329030/14/showssliimga1_1024x1024.png?v=770"
            alt="banner"
            className="object-cover w-full h-full"
          />
        </div>

        {/* RIGHT BOXES */}
        <div className="grid grid-cols-1 gap-4">
          {[
            {
              title: "Học tập thông minh",
              img: "https://theme.hstatic.net/1000213518/1001329030/14/babannerrighimg1_grande.png?v=770",
            },
            {
              title: "Làm việc công thái học",
              img: "https://theme.hstatic.net/1000213518/1001329030/14/babannerrighimg2_grande.png?v=770",
            },
            {
              title: "Thư giãn & phục hồi sức khỏe",
              img: "https://theme.hstatic.net/1000213518/1001329030/14/babannerrighimg3_grande.png?v=770",
            },
          ].map((item, index) => (
            <div
              key={index}
              className="relative h-32 cursor-pointer rounded-xl group"
            >
              {/* IMAGE BACKGROUND */}
              <img
                src={item.img}
                alt={item.title}
                className="absolute inset-0 object-cover w-full h-full transition duration-300 group-hover:scale-105"
              />

              {/* OVERLAY */}
              <div className="absolute inset-0 bg-black/30"></div>

              {/* TEXT */}
              <div className="relative z-10 flex items-center h-full px-4">
                {/* <p className="text-lg font-semibold text-white">{item.title}</p> */}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CATEGORY SECTION */}
      <div className="grid grid-cols-2 gap-6 mt-8 text-center sm:grid-cols-4 md:grid-cols-8">
        {categories.map((item, index) => (
          <div key={index} className="flex flex-col items-center">
            <div className="flex items-center justify-center w-16 h-16 mb-2 transition bg-white rounded-full shadow hover:scale-105">
              <img
                src={item.img}
                alt={item.name}
                className="object-contain w-10 h-10"
              />
            </div>
            <p className="text-sm text-gray-600">{item.name}</p>
          </div>
        ))}
      </div>

      <div>
        <img
          src="https://theme.hstatic.net/1000213518/1001329030/14/showbannerindimg_2048x2048.png?v=770"
          alt="banner"
          className="object-cover w-full h-full mt-8 rounded-2xl"
        />
      </div>
      {/* Sản phẩm 1  */}
      <div className="mt-10">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="pb-2 text-xl font-bold border-b-2 border-blue-500">
            BÀN HỌC THÔNG MINH
            <span className="ml-2 text-sm text-gray-500">(44 sản phẩm)</span>
          </h2>

          <div className="flex gap-2">
            <button
              onClick={() => setIsBestSeller(!isBestSeller)}
              className={`px-3 py-1 text-sm border rounded-lg ${isBestSeller ? "bg-blue-500 text-white" : ""
                }`}
            >
              Sản Phẩm Bán Chạy Nhất
            </button>
            <button className="px-3 py-1 text-sm text-white bg-blue-500 border rounded-lg">
              Tất Cả
            </button>
          </div>
        </div>

        {/* sản phẩm 1 lấy tất cả */}
        <div>
          {loading ? (
            <p className="text-center">Đang tải...</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
              {displayProducts.map((item) => (
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
                    <p className="text-sm font-medium line-clamp-2">
                      {item.name}
                    </p>

                    <div className="mt-2">
                      <ProductPrice product={item} />
                    </div>

                    {/* 🔥 THÊM DÒNG NÀY */}
                    <p className="text-xs text-gray-400 mt-1">
                      Đã bán: {item.sold || 0}
                    </p>

                    <button
                      onClick={(e) => handleOrder(item, e)}
                      className="w-full py-1 mt-3 text-xs border rounded-lg hover:bg-blue-500 hover:text-white"
                    >
                      Đặt hàng
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center justify-center gap-2 mt-6">
            {/* PREV */}
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Prev
            </button>

            {/* PAGE */}
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`px-3 py-1 border rounded ${page === i + 1 ? "bg-blue-500 text-white" : ""
                  }`}
              >
                {i + 1}
              </button>
            ))}

            {/* NEXT */}
            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>{" "}
        </div>
        {/* VIEW ALL */}
        <div className="mt-6 text-center">
          <button className="px-4 py-2 border rounded-lg hover:bg-gray-100">
            Xem tất cả
          </button>
        </div>
      </div>
      {/* BANNER 2 */}
      <div>
        <img
          src="https://theme.hstatic.net/1000213518/1001329030/14/showbannerindimg2_2048x2048.png?v=770"
          alt="banner"
          className="object-cover w-full h-full mt-8 rounded-2xl"
        />
      </div>
      {/* Sản phẩm 2  */}
      <div className="mt-10">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="pb-2 text-xl font-bold border-b-2 border-blue-500">
            BÀN HỌC THÔNG MINH
            <span className="ml-2 text-sm text-gray-500">(44 sản phẩm)</span>
          </h2>

          <div className="flex gap-2">
            <button className="px-3 py-1 text-sm text-white bg-blue-500 border rounded-lg">
              Tất Cả
            </button>
          </div>
        </div>
        {/* sản phẩm 2 lấy theo danh mục*/}
        <div>
          {loading ? (
            <p className="text-center">Đang tải...</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
              {(categoryProducts || []).map((item) => (
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
                    <p className="text-sm font-medium line-clamp-2">
                      {item.name}
                    </p>

                    <div className="mt-2">
                      <ProductPrice product={item} />
                    </div>

                    <button
                      onClick={(e) => handleOrder(item, e)}
                      className="w-full py-1 mt-3 text-xs border rounded-lg hover:bg-blue-500 hover:text-white"
                    >
                      Đặt hàng
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center justify-center gap-2 mt-6">
            {/* PREV */}
            <button
              disabled={categoryPage === 1}
              onClick={() => setCategoryPage(categoryPage - 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Prev
            </button>

            {/* PAGE */}
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCategoryPage(i + 1)}
                className={`px-3 py-1 border rounded ${categoryPage === i + 1 ? "bg-blue-500 text-white" : ""
                  }`}
              >
                {i + 1}
              </button>
            ))}

            {/* NEXT */}
            <button
              disabled={categoryPage === totalPages}
              onClick={() => setCategoryPage(categoryPage + 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>{" "}
        </div>

        {/* VIEW ALL */}
        <div className="mt-6 text-center">
          <button className="px-4 py-2 border rounded-lg hover:bg-gray-100">
            Xem tất cả
          </button>
        </div>
      </div>
      {/* BANNER 3 */}
      <div>
        <img
          src="https://theme.hstatic.net/1000213518/1001329030/14/showbannerindimg4_2048x2048.png?v=770"
          alt="banner"
          className="object-cover w-full h-full mt-8 rounded-2xl"
        />
      </div>
      {/* Sản phẩm 3  */}
      <div className="mt-10">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="pb-2 text-xl font-bold border-b-2 border-blue-500">
            GHẾ CÔNG THÁI HỌC
            <span className="ml-2 text-sm text-gray-500">(44 sản phẩm)</span>
          </h2>

          <div className="flex gap-2">
            <button className="px-3 py-1 text-sm text-white bg-blue-500 border rounded-lg">
              Tất Cả
            </button>
          </div>
        </div>
        {/* sản phẩm 3 lấy theo danh mục*/}
        <div>
          {loading ? (
            <p className="text-center">Đang tải...</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
              {(gheProducts || []).map((item) => (
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
                    <p className="text-sm font-medium line-clamp-2">
                      {item.name}
                    </p>

                    <p className="mt-2 font-bold text-red-500">
                      {item.price?.toLocaleString("vi-VN")}đ
                    </p>

                    <button
                      onClick={(e) => handleOrder(item, e)}
                      className="w-full py-1 mt-3 text-xs border rounded-lg hover:bg-blue-500 hover:text-white"
                    >
                      Đặt hàng
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center justify-center gap-2 mt-6">
            {/* PREV */}
            <button
              disabled={ghePage === 1}
              onClick={() => setGhePage(ghePage - 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Prev
            </button>

            {/* PAGE */}
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setGhePage(i + 1)}
                className={`px-3 py-1 border rounded ${ghePage === i + 1 ? "bg-blue-500 text-white" : ""
                  }`}
              >
                {i + 1}
              </button>
            ))}

            {/* NEXT */}
            <button
              disabled={ghePage === totalPages}
              onClick={() => setGhePage(ghePage + 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>{" "}
        </div>

        {/* VIEW ALL */}
        <div className="mt-6 text-center">
          <button className="px-4 py-2 border rounded-lg hover:bg-gray-100">
            Xem tất cả
          </button>
        </div>
      </div>
      {/* Product Details Modal */}
      <Modal
        isOpen={!!selectedProductForDetails}
        onClose={() => setSelectedProductForDetails(null)}
        title="Chi tiết sản phẩm"
        maxWidth="max-w-2xl"
      >
        {selectedProductForDetails && (
          <div className="flex flex-col gap-6 md:flex-row">
            <div className="w-full md:w-1/2">
              <img
                src={
                  selectedProductForDetails.images?.[0] ||
                  selectedProductForDetails.img ||
                  "https://via.placeholder.com/300"
                }
                alt={selectedProductForDetails.name}
                className="object-contain w-full h-auto rounded-lg bg-gray-50"
              />
            </div>
            <div className="w-full space-y-4 md:w-1/2">
              <h2 className="text-xl font-bold text-gray-800">
                {selectedProductForDetails.name}
              </h2>
              <ProductPrice
                product={selectedProductForDetails}
                className="text-lg"
                showBadge={false}
              />

              <div className="flex items-center gap-2">
                <span className="text-yellow-400">★</span>
                <span className="font-medium">
                  {selectedProductForDetails.rating_average || 5.0}
                </span>
                <span className="text-sm text-gray-400">/ 5 đánh giá</span>
              </div>

              <div className="pt-2 space-y-2 text-sm text-gray-700 border-t">
                <p>
                  <span className="font-medium">Tình trạng: </span>{" "}
                  {selectedProductForDetails.stock_quantity > 0
                    ? "Còn hàng"
                    : "Hết hàng"}
                </p>
                <p>
                  <span className="font-medium">Thương hiệu: </span>{" "}
                  {selectedProductForDetails.seller_id === "admin"
                    ? "Chính hãng"
                    : "Đối tác"}
                </p>
              </div>

              <p className="mt-4 text-sm text-gray-600">
                Sản phẩm cao cấp được thiết kế đặc biệt mang lại sự thoải mái
                tối đa cho người sử dụng. Phù hợp cho không gian làm việc chuyên
                nghiệp.
              </p>

              <button
                onClick={(e) => {
                  setSelectedProductForDetails(null);
                  handleOrder(selectedProductForDetails, e);
                }}
                className="w-full py-3 mt-4 font-semibold text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Đặt hàng ngay
              </button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}
