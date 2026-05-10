import React, { useEffect, useState } from "react";

export default function AccountManagementAdmin() {
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    const fakeAccounts = [
      {
        _id: "1",
        name: "Nguyễn Văn A",
        email: "vana@gmail.com",
        avatar: "https://i.pravatar.cc/100?img=1",
        role: "user",
        status: "pending",
        createdAt: "2026-05-01",
      },
      {
        _id: "2",
        name: "Trần Thị B",
        email: "thib@gmail.com",
        avatar: "https://i.pravatar.cc/100?img=2",
        role: "seller",
        status: "active",
        createdAt: "2026-05-02",
      },
      {
        _id: "3",
        name: "Lê Văn C",
        email: "vanc@gmail.com",
        avatar: "https://i.pravatar.cc/100?img=3",
        role: "user",
        status: "banned",
        createdAt: "2026-05-03",
      },
      {
        _id: "4",
        name: "Phạm Thị D",
        email: "thid@gmail.com",
        avatar: "https://i.pravatar.cc/100?img=4",
        role: "seller",
        status: "pending",
        createdAt: "2026-05-04",
      },
    ];

    setAccounts(fakeAccounts);
  }, []);

  const handleApprove = (id) => {
    setAccounts((prev) =>
      prev.map((acc) => (acc._id === id ? { ...acc, status: "active" } : acc)),
    );
  };

  const handleBan = (id) => {
    setAccounts((prev) =>
      prev.map((acc) => (acc._id === id ? { ...acc, status: "banned" } : acc)),
    );
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* HEADER */}
        <div className="grid grid-cols-7 gap-4 p-4 font-semibold border-b text-gray-700">
          <div className="col-span-2">Tài khoản</div>
          <div>Email</div>
          <div>Vai trò</div>
          <div>Trạng thái</div>
          <div>Ngày tạo</div>
          <div>Thao tác</div>
        </div>

        {/* LIST */}
        {accounts.map((item) => (
          <div
            key={item._id}
            className="grid grid-cols-7 gap-4 p-4 items-center border-b hover:bg-gray-50"
          >
            {/* USER */}
            <div className="col-span-2 flex items-center gap-3">
              <img
                src={item.avatar}
                alt=""
                className="w-12 h-12 rounded-full object-cover"
              />
              <span className="font-medium">{item.name}</span>
            </div>

            {/* EMAIL */}
            <div className="text-sm text-gray-600">{item.email}</div>

            {/* ROLE */}
            <div className="capitalize">{item.role}</div>

            {/* STATUS */}
            <div>
              <span
                className={`px-2 py-1 text-xs rounded ${
                  item.status === "active"
                    ? "bg-green-100 text-green-600"
                    : item.status === "banned"
                      ? "bg-red-100 text-red-600"
                      : "bg-yellow-100 text-yellow-600"
                }`}
              >
                {item.status}
              </span>
            </div>

            {/* CREATED */}
            <div>{new Date(item.createdAt).toLocaleDateString("vi-VN")}</div>

            {/* ACTION */}
            <div className="flex gap-2">
              <button
                onClick={() => handleApprove(item._id)}
                className="px-2 py-1 bg-green-500 text-white rounded text-xs"
              >
                Duyệt
              </button>

              <button
                onClick={() => handleBan(item._id)}
                className="px-2 py-1 bg-red-500 text-white rounded text-xs"
              >
                Khóa
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* PAGINATION */}
      <div className="flex justify-end gap-2 mt-4">
        <button className="px-3 py-1 border rounded">Prev</button>
        <button className="px-3 py-1 bg-red-500 text-white rounded">1</button>
        <button className="px-3 py-1 border rounded">Next</button>
      </div>
    </div>
  );
}
