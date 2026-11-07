import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../../../components/Icon.jsx";
import VerifiedSeal from "../../../components/VerifiedSeal.jsx";
import { sellerTypes, stores } from "../../../lib/mockData.js";

const shortLabel = (t) => t.replace(" Seller", "");

export default function MarketplaceMobile() {
  const navigate = useNavigate();
  const [type, setType] = useState(null);
  const [query, setQuery] = useState("");
  const [sortAZ, setSortAZ] = useState(false);

  const list = useMemo(() => {
    const filtered = stores
      .filter((s) => !type || s.type === type)
      .filter((s) => `${s.name} ${s.desc} ${s.category}`.toLowerCase().includes(query.toLowerCase()));
    return sortAZ ? [...filtered].sort((a, b) => a.name.localeCompare(b.name)) : filtered;
  }, [type, query, sortAZ]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Marketplace</h1>

      <div className="relative">
        <Icon name="search" className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search sellers and products"
          className="w-full rounded-full border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
        />
      </div>

      <div className="flex gap-1 rounded-full bg-[#F8A000] p-1" role="group" aria-label="Seller type">
        {sellerTypes.map((t) => {
          const selected = type === t;
          return (
            <button
              key={t}
              type="button"
              aria-pressed={selected}
              onClick={() => setType(selected ? null : t)}
              className={`flex-1 rounded-full px-2 py-1.5 text-[11px] font-bold transition ${selected ? "bg-white text-[#B45309] shadow-sm" : "text-white"}`}
            >
              {shortLabel(t)}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-[11px]">
        <span className="flex items-center gap-1.5 font-semibold text-sky-600">
          <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
          {list.length} verified campus sellers
        </span>
        <button type="button" onClick={() => setSortAZ((v) => !v)} className="flex items-center gap-1 font-semibold text-sky-600">
          <Icon name="chevronDown" className="h-3 w-3" />
          {sortAZ ? "Sorted A–Z" : "Sort"}
        </button>
      </div>

      {list.length === 0 && <p className="py-10 text-center text-sm text-slate-500">No sellers match these filters.</p>}

      <div className="grid grid-cols-2 gap-3">
        {list.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => navigate(`/stores/${s.id}`)}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition active:scale-[0.98]"
          >
            <div className="relative h-20 bg-gradient-to-br from-sky-200 to-sky-100">
              <span className="absolute right-2 top-2 rounded-full bg-slate-800 px-2 py-0.5 text-[9px] font-bold text-white">Active</span>
              <span className="absolute -bottom-5 left-3 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-sky-100 text-xs font-bold text-sky-700 shadow-sm">
                {s.initials}
              </span>
            </div>
            <div className="px-3 pb-3 pt-7">
              <div className="flex items-start gap-1">
                <h2 className="text-xs font-bold leading-snug text-slate-900">{s.name}</h2>
                {s.verified && <VerifiedSeal className="mt-0.5 h-3.5 w-3.5 shrink-0" />}
              </div>
              <p className="mt-2 border-t border-slate-100 pt-2 text-[9px] font-semibold uppercase tracking-wider text-slate-500">{s.category}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
