import React, { useEffect, useState } from "react";

export default function ProductManagementAdmin() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // FAKE DATA
    const fakeData = [
      {
        _id: "1",
        name: "GHẾ CÔNG THÁI HỌC MUNXX",
        price: 300000,
        category: "Ghế công thái học",
        quantity: 13,
        image: "https://via.placeholder.com/80",
        createdAt: "2026-05-01",
        status: "pending",
      },
      {
        _id: "2",
        name: "BÀN NÂNG MÀN HÌNH CÔNG THÁI HỌC Q2",
        price: 329999,
        category: "Bàn học",
        quantity: 23,
        image: "https://via.placeholder.com/80",
        createdAt: "2026-05-02",
        status: "approved",
      },
      {
        _id: "3",
        name: "BÀN NÂNG MÀN HÌNH CÔNG THÁI HỌC Q1",
        price: 50000,
        category: "Bàn học",
        quantity: 32,
        image: "https://via.placeholder.com/80",
        createdAt: "2026-05-03",
        status: "rejected",
      },
      {
        _id: "4",
        name: "BÀN NÂNG MÀN HÌNH CÔNG THÁI HỌC QUÝ",
        price: 1412341,
        category: "Bàn học",
        quantity: 32,
        image: "https://via.placeholder.com/80",
        createdAt: "2026-05-04",
        status: "pending",
      },
    ];

    setProducts(fakeData);
  }, []);

  const handleApprove = (id) => {
    setProducts((prev) =>
      prev.map((item) =>
        item._id === id ? { ...item, status: "approved" } : item,
      ),
    );
  };

  const handleReject = (id) => {
    setProducts((prev) =>
      prev.map((item) =>
        item._id === id ? { ...item, status: "rejected" } : item,
      ),
    );
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-7 gap-4 p-4 font-semibold border-b text-gray-700">
          <div className="col-span-2">Sản phẩm</div>
          <div>Giá</div>
          <div>Danh mục</div>
          <div>Số lượng</div>
          <div>Ngày Cập Nhật</div>
          <div>Thao tác</div>
        </div>

        {/* List */}
        {products.map((item) => (
          <div
            key={item._id}
            className="grid grid-cols-7 gap-4 p-4 items-center border-b hover:bg-gray-50"
          >
            {/* Product */}
            <div className="col-span-2 flex items-center gap-3">
              <img
                src={item.image}
                alt=""
                className="w-16 h-16 object-cover rounded"
              />
              <span className="font-medium">{item.name}</span>
            </div>

            {/* Price */}
            <div className="text-red-500 font-semibold">
              {item.price.toLocaleString()}đ
            </div>

            {/* Category */}
            <div>{item.category}</div>

            {/* Quantity */}
            <div>{item.quantity}</div>

            {/* Created Date */}
            <div>{new Date(item.createdAt).toLocaleDateString("vi-VN")}</div>

            {/* Actions */}
            <div className="flex flex-col gap-1">
              {/* Status */}
              <span
                className={`px-2 py-1 text-xs rounded w-fit ${
                  item.status === "approved"
                    ? "bg-green-100 text-green-600"
                    : item.status === "rejected"
                      ? "bg-red-100 text-red-600"
                      : "bg-yellow-100 text-yellow-600"
                }`}
              >
                {item.status}
              </span>

              {/* Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleApprove(item._id)}
                  className="px-2 py-1 bg-green-500 text-white rounded text-xs"
                >
                  Duyệt
                </button>

                <button
                  onClick={() => handleReject(item._id)}
                  className="px-2 py-1 bg-red-500 text-white rounded text-xs"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-end gap-2 mt-4">
        <button className="px-3 py-1 border rounded">Prev</button>
        <button className="px-3 py-1 bg-red-500 text-white rounded">1</button>
        <button className="px-3 py-1 border rounded">Next</button>
      </div>
    </div>
  );
}
