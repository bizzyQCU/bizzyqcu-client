import React, { useState, useEffect } from "react";
import { ImageOff } from "lucide-react";

export default function ProductCardPreview({
  name = "",
  categoryName = "",
  description = "",
  price = "",
  stockQuantity = "",
  imageUrl = "",
  isAvailable = true,
  approvalStatus = "PENDING",
  isEdit = false,
}) {
  const [hasImageError, setHasImageError] = useState(false);

  // Reset image error state whenever imageUrl changes
  useEffect(() => {
    setHasImageError(false);
  }, [imageUrl]);

  const numPrice = !isNaN(parseFloat(price)) && parseFloat(price) >= 0
    ? Number(price).toFixed(2)
    : "0.00";

  const numStock =
    stockQuantity !== "" && !isNaN(parseInt(stockQuantity, 10)) && parseInt(stockQuantity, 10) >= 0
      ? parseInt(stockQuantity, 10)
      : 0;

  const displayName = name.trim() || (isEdit ? "Product Name" : "Untitled Product");
  const displayCategory = categoryName || "Uncategorized";
  const displayDescription =
    description.trim() || "Product description will appear here as you type...";

  const isApproved =
    approvalStatus === "APPROVED" || approvalStatus === "VERIFIED";
  const isPending = approvalStatus === "PENDING";

  // Subtle stock indicator and styling
  const getStockDetails = (qty) => {
    if (qty <= 0) {
      return {
        status: "OUT_OF_STOCK",
        label: "Out of Stock",
        dotClass: "bg-rose-500",
        badgeClass: "bg-rose-50 text-rose-700 border-rose-200/80",
        cardBorder: "border-slate-200 hover:border-rose-300",
      };
    }
    if (qty <= 5) {
      return {
        status: "LOW_STOCK",
        label: "Low Stock",
        dotClass: "bg-amber-500",
        badgeClass: "bg-amber-50 text-amber-700 border-amber-200/80",
        cardBorder: "border-slate-200 hover:border-amber-300",
      };
    }
    return {
      status: "IN_STOCK",
      label: "In Stock",
      dotClass: "bg-emerald-500",
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
      cardBorder: "border-slate-200 hover:border-sky-300",
    };
  };

  const stockDetails = getStockDetails(numStock);

  return (
    <div className={`bg-white rounded-2xl border ${stockDetails.cardBorder} p-4 shadow-sm flex flex-col justify-between w-full transition-all`}>
      {/* Product Image Container with Overlay Badges */}
      <div className="relative w-full aspect-[4/3] rounded-xl bg-slate-50 overflow-hidden flex items-center justify-center border border-slate-100">
        {/* Availability Badge (Upper-Left) */}
        <div className="absolute top-2.5 left-2.5 z-10">
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase transition-colors ${
              isAvailable
                ? "bg-sky-100 text-sky-600"
                : "bg-slate-200 text-slate-600"
            }`}
          >
            {isAvailable ? "AVAILABLE" : "UNAVAILABLE"}
          </span>
        </div>

        {/* Approval Status Badge (Upper-Right) */}
        <div className="absolute top-2.5 right-2.5 z-10">
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase border transition-colors ${
              isApproved
                ? "bg-white text-sky-600 border-sky-200 shadow-xs"
                : isPending
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-rose-50 text-rose-700 border-rose-200"
            }`}
          >
            {isApproved ? "APPROVED" : isPending ? "PENDING" : "REJECTED"}
          </span>
        </div>

        {/* Image or Clean Placeholder */}
        {imageUrl && !hasImageError ? (
          <img
            src={imageUrl}
            alt={displayName}
            onError={() => setHasImageError(true)}
            className="w-full h-full object-cover transition-opacity duration-200"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-400 p-4 select-none">
            <ImageOff className="w-8 h-8 mb-1.5 text-slate-300" />
            <span className="text-xs font-medium text-slate-400">
              {imageUrl && hasImageError ? "Image unavailable" : "No image selected"}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5">
              Primary photo preview
            </span>
          </div>
        )}
      </div>

      {/* Card Content Details */}
      <div className="flex-1 flex flex-col justify-between mt-3">
        <div>
          {/* Category Pill */}
          <span className="inline-block text-[10px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md mb-1.5">
            {displayCategory}
          </span>

          {/* Product Name */}
          <h3
            className="font-bold text-slate-900 text-base leading-snug line-clamp-1"
            title={displayName}
          >
            {displayName}
          </h3>

          {/* Short Description */}
          <p
            className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed"
            title={displayDescription}
          >
            {displayDescription}
          </p>
        </div>

        {/* Unit Price & Stock Row with subtle stock indicator */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100/70">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Price
            </span>
            <span className="text-lg font-bold text-slate-900 leading-tight">
              ₱{numPrice}
            </span>
          </div>

          <div className="flex flex-col items-end">
            <span
              className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${stockDetails.badgeClass} transition-colors`}
              title={`${stockDetails.label}: ${numStock} units`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${stockDetails.dotClass}`} />
              <span>{stockDetails.label}</span>
              <span className="font-normal text-[10px] text-slate-500 ml-0.5">
                ({numStock})
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

