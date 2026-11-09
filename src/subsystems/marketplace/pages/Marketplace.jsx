import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getProducts } from "../api";
import { useAuth } from "../../../hooks";

export default function Marketplace() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [addedId, setAddedId] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await getProducts({
        search: search.trim() || undefined,
        limit: 24,
      });
      setProducts(res.items || res.data || []);
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchProducts(), 250);
    return () => clearTimeout(timer);
  }, [search]);

  // Load cart count from localStorage
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("bizzyqcu_cart") || "[]");
      setCartCount(saved.reduce((sum, item) => sum + item.quantity, 0));
    } catch {
      setCartCount(0);
    }
  }, []);

  const handleAddToCart = (product) => {
    try {
      const saved = JSON.parse(localStorage.getItem("bizzyqcu_cart") || "[]");
      const existing = saved.find((item) => item.productId === product.id);
      let updated;
      if (existing) {
        updated = saved.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        updated = [
          ...saved,
          {
            productId: product.id,
            storeId: product.storeId,
            name: product.name,
            price: Number(product.price),
            imageUrl: product.imageUrls?.[0] || "",
            storeName: product.store?.name || "Campus Store",
            quantity: 1,
          },
        ];
      }
      localStorage.setItem("bizzyqcu_cart", JSON.stringify(updated));
      setCartCount(updated.reduce((sum, item) => sum + item.quantity, 0));
      setAddedId(product.id);
      setTimeout(() => setAddedId(null), 1500);
    } catch (err) {
      console.error("Cart error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 selection:bg-amber-400 selection:text-slate-950">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ============================================================== */}
        {/* CAMPUS ADMIN CONTACT NOTIFICATION BANNER */}
        {/* ============================================================== */}
        <div className="bg-gradient-to-r from-amber-500/15 via-slate-800 to-amber-500/10 border border-amber-400/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center text-xl shrink-0">
              🛡️
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Need Support or Have an Issue with a Seller?
                <span className="hidden sm:inline text-xs font-normal text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                  Official QCU Support
                </span>
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Quezon City University administrators are available to help resolve payment discrepancies, delivery issues, or general questions.
              </p>
            </div>
          </div>
          <Link
            to="/contact-admin"
            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all whitespace-nowrap self-stretch sm:self-auto text-center"
          >
            Contact Campus Admin →
          </Link>
        </div>

        {/* ============================================================== */}
        {/* HERO / SEARCH BAR */}
        {/* ============================================================== */}
        <div className="bg-[#1E293B] border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center md:text-left">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              QCU Student Marketplace
            </h1>
            <p className="text-sm text-slate-400">
              Discover verified campus merchandise, stationery, food, and student-crafted items.
            </p>
          </div>

          <div className="w-full md:w-80 relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 text-sm">
              🔍
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products or stores..."
              className="w-full bg-[#0B1120] text-sm text-white placeholder-slate-500 pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
            />
          </div>
        </div>

        {/* ============================================================== */}
        {/* PRODUCT CATALOG GRID */}
        {/* ============================================================== */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-[#1E293B] p-4 rounded-2xl border border-slate-800 animate-pulse space-y-3">
                <div className="h-48 bg-slate-800 rounded-xl" />
                <div className="h-4 bg-slate-700 rounded w-2/3" />
                <div className="h-4 bg-slate-700 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-[#1E293B] border border-dashed border-slate-700 p-12 rounded-2xl text-center space-y-3">
            <div className="text-4xl">🛍️</div>
            <h3 className="text-lg font-bold text-white">No products found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Try adjusting your search keywords, or check back soon as campus sellers list new verified inventory.
            </p>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="mt-2 text-xs font-bold text-amber-400 hover:underline"
              >
                Clear Search Filter
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => {
              const photo = product.imageUrls?.[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600";
              const isAdded = addedId === product.id;

              return (
                <div
                  key={product.id}
                  className="bg-[#1E293B] border border-slate-700/80 hover:border-amber-400/60 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all flex flex-col group"
                >
                  {/* Image */}
                  <div className="relative aspect-square overflow-hidden bg-[#0B1120]">
                    <img
                      src={photo}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 right-2.5 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-extrabold text-amber-400 border border-amber-400/30">
                      ₱{Number(product.price).toFixed(2)}
                    </div>
                    {product.category && (
                      <div className="absolute bottom-2.5 left-2.5 bg-slate-900/80 backdrop-blur-md px-2.5 py-0.5 rounded-md text-[10px] font-bold text-slate-300 border border-slate-700">
                        {product.category.name}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h3 className="font-bold text-sm text-white line-clamp-1 group-hover:text-amber-400 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-700/60 space-y-2.5">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="truncate max-w-[140px] text-slate-300 font-medium">
                          🏪 {product.store?.name || "Campus Store"}
                        </span>
                        <span className="font-mono text-emerald-400 font-semibold">
                          {product.stockQuantity} in stock
                        </span>
                      </div>

                      <button
                        onClick={() => handleAddToCart(product)}
                        className={`w-full py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md ${
                          isAdded
                            ? "bg-emerald-500 text-slate-950 font-extrabold"
                            : "bg-amber-400 hover:bg-amber-300 text-slate-950"
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <span>✓</span>
                            <span>Added to Cart!</span>
                          </>
                        ) : (
                          <>
                            <span>🛒</span>
                            <span>Add to Cart</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

