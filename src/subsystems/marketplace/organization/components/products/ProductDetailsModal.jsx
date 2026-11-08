import React, { useState, useEffect } from "react";
import {
  X,
  Pencil,
  Tag,
  Package,
  Calendar,
  Layers,
  ImageOff,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
} from "lucide-react";

export default function ProductDetailsModal({
  product,
  onClose,
  onEditProduct,
}) {
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [galleryErrors, setGalleryErrors] = useState({});

  // Reset active image index when product changes
  useEffect(() => {
    setActiveImageIdx(0);
    setGalleryErrors({});
  }, [product]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!product) return null;

  const images = Array.isArray(product.imageUrls) ? product.imageUrls : [];
  const currentImageUrl = images[activeImageIdx] || images[0];

  const handleImageError = (idx) => {
    setGalleryErrors((prev) => ({ ...prev, [idx]: true }));
  };

  // Stock status calculation:
  // In Stock: > 5 units
  // Low Stock: 1-5 units
  // Out of Stock: 0 units
  const stockQty = Number(product.stockQuantity) || 0;
  let stockLevelBadge = {
    label: "In Stock",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: CheckCircle2,
  };
  if (stockQty === 0) {
    stockLevelBadge = {
      label: "Out of Stock",
      className: "bg-rose-50 text-rose-700 border-rose-200",
      icon: XCircle,
    };
  } else if (stockQty <= 5) {
    stockLevelBadge = {
      label: "Low Stock",
      className: "bg-amber-50 text-amber-700 border-amber-200",
      icon: AlertTriangle,
    };
  }

  // Approval status badge
  const approvalStatus = product.approvalStatus || "PENDING";
  const isApproved =
    approvalStatus === "APPROVED" || approvalStatus === "VERIFIED";
  const isPending = approvalStatus === "PENDING";

  // Format Date Added
  const formattedDate = product.createdAt
    ? new Date(product.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
    : null;

  return (
    <div
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ================= MODAL HEADER ================= */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-[#0284C7] flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Product Details
              </h2>
              <p className="text-xs text-slate-500">
                Detailed catalog listing overview
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            title="Close modal (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ================= MODAL SCROLLABLE BODY ================= */}
        <div className="px-6 py-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          {/* ================= REQUIRED TOP SECTION ================= */}
          {/* 1. Product Name, followed DIRECTLY underneath by 2. Full Product Description */}
          <div className="space-y-3 pb-5 border-b border-slate-200/80">
            <div className="flex items-center space-x-2">
              <span className="inline-block text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                {product.categoryName || product.category?.name || "General"}
              </span>
            </div>

            {/* 1. Product Name */}
            <h1 className="text-2xl font-bold text-slate-900 leading-snug tracking-tight">
              {product.name}
            </h1>

            {/* 2. Full Product Description directly underneath the product name */}
            <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/70">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Full Description
              </span>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {product.description || "No description provided."}
              </p>
            </div>
          </div>

          {/* ================= PRODUCT GALLERY & ATTRIBUTES GRID ================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Gallery Column */}
            <div className="space-y-3">
              {/* Primary Active Image Display */}
              <div className="relative aspect-[4/3] rounded-xl bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center">
                {currentImageUrl && !galleryErrors[activeImageIdx] ? (
                  <img
                    src={currentImageUrl}
                    alt={product.name}
                    onError={() => handleImageError(activeImageIdx)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400 p-6 select-none">
                    <ImageOff className="w-10 h-10 mb-2 text-slate-300" />
                    <span className="text-xs font-medium text-slate-400">
                      No image available
                    </span>
                  </div>
                )}

                {/* Listing Availability Badge Overlay */}
                <div className="absolute top-2.5 left-2.5">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase shadow-xs ${product.isAvailable
                        ? "bg-sky-100 text-sky-700"
                        : "bg-slate-200 text-slate-700"
                      }`}
                  >
                    {product.isAvailable ? "AVAILABLE" : "UNAVAILABLE"}
                  </span>
                </div>
              </div>

              {/* Thumbnails list if multiple images exist */}
              {images.length > 1 && (
                <div className="flex items-center space-x-2 overflow-x-auto pb-1">
                  {images.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIdx(idx)}
                      className={`relative w-16 h-14 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${activeImageIdx === idx
                          ? "border-[#0284C7] ring-2 ring-sky-500/20"
                          : "border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100"
                        }`}
                    >
                      <img
                        src={imgUrl}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Attributes & Status Badges Column */}
            <div className="space-y-4">
              {/* Price and Stock summary */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Unit Price
                  </span>
                  <span className="text-2xl font-bold text-slate-900">
                    ₱{Number(product.price || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200">
                  <span className="text-slate-500">Available Stock:</span>
                  <span className="font-semibold text-slate-800">
                    {stockQty} units
                  </span>
                </div>
              </div>

              {/* Status Badges Grid */}
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                {/* Approval Status */}
                <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Approval Status
                  </span>
                  <span
                    className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-bold border ${isApproved
                        ? "bg-white text-sky-600 border-sky-200 shadow-xs"
                        : isPending
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-rose-50 text-rose-700 border-rose-200"
                      }`}
                  >
                    {isApproved ? (
                      <CheckCircle2 className="w-3 h-3 text-sky-500" />
                    ) : isPending ? (
                      <Clock className="w-3 h-3 text-amber-500" />
                    ) : (
                      <XCircle className="w-3 h-3 text-rose-500" />
                    )}
                    <span>
                      {isApproved
                        ? "APPROVED"
                        : isPending
                          ? "PENDING"
                          : "REJECTED"}
                    </span>
                  </span>
                </div>

                {/* Stock Level */}
                <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Stock Level
                  </span>
                  <span
                    className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-bold border ${stockLevelBadge.className}`}
                  >
                    <stockLevelBadge.icon className="w-3 h-3" />
                    <span>{stockLevelBadge.label}</span>
                  </span>
                </div>
              </div>

              {/* Listing Availability indicator */}
              <div className="p-2.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between text-xs">
                <span className="text-slate-500">Listing Availability:</span>
                <span
                  className={`font-bold px-2 py-0.5 rounded-full text-[10px] uppercase ${product.isAvailable
                      ? "bg-sky-100 text-sky-700"
                      : "bg-slate-100 text-slate-600"
                    }`}
                >
                  {product.isAvailable ? "Available" : "Unavailable / Paused"}
                </span>
              </div>

              {/* Date Added */}
              {formattedDate && (
                <div className="flex items-center space-x-2 text-xs text-slate-500 pt-1">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>
                    Date Added:{" "}
                    <strong className="text-slate-700">{formattedDate}</strong>
                  </span>
                </div>
              )}

              {/* Administrator Rejection Reason Notice */}
              {product.rejectionReason && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs space-y-1">
                  <div className="flex items-center space-x-1.5 text-rose-800 font-bold">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>Administrator Rejection Reason:</span>
                  </div>
                  <p className="text-rose-700 leading-relaxed pl-5">
                    {product.rejectionReason}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ================= MODAL FOOTER ================= */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            ID: <code className="text-slate-600 font-mono">{product.id}</code>
          </span>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onEditProduct(product);
              }}
              className="flex items-center space-x-1.5 px-5 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-lg text-sm font-semibold shadow-sm transition-colors"
            >
              <Pencil className="w-4 h-4" />
              <span>Edit Product</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
