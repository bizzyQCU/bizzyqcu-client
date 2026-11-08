import useIsMobile from "../../../hooks/useIsMobile.js";
import MB_MarketPage from "./MB_MarketPage.jsx";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../../../components/Icon.jsx";
import VerifiedSeal from "../../../components/VerifiedSeal.jsx";
import { getProducts } from "../../marketplace/api.js";
import apiClient, { getErrorMessage } from "../../../lib/api-client.js";

// ─── Seller-type enum → display label ───────────────────────────────────────
const SELLER_TYPE_LABELS = {
  STUDENT_ENTERPRISE: "Enterprise",
  RECOGNIZED_ORGANIZATION: "Organization",
  INDEPENDENT_SELLER: "Independent Seller",
};
// API enum values in display order
const SELLER_TYPE_ENUMS = ["STUDENT_ENTERPRISE", "RECOGNIZED_ORGANIZATION", "INDEPENDENT_SELLER"];

/**
 * Build one store-card object per unique storeId from the products list.
 * Uses only fields that the API actually returns.
 */
function groupByStore(items) {
  const map = new Map();
  for (const p of items) {
    if (!map.has(p.storeId)) {
      map.set(p.storeId, {
        id: p.storeId,
        name: p.store.name,
        description: p.store.description ?? "",
        sellerType: p.store.sellerProfile?.sellerType ?? null,
        pickupLocation: p.store.pickupLocation ?? "",
        // initials from store name (up to 2 chars)
        initials: p.store.name
          .split(/\s+/)
          .slice(0, 2)
          .map((w) => w[0])
          .join("")
          .toUpperCase(),
        products: [],
        // first category seen for this store (used for display)
        category: p.category?.name ?? "",
        // cheapest product price for the card footer
        minPrice: parseFloat(p.price),
      });
    }
    const store = map.get(p.storeId);
    store.products.push(p);
    const pPrice = parseFloat(p.price);
    if (pPrice < store.minPrice) store.minPrice = pPrice;
  }
  return Array.from(map.values());
}

/** Load categories from GET /marketplace/categories */
async function fetchCategories() {
  const res = await apiClient.get("/marketplace/categories");
  return res.data; // { success, data: [{ id, name, slug }] }
}

function MarketDesktop() {
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const [categories, setCategories] = useState([{ id: null, name: "All Categories" }]);
  const [categoryId, setCategoryId] = useState(null); // null = All Categories
  const [sellerType, setSellerType] = useState(null); // API enum or null
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openBadge, setOpenBadge] = useState(null);

  // Debounce search input ~300 ms
  const debounceRef = useRef(null);
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  // Load categories once
  useEffect(() => {
    fetchCategories()
      .then((data) => {
        setCategories([
          { id: null, name: "All Categories" },
          ...(data.data ?? []),
        ]);
      })
      .catch(() => {}); // categories failure is non-fatal; keep "All Categories"
  }, []);

  // Fetch products when filters change
  useEffect(() => {
    setLoading(true);
    setError(null);
    const filters = {};
    if (debouncedQuery) filters.search = debouncedQuery;
    if (categoryId) filters.categoryId = categoryId;
    if (sellerType) filters.sellerType = sellerType;

    getProducts(filters)
      .then((data) => {
        setStores(groupByStore(data.items ?? []));
      })
      .catch((err) => {
        setError(getErrorMessage(err));
      })
      .finally(() => setLoading(false));
  }, [debouncedQuery, categoryId, sellerType]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Marketplace</h1>
        <div className="relative w-full sm:w-80">
          <Icon name="search" className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search sellers and products"
            className="w-full rounded-full border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-5">
        {/* Category pills */}
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => {
            const selected = categoryId === c.id;
            return (
              <button
                key={c.id ?? "all"}
                type="button"
                aria-pressed={selected}
                onClick={() => setCategoryId(c.id)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                  selected ? "bg-slate-900 text-white shadow-sm" : "border border-slate-200 bg-white text-slate-700 hover:border-sky-200 hover:bg-sky-50"
                }`}
              >
                {c.name}
              </button>
            );
          })}
        </div>

        {/* Seller-type toggle */}
        <div className="flex flex-wrap gap-1 rounded-full border border-sky-200 bg-sky-100 p-1">
          {SELLER_TYPE_ENUMS.map((enumVal) => {
            const selected = sellerType === enumVal;
            return (
              <button
                key={enumVal}
                type="button"
                aria-pressed={selected}
                onClick={() => setSellerType(selected ? null : enumVal)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                  selected ? "bg-sky-200 text-sky-800 shadow-sm" : "text-slate-600 hover:bg-white/70"
                }`}
              >
                {SELLER_TYPE_LABELS[enumVal]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading / error / empty states */}
      {loading && (
        <p className="py-10 text-center text-sm text-slate-500">Loading sellers…</p>
      )}
      {!loading && error && (
        <p className="py-10 text-center text-sm text-rose-600">{error}</p>
      )}
      {!loading && !error && (
        <>
          <p className="text-xs text-slate-500">{stores.length} {stores.length === 1 ? "seller" : "sellers"}</p>

          {stores.length === 0 && (
            <p className="py-10 text-center text-sm text-slate-500">No sellers match these filters.</p>
          )}

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {stores.map((s) => (
              <div
                key={s.id}
                role="link"
                tabIndex={0}
                onClick={() => navigate(`/stores/${s.id}`)}
                onKeyDown={(e) => e.key === "Enter" && navigate(`/stores/${s.id}`)}
                className="group cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-[#8ACFF8] hover:shadow-[0_12px_24px_-4px_rgba(2,132,199,0.10)] focus:outline-none focus:ring-2 focus:ring-sky-500/30"
              >
                <div className="relative h-28 bg-[#8ACFF8]/70">
                  <div className="absolute -bottom-7 left-5 flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-sky-100 text-sm font-bold text-sky-700 shadow-sm transition group-hover:scale-105">
                    {s.initials}
                  </div>
                </div>
                <div className="px-5 pb-4 pt-10">
                  <div className="flex items-center gap-1.5">
                    <h2 className="truncate text-sm font-bold text-slate-900">{s.name}</h2>
                    <button
                      type="button"
                      aria-label="Verified seller info"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenBadge(openBadge === s.id ? null : s.id);
                      }}
                      className="relative flex shrink-0 items-center"
                    >
                      <VerifiedSeal className="h-4 w-4" />
                      {openBadge === s.id && (
                        <span className="absolute left-1/2 top-6 z-10 w-40 -translate-x-1/2 rounded-lg bg-slate-900 px-2 py-1.5 text-[10px] font-medium text-white shadow-lg">
                          Verified QCU seller
                        </span>
                      )}
                    </button>
                  </div>
                  <p className="mt-1.5 line-clamp-2 min-h-[2.25rem] text-xs text-slate-500">
                    {s.description || s.category}
                  </p>
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    <span className="truncate pr-2">{SELLER_TYPE_LABELS[s.sellerType] ?? s.sellerType}</span>
                    <span className="shrink-0 text-slate-700">
                      from ₱{Number(s.minPrice).toLocaleString("en-PH")}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function MarketPage() {
  return useIsMobile() ? <MB_MarketPage /> : <MarketDesktop />;
}
