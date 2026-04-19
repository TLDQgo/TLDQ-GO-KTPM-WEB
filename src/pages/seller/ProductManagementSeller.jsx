import React, { useState } from "react";
import { Link } from "react-router-dom";

const mockProducts = [
  {
    id: 1,
    name: "Giường công thái học chỉnh điện FlexSpot S5K",
    price: 18650000,
    oldPrice: 23600000,
    stock: 120,
    category: "Giường",
    status: "Đang bán",
    image: "https://via.placeholder.com/80",
  },
  {
    id: 2,
    name: "Ghế gaming Era Boss",
    price: 27500000,
    oldPrice: 35600000,
    stock: 85,
    category: "Ghế massage",
    status: "Đang bán",
    image: "https://via.placeholder.com/80",
  },
];

export default function ProductManagementSeller() {
  const [products] = useState(mockProducts);

  return (
    <div className=" bg-gray-100 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Quản lý sản phẩm</h1>

        <div className="text-sm text-gray-500">
          Tổng sản phẩm: <span className="text-red-500">178</span> | Hết hàng: 5
          | Đang ẩn: 5
        </div>
      </div>

      {/* ACTION BAR */}
      <div className="flex justify-between items-center bg-white p-4 rounded shadow mb-4">
        {/* <Link to="/seller/them-san-pham"> */}
        <a
          href="/seller/them-san-pham"
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          + Thêm sản phẩm mới
        </a>
        {/* </Link> */}

        <div className="flex gap-2">
          <button className="border px-3 py-2 rounded hover:bg-gray-100">
            Xuất file Excel
          </button>
          <button className="border px-3 py-2 rounded hover:bg-gray-100">
            Quản lý danh mục
          </button>
        </div>
      </div>

      {/* FILTER */}
      <div className="bg-white p-4 rounded shadow mb-4 flex flex-wrap gap-3">
        <select className="border p-2 rounded">
          <option>Tất cả sản phẩm</option>
        </select>

        <input
          type="text"
          placeholder="Từ khóa tìm kiếm"
          className="border p-2 rounded flex-1"
        />

        <select className="border p-2 rounded">
          <option>Trạng thái: Tất cả</option>
        </select>

        <select className="border p-2 rounded">
          <option>Danh mục: Tất cả</option>
        </select>

        <button className="bg-red-500 text-white px-4 rounded">Tìm kiếm</button>
      </div>

      {/* TABS */}
      <div className="flex gap-6 border-b mb-4">
        <span className="pb-2 border-b-2 border-red-500 text-red-500 cursor-pointer">
          Đang bán 178
        </span>
        <span className="pb-2 text-gray-500 cursor-pointer">Đã ẩn</span>
        <span className="pb-2 text-gray-500 cursor-pointer">Chờ duyệt</span>
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
              <th className="p-3">Trạng thái</th>
              <th className="p-3">Thao tác</th>
            </tr>
          </thead>

          <tbody>
            {products.map((item) => (
              <tr key={item.id} className="border-t hover:bg-gray-50">
                {/* PRODUCT */}
                <td className="p-3 flex gap-3 items-center">
                  <img
                    src={item.image}
                    alt=""
                    className="w-16 h-16 object-cover rounded"
                  />
                  <span>{item.name}</span>
                </td>

                {/* PRICE */}
                <td className="p-3 text-center">
                  <div className="text-red-500 font-semibold">
                    {item.price.toLocaleString()}đ
                  </div>
                  <div className="text-gray-400 line-through text-xs">
                    {item.oldPrice.toLocaleString()}đ
                  </div>
                </td>

                {/* CATEGORY */}
                <td className="p-3 text-center">{item.category}</td>

                {/* STOCK */}
                <td className="p-3 text-center">{item.stock}</td>

                {/* STATUS */}
                <td className="p-3 text-center">
                  <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-xs">
                    {item.status}
                  </span>
                </td>

                {/* ACTION */}
                <td className="p-3">
                  <div className="flex justify-center gap-2">
                    <button className="px-2 py-1 border rounded hover:bg-gray-100">
                      ✏️
                    </button>
                    <button className="px-2 py-1 border rounded hover:bg-gray-100">
                      👁
                    </button>
                    <button className="px-2 py-1 border text-red-500 rounded hover:bg-red-50">
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
        <button className="px-3 py-1 border rounded">1</button>
        <button className="px-3 py-1 border rounded">2</button>
        <button className="px-3 py-1 border rounded">3</button>
        <button className="px-3 py-1 border rounded bg-red-500 text-white">
          Tiếp
        </button>
      </div>
    </div>
  );
}
