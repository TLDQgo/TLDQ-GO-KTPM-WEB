import { useState } from "react";

const CH = ["", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
const CH10 = ["", "mười", "hai mươi", "ba mươi", "bốn mươi", "năm mươi", "sáu mươi", "bảy mươi", "tám mươi", "chín mươi"];

function readHundreds(n) {
  const h = Math.floor(n / 100);
  const t = Math.floor((n % 100) / 10);
  const u = n % 10;
  let s = "";
  if (h > 0) s += CH[h] + " trăm";
  if (t === 0 && u === 0) return s;
  if (h > 0 && t === 0) s += " linh";
  if (t > 0) s += (s ? " " : "") + CH10[t];
  if (u > 0) {
    if (t === 1 && u === 5) s += " lăm";
    else if (t > 1 && u === 1) s += " mốt";
    else if (t > 1 && u === 5) s += " lăm";
    else s += (s && t === 0 ? " " : " ") + CH[u];
  }
  return s.trim();
}

function numberToVietnamese(n) {
  if (!n || isNaN(n) || Number(n) === 0) return "";
  const num = Math.abs(Math.floor(Number(n)));
  if (num === 0) return "không đồng";

  const ty = Math.floor(num / 1_000_000_000);
  const trieu = Math.floor((num % 1_000_000_000) / 1_000_000);
  const nghin = Math.floor((num % 1_000_000) / 1_000);
  const le = num % 1_000;

  const parts = [];
  if (ty > 0) parts.push(readHundreds(ty) + " tỷ");
  if (trieu > 0) parts.push(readHundreds(trieu) + " triệu");
  if (nghin > 0) parts.push(readHundreds(nghin) + " nghìn");
  if (le > 0) parts.push(readHundreds(le));

  const text = parts.join(" ").trim();
  return text.charAt(0).toUpperCase() + text.slice(1) + " đồng";
}

export default function PriceInput({
  value,
  onChange,
  label,
  name,
  placeholder = "Nhập số tiền",
  min = 0,
  required = false,
  error,
  className = "",
  suffix = "đ",
  showText = true,
}) {
  const [focused, setFocused] = useState(false);

  const numericValue = value === "" || value === undefined ? "" : String(value).replace(/\D/g, "");

  const displayValue = focused
    ? numericValue
    : numericValue
    ? Number(numericValue).toLocaleString("vi-VN")
    : "";

  const handleChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "");
    onChange({ target: { name, value: raw } });
  };

  const vietnameseText = showText ? numberToVietnamese(numericValue) : "";

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className={`relative flex items-center border rounded-lg overflow-hidden transition-all ${
        error ? "border-red-400 bg-red-50" : focused ? "border-blue-500 ring-2 ring-blue-100" : "border-gray-300 hover:border-gray-400"
      }`}>
        <input
          type="text"
          inputMode="numeric"
          name={name}
          value={displayValue}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          min={min}
          className="flex-1 px-3 py-2.5 text-sm bg-transparent outline-none text-gray-800 placeholder-gray-400"
        />
        {suffix && (
          <span className="px-3 text-sm font-semibold text-gray-500 border-l border-gray-200 bg-gray-50 h-full flex items-center">
            {suffix}
          </span>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      {showText && vietnameseText && !error && (
        <p className="mt-1 text-xs text-blue-600 italic">{vietnameseText}</p>
      )}
    </div>
  );
}
