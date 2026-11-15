import React, { useState, useRef, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import ProductList from "../components/products/ProductList";
import AddProduct from "../components/products/AddProduct";
import EditProduct from "../components/products/EditProduct";
import { useProducts } from "../components/products/useProducts";
import SellerMessages from "../../pages/SellerMessages";

import "../components/products/Products.css";

import { MessageSquare, Bell, User, X, ArrowLeft } from "lucide-react";

export default function Products() {
  const [currentView, setCurrentView] = useState("list"); // 'list' | 'add' | 'edit'
  const [editingProduct, setEditingProduct] = useState(null);
  const [messagesOpen, setMessagesOpen] = useState(false);
  const mainRef = useRef(null);

  // Scroll main content container to top whenever view changes
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: "instant" });
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [currentView]);

  // Close Messages overlay on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && messagesOpen) {
        setMessagesOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [messagesOpen]);

  // Static demo store information
  const storeInfo = {
    name: "QCU Computer Society (QCS)",
    pickupLocation: "AWS IK Building, Basement, Booth No. 3",
  };

  const productsHook = useProducts();

  const handleAddProduct = () => {
    setCurrentView("add");
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setCurrentView("edit");
  };

  const handleBackToList = () => {
    setCurrentView("list");
    setEditingProduct(null);
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] relative">
      {/* ================= SIDEBAR ================= */}
      <Sidebar />

      {/* ================= MAIN CONTENT CONTAINER ================= */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* ================= TOP HEADER BAR ================= */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-20">
          <div>
            <h2 className="font-bold text-slate-900 text-base">
              {storeInfo.name}
            </h2>
            <p className="text-xs text-slate-500">
              {storeInfo.pickupLocation}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => setMessagesOpen(true)}
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors relative"
              title="Messages"
              aria-label="Messages"
            >
              <MessageSquare className="w-5 h-5" />
            </button>
            <button
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
            </button>
            <div
              className="w-8 h-8 rounded-full bg-[#0284C7] text-white flex items-center justify-center cursor-pointer hover:bg-[#0369A1] transition-colors"
              title="Profile"
            >
              <User className="w-5 h-5" />
            </div>
          </div>
        </header>

        {/* ================= MAIN CONTENT VIEWS ================= */}
        <main ref={mainRef} className="p-8 space-y-6 flex-1 overflow-y-auto">
          {/* VIEW: PRODUCT LIST */}
          {currentView === "list" && (
            <ProductList
              paginatedProducts={productsHook.paginatedProducts}
              totalItems={productsHook.totalItems}
              currentPage={productsHook.currentPage}
              totalPages={productsHook.totalPages}
              startIndex={productsHook.startIndex}
              endIndex={productsHook.endIndex}
              onPageChange={productsHook.onPageChange}
              metrics={productsHook.metrics}
              searchTerm={productsHook.searchTerm}
              setSearchTerm={productsHook.setSearchTerm}
              appliedFilters={productsHook.appliedFilters}
              activeFiltersCount={productsHook.activeFiltersCount}
              applyFilters={productsHook.applyFilters}
              clearAllFilters={productsHook.clearAllFilters}
              sortBy={productsHook.sortBy}
              setSortBy={productsHook.setSortBy}
              onAddProduct={handleAddProduct}
              onEditProduct={handleEditProduct}
              deleteProduct={productsHook.deleteProduct}
            />
          )}

          {/* VIEW: ADD PRODUCT */}
          {currentView === "add" && (
            <AddProduct
              onAddProduct={productsHook.addProduct}
              onCancel={handleBackToList}
            />
          )}

          {/* VIEW: EDIT PRODUCT */}
          {currentView === "edit" && (
            <EditProduct
              product={editingProduct}
              onUpdateProduct={productsHook.editProduct}
              onCancel={handleBackToList}
            />
          )}
        </main>
      </div>

      {/* ================= SELLER MESSAGES OVERLAY ================= */}
      {messagesOpen && (
        <div className="fixed inset-0 z-50 bg-[#f1f3f6] flex flex-col overflow-hidden animate-in fade-in duration-150">
          {/* Header Bar with Back to Products navigation */}
          <div className="h-14 px-6 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 shadow-xs z-10">
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setMessagesOpen(false)}
                className="flex items-center space-x-2 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                title="Return to Products"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Products</span>
              </button>
              <div className="h-4 w-px bg-slate-200" />
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-[#0284C7]" />
                <span className="font-bold text-slate-800 text-sm">
                  Messages
                </span>
                <span className="text-xs text-slate-500 hidden sm:inline">
                  · Seller Inbox
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMessagesOpen(false)}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Close Messages"
              aria-label="Close Messages"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Render existing SellerMessages component in full container */}
          <div className="flex-1 overflow-hidden" style={{ height: "calc(100vh - 56px)" }}>
            <SellerMessages />
          </div>
        </div>
      )}
    </div>
  );
}
