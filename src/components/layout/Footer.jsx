import React from "react";
import { FaFacebook, FaYoutube } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-gray-100 mt-10 pt-10 pb-6 text-sm text-gray-700">
      <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-8">
        {/* COLUMN 1 */}
        <div>
          <h3 className="font-bold uppercase mb-3">
            TLDQ-GO - KHÔNG GIAN SỐNG KHỎE NO.1 VIỆT NAM
          </h3>

          <p className="mb-2">
            Công ty: CÔNG TY TNHH TLDQ-GO <br />
            Đăng ký kinh doanh: Số 180 đường Trường Sa, Phường Gia Định, TP Hồ
            Chí Minh, Việt Nam
          </p>

          <p className="mb-2">
            Mã số thuế: 0314958474 <br />
            Đại diện: Beerus - Giám đốc
          </p>

          {/* BADGES */}
          <div className="flex gap-2 mt-3 text-xs text-gray-400">
            {/* <img src="/images/bct.png" alt="bct" className="h-10" />
            <img src="/images/dmca.png" alt="dmca" className="h-10" /> */}
            <p>Đã Đăng Ký Bộ Công Thương</p>
          </div>
        </div>

        {/* COLUMN 2 */}
        <div>
          <h3 className="font-bold uppercase mb-3">LIÊN KẾT</h3>
          <ul className="space-y-2">
            <li>Trang chủ</li>
            <li>Bàn học thông minh</li>
            <li>Ergonomics Office</li>
            <li>Phụ kiện làm việc</li>
            <li>Phương thức thanh toán</li>
            <li>Chính sách giao hàng</li>
            <li>Chính sách đổi trả</li>
            <li>Chính sách bảo hành</li>
            <li>Chính sách bảo mật</li>
            <li>Giới thiệu</li>
            <li>Liên hệ</li>
          </ul>
        </div>

        {/* COLUMN 3 */}
        <div>
          <h3 className="font-bold uppercase mb-3">HÌNH THỨC THANH TOÁN</h3>

          <div className="flex flex-wrap gap-3">
            <img
              src="https://theme.hstatic.net/1000213518/1001329030/14/showhinhimage2.png?v=770"
              alt="visa"
              className="h-8"
            />
            <img
              src="https://theme.hstatic.net/1000213518/1001329030/14/showhinhimage3.png?v=770"
              alt="vnpay"
              className="h-8"
            />
            <img
              src="https://theme.hstatic.net/1000213518/1001329030/14/showhinhimage5.png?v=770"
              alt="zalopay"
              className="h-8"
            />
            <img
              src="https://theme.hstatic.net/1000213518/1001329030/14/showhinhimage6.png?v=770"
              alt="master"
              className="h-8"
            />
          </div>
        </div>

        {/* COLUMN 4 */}
        <div>
          <h3 className="font-bold uppercase mb-3">KẾT NỐI VỚI CHÚNG TÔI</h3>

          {/* SOCIAL */}
          <div className="flex gap-3 mb-4 text-xl">
            <FaFacebook className="text-blue-600 cursor-pointer" />
            <FaYoutube className="text-red-500 cursor-pointer" />
          </div>

          {/* BANNERS */}
          <div className="space-y-3">
            <img
              src="https://theme.hstatic.net/1000213518/1001329030/14/babannerrighimg1_grande.png?v=770"
              alt="banner 1"
              className="rounded-lg h-24 object-cover w-full"
            />
            <img
              src="https://theme.hstatic.net/1000213518/1001329030/14/babannerrighimg2_grande.png?v=770"
              alt="banner 2"
              className="rounded-lg h-24 object-cover w-full"
            />
          </div>
        </div>
      </div>

      {/* BOTTOM */}
      <div className="text-center text-gray-500 text-xs mt-8">
        © 2026 TLDQ-GO. All rights reserved.
      </div>
    </footer>
  );
}
