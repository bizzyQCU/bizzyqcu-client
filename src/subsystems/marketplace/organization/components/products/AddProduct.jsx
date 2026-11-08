import React, { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  UploadCloud,
  Trash2,
  AlertCircle,
  Tag,
  DollarSign,
  Layers,
  CheckCircle2,
  Circle,
  Eye,
  ShieldAlert,
} from "lucide-react";
import { MOCK_CATEGORIES } from "./useProducts";
import ProductCardPreview from "./ProductCardPreview";
import { fileToDataUrl, saveProductImages } from "./productImageStorage";

const MAX_IMAGES = 3;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function AddProduct({ onAddProduct, onCancel }) {
  // Form Fields
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState(MOCK_CATEGORIES[0]?.id || "");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stockQuantity, setStockQuantity] = useState("1");
  const [isAvailable, setIsAvailable] = useState(true);

  // Direct Image Upload State: Array of { id, url, file, isLocal }
  const [images, setImages] = useState([]);
  const [imageError, setImageError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Validation States
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Scroll to top of page/main container on mount
  useEffect(() => {
    window.scrollTo(0, 0);
    const mainEl = document.querySelector("main");
    if (mainEl) {
      mainEl.scrollTop = 0;
    }
  }, []);

  // Cleanup object URLs on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      images.forEach((img) => {
        if (img.isLocal && img.url && img.url.startsWith("blob:")) {
          URL.revokeObjectURL(img.url);
        }
      });
    };
  }, [images]);

  // Handle file selection (via input or drag & drop)
  const handleFiles = async (fileList) => {
    setImageError(null);
    const files = Array.from(fileList);
    if (!files.length) return;

    if (images.length + files.length > MAX_IMAGES) {
      setImageError(`You can upload a maximum of ${MAX_IMAGES} images.`);
      return;
    }

    const newImages = [];
    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setImageError("Supported formats are JPG, PNG, and WEBP only.");
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setImageError(`File "${file.name}" exceeds the 5MB maximum size limit.`);
        return;
      }

      // Convert to base64 Data URL for persistent preview & storage
      let persistentUrl = "";
      try {
        persistentUrl = await fileToDataUrl(file);
      } catch {
        persistentUrl = URL.createObjectURL(file);
      }

      newImages.push({
        id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        url: persistentUrl,
        file,
        name: file.name,
        type: file.type,
        isLocal: true,
      });
    }

    setImages((prev) => [...prev, ...newImages]);
    if (fieldErrors.images) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.images;
        return next;
      });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer?.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // Remove uploaded image
  const handleRemoveImage = (indexToRemove) => {
    setImages((prev) => {
      const removed = prev[indexToRemove];
      if (removed?.isLocal && removed.url && removed.url.startsWith("blob:")) {
        URL.revokeObjectURL(removed.url);
      }
      return prev.filter((_, i) => i !== indexToRemove);
    });
  };

  // Form Validation
  const validateForm = () => {
    const errors = {};

    if (!categoryId) {
      errors.categoryId = "Please select a product category.";
    }

    if (!name.trim()) {
      errors.name = "Product name is required.";
    } else if (name.trim().length < 3) {
      errors.name = "Product name must be at least 3 characters.";
    }

    if (!description.trim()) {
      errors.description = "Product description is required.";
    } else if (description.trim().length < 10) {
      errors.description = "Description must be at least 10 characters.";
    }

    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      errors.price = "Price must be a valid positive number greater than 0.";
    }

    const numStock = parseInt(stockQuantity, 10);
    if (isNaN(numStock) || numStock < 0) {
      errors.stockQuantity = "Stock quantity must be a whole number (0 or greater).";
    }

    if (images.length === 0) {
      errors.images = "At least 1 product image is required.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm() || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    const newProductId = `prod-${Date.now()}`;

    // Store actual uploaded images in IndexedDB associated with newProductId
    let finalImageUrls = [];
    try {
      const savedRecord = await saveProductImages(newProductId, images);
      if (savedRecord && savedRecord.images && savedRecord.images.length > 0) {
        finalImageUrls = savedRecord.images.map((img) => img.url).filter(Boolean);
      }
    } catch (err) {
      console.warn("Failed to store images in IndexedDB:", err);
    }

    if (finalImageUrls.length === 0) {
      finalImageUrls = images.map((img) => img.url);
    }

    const categoryObj = MOCK_CATEGORIES.find((c) => c.id === categoryId);

    onAddProduct({
      id: newProductId,
      name: name.trim(),
      categoryId,
      categoryName: categoryObj?.name || "Apparel & Uniforms",
      description: description.trim(),
      price: parseFloat(price),
      stockQuantity: parseInt(stockQuantity, 10),
      imageUrls: finalImageUrls,
      isAvailable,
      approvalStatus: "PENDING",
    });

    onCancel();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* ================= 1. PAGE HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Add Product
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Create a new product listing for your organization.
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center space-x-2 px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Products</span>
        </button>
      </div>

      {/* ================= 2. TWO-COLUMN LAYOUT: FORM + LIVE PREVIEW ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Product Entry Form */}
        <div className="lg:col-span-7 xl:col-span-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section 1: Product Information */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center space-x-2">
                <Tag className="w-4 h-4 text-[#0284C7]" />
                <span>Product Information</span>
              </h2>

              {/* Product Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Product Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (fieldErrors.name) {
                      setFieldErrors((prev) => ({ ...prev, name: null }));
                    }
                  }}
                  placeholder="e.g., QCU CCS Official Org Hoodie"
                  maxLength={100}
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all ${
                    fieldErrors.name
                      ? "border-rose-400 bg-rose-50/30"
                      : "border-slate-200"
                  }`}
                />
                <div className="flex justify-between items-center mt-1">
                  {fieldErrors.name ? (
                    <span className="text-xs text-rose-600 font-medium">
                      {fieldErrors.name}
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400">
                      Must be at least 3 characters.
                    </span>
                  )}
                  <span className="text-[11px] text-slate-400">
                    {name.length}/100
                  </span>
                </div>
              </div>

              {/* Product Category */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Product Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => {
                    setCategoryId(e.target.value);
                    if (fieldErrors.categoryId) {
                      setFieldErrors((prev) => ({ ...prev, categoryId: null }));
                    }
                  }}
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all cursor-pointer ${
                    fieldErrors.categoryId
                      ? "border-rose-400"
                      : "border-slate-200"
                  }`}
                >
                  {MOCK_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {fieldErrors.categoryId && (
                  <span className="text-xs text-rose-600 font-medium mt-1 block">
                    {fieldErrors.categoryId}
                  </span>
                )}
              </div>

              {/* Product Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Product Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (fieldErrors.description) {
                      setFieldErrors((prev) => ({ ...prev, description: null }));
                    }
                  }}
                  placeholder="Describe specifications, sizing, materials, or special campus pickup guidelines..."
                  maxLength={1000}
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all ${
                    fieldErrors.description
                      ? "border-rose-400 bg-rose-50/30"
                      : "border-slate-200"
                  }`}
                />
                <div className="flex justify-between items-center mt-1">
                  {fieldErrors.description ? (
                    <span className="text-xs text-rose-600 font-medium">
                      {fieldErrors.description}
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400">
                      Must be at least 10 characters.
                    </span>
                  )}
                  <span className="text-[11px] text-slate-400">
                    {description.length}/1000
                  </span>
                </div>
              </div>
            </div>

            {/* Section 2: Product Images (Direct File Upload + IndexedDB Storage) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-2">
                <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <UploadCloud className="w-4 h-4 text-[#0284C7]" />
                  <span>Product Images</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Upload up to 3 images from your computer. The first image will automatically be set as the Primary photo.
                </p>
              </div>

              {/* Drag & Drop Upload Area */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  isDragging
                    ? "border-sky-500 bg-sky-50/50"
                    : "border-slate-300 hover:border-sky-400 hover:bg-slate-50/50"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => handleFiles(e.target.files)}
                  className="hidden"
                />
                <div className="w-12 h-12 bg-sky-50 text-[#0284C7] rounded-full flex items-center justify-center mx-auto mb-3">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-slate-800">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Upload up to 3 images (JPG, PNG, or WEBP, max 5MB each)
                </p>
              </div>

              {/* Error Message for Upload */}
              {(imageError || fieldErrors.images) && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{imageError || fieldErrors.images}</span>
                </div>
              )}

              {/* Image Preview Slots */}
              {images.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-semibold text-slate-700">
                    Selected Images ({images.length}/{MAX_IMAGES}):
                  </span>
                  <div className="grid grid-cols-3 gap-4">
                    {images.map((img, idx) => (
                      <div
                        key={img.id}
                        className="relative rounded-xl border border-slate-200 overflow-hidden bg-slate-100 aspect-[4/3] group shadow-sm flex items-center justify-center"
                      >
                        <img
                          src={img.url}
                          alt={`Product preview ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />

                        {/* Primary Badge */}
                        {idx === 0 && (
                          <span className="absolute top-2 left-2 bg-[#0284C7] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                            Primary
                          </span>
                        )}

                        {/* Remove Action Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveImage(idx);
                          }}
                          className="absolute top-2 right-2 p-1.5 bg-rose-600 text-white rounded-lg opacity-90 group-hover:opacity-100 hover:bg-rose-700 transition-all shadow"
                          title="Remove image"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Section 3: Pricing and Stock */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-[#0284C7]" />
                <span>Pricing and Stock</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Unit Price */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Unit Price (PHP) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">
                      ₱
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={price}
                      onChange={(e) => {
                        setPrice(e.target.value);
                        if (fieldErrors.price) {
                          setFieldErrors((prev) => ({ ...prev, price: null }));
                        }
                      }}
                      placeholder="0.00"
                      className={`w-full pl-8 pr-3.5 py-2.5 bg-slate-50 border rounded-lg text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all ${
                        fieldErrors.price
                          ? "border-rose-400 bg-rose-50/30"
                          : "border-slate-200"
                      }`}
                    />
                  </div>
                  {fieldErrors.price && (
                    <span className="text-xs text-rose-600 font-medium mt-1 block">
                      {fieldErrors.price}
                    </span>
                  )}
                </div>

                {/* Available Physical Stock */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Available Physical Stock <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Layers className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={stockQuantity}
                      onChange={(e) => {
                        setStockQuantity(e.target.value);
                        if (fieldErrors.stockQuantity) {
                          setFieldErrors((prev) => ({
                            ...prev,
                            stockQuantity: null,
                          }));
                        }
                      }}
                      placeholder="e.g., 50"
                      className={`w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border rounded-lg text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all ${
                        fieldErrors.stockQuantity
                          ? "border-rose-400 bg-rose-50/30"
                          : "border-slate-200"
                      }`}
                    />
                  </div>
                  {fieldErrors.stockQuantity && (
                    <span className="text-xs text-rose-600 font-medium mt-1 block">
                      {fieldErrors.stockQuantity}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Section 4: Listing Availability */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-2">
                <h2 className="text-base font-bold text-slate-900">
                  Listing Availability
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Choose whether this product is immediately available for students to browse and order once approved.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Option: Available */}
                <div
                  onClick={() => setIsAvailable(true)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start space-x-3 ${
                    isAvailable
                      ? "border-[#0284C7] bg-sky-50/40"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="mt-0.5">
                    {isAvailable ? (
                      <CheckCircle2 className="w-5 h-5 text-[#0284C7]" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Available</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Visible in marketplace when approved and open for campus pickup.
                    </p>
                  </div>
                </div>

                {/* Option: Unavailable / Paused */}
                <div
                  onClick={() => setIsAvailable(false)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start space-x-3 ${
                    !isAvailable
                      ? "border-[#0284C7] bg-sky-50/40"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="mt-0.5">
                    {!isAvailable ? (
                      <CheckCircle2 className="w-5 h-5 text-[#0284C7]" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">
                      Unavailable / Paused
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Temporarily hidden from buyers and marketplace listings.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 5: Form Actions (Cancel and Save Product) */}
            <div className="pt-2 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-5 py-2.5 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-lg text-sm font-semibold shadow-sm transition-colors disabled:opacity-60"
              >
                {isSubmitting ? "Saving…" : "Save Product"}
              </button>
            </div>
          </form>
        </div>

        {/* Dedicated Product Preview / Listing Overview Sidebar */}
        <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
                  <Eye className="w-4 h-4 text-[#0284C7]" />
                  <span>Product Card Preview</span>
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Listing overview as it appears in catalog
                </p>
              </div>
              <span className="inline-flex items-center text-[10px] font-bold text-[#0284C7] bg-sky-50 px-2 py-0.5 rounded-full border border-sky-100">
                Live Preview
              </span>
            </div>

            {/* Live Product Card */}
            <ProductCardPreview
              name={name}
              categoryName={MOCK_CATEGORIES.find((c) => c.id === categoryId)?.name}
              description={description}
              price={price}
              stockQuantity={stockQuantity}
              imageUrl={images[0]?.url}
              isAvailable={isAvailable}
              approvalStatus="PENDING"
              isEdit={false}
            />

            <div className="pt-2 border-t border-slate-100">
              <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                Card updates automatically as you adjust form values. Initial status for newly added products is <strong>PENDING</strong>.
              </p>
            </div>
          </div>

          {/* ================= 7. ADMINISTRATOR REVIEW PROTOCOL ================= */}
          <div className="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-4 sm:p-5 space-y-2 shadow-xs">
            <div className="flex items-center space-x-2 text-amber-900 font-bold text-sm">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Administrator Review Protocol</span>
            </div>
            <p className="text-xs text-amber-900/80 leading-relaxed">
              All new product listings are subject to administrator review. Please wait for administrator approval before your product becomes visible in the marketplace.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
