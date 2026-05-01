import React from "react";

const formatPrice = (value) => Number(value || 0).toLocaleString("vi-VN");

export default function ProductPrice({ product, className = "", showBadge = true }) {
  const appliedVoucher = product?.applied_voucher || null;
  const originalPrice = Number(product?.original_price ?? product?.price ?? 0);
  const discountedPrice = Number(product?.discount_price ?? originalPrice);
  const hasDiscount = Boolean(appliedVoucher) && discountedPrice < originalPrice;

  return (
    <div className={className}>
      {showBadge && hasDiscount && (
        <div className="mb-1 inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-600">
          {appliedVoucher.name} -{appliedVoucher.discount_percent}%
        </div>
      )}

      <div className="flex flex-wrap items-end gap-2">
        {hasDiscount ? (
          <>
            <span className="text-xs text-gray-400 line-through">
              {formatPrice(originalPrice)}đ
            </span>
            <span className="font-bold text-red-600">
              {formatPrice(discountedPrice)}đ
            </span>
          </>
        ) : (
          <span className="font-bold text-red-500">
            {formatPrice(originalPrice)}đ
          </span>
        )}
      </div>
    </div>
  );
}