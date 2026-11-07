import useIsMobile from "../../../hooks/useIsMobile.js";
import MarketplaceMobile from "./MarketplaceMobile.jsx";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../../../components/Icon.jsx";
import VerifiedSeal from "../../../components/VerifiedSeal.jsx";
import { categories, sellerTypes, stores } from "../../../lib/mockData.js";

function MarketplaceDesktop() {
  const navigate = useNavigate();
  const [category, setCategory] = useState("All Categories");
  const [sellerType, setSellerType] = useState(null);
  const [query, setQuery] = useState("");
  const [openBadge, setOpenBadge] = useState(null);

  const visible = useMemo(() => {
    return stores
      .filter((s) => category === "All Categories" || s.category === category)
      .filter((s) => !sellerType || s.type === sellerType)
      .filter((s) => `${s.name} ${s.desc} ${s.category}`.toLowerCase().includes(query.toLowerCase()));
  }, [category, sellerType, query]);

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
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => {
            const selected = category === c;
            return (
              <button
                key={c}
                type="button"
                aria-pressed={selected}
                onClick={() => setCategory(c)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                  selected ? "bg-slate-900 text-white shadow-sm" : "border border-slate-200 bg-white text-slate-700 hover:border-sky-200 hover:bg-sky-50"
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-1 rounded-full border border-sky-200 bg-sky-100 p-1">
          {sellerTypes.map((t) => {
            const selected = sellerType === t;
            return (
              <button
                key={t}
                type="button"
                aria-pressed={selected}
                onClick={() => setSellerType(selected ? null : t)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                  selected ? "bg-sky-200 text-sky-800 shadow-sm" : "text-slate-600 hover:bg-white/70"
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-slate-500">{visible.length} sellers</p>

      {visible.length === 0 && <p className="py-10 text-center text-sm text-slate-500">No sellers match these filters.</p>}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {visible.map((s) => (
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
                {s.verified && (
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
                )}
              </div>
              <p className="mt-1.5 line-clamp-2 min-h-[2.25rem] text-xs text-slate-500">{s.desc}</p>
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                <span className="truncate pr-2">{s.category}</span>
                <span className="shrink-0 text-slate-700">₱{s.products[0].price.toLocaleString("en-PH")}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MarketplacePage() {
  return useIsMobile() ? <MarketplaceMobile /> : <MarketplaceDesktop />;
}
