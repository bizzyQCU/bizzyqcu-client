import { useMemo, useState } from "react";
import Icon from "../../../components/Icon.jsx";
import RatingModal from "../../../components/RatingModal.jsx";
import { orders } from "../../../lib/mockData.js";
import { useRatings } from "../../../lib/RatingContext.jsx";
import OrderCard from "./OrderCard.jsx";
import { categories } from "./orderCategories.js";

const tiles = categories.filter((c) => c.id !== "all");

export default function OrdersMobile() {
  const { addRating } = useRatings();
  const [active, setActive] = useState("all");
  const [ratingFor, setRatingFor] = useState(null);
  const [rated, setRated] = useState({});

  const current = categories.find((c) => c.id === active);
  const visible = useMemo(() => orders.filter(current.match), [current]);

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">My Orders</h1>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-bold text-slate-900">My Purchases</p>
          <button type="button" onClick={() => setActive("all")} className="flex items-center gap-1 text-[11px] font-semibold text-sky-600">
            View order history
            <Icon name="chevronDown" className="h-3 w-3 -rotate-90" />
          </button>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {tiles.map((t) => {
            const count = orders.filter(t.match).length;
            const selected = active === t.id;
            return (
              <button
                key={t.id}
                type="button"
                aria-pressed={selected}
                onClick={() => setActive(selected ? "all" : t.id)}
                className="flex flex-col items-center gap-2 text-center transition active:scale-95"
              >
                <span className={`relative flex h-12 w-12 items-center justify-center rounded-xl border transition ${
                  selected ? "border-[#0284C7] bg-sky-100 text-[#0284C7]" : "border-slate-200 bg-slate-50 text-slate-600"
                }`}>
                  <Icon name={t.icon} className="h-5 w-5" />
                  {count > 0 && (
                    <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white ring-2 ring-white">
                      {count}
                    </span>
                  )}
                </span>
                <span className={`text-[10px] font-semibold leading-tight ${selected ? "text-[#0284C7]" : "text-slate-600"}`}>{t.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-900">{current.label}</h2>
        <span className="text-xs text-slate-500">{visible.length} {visible.length === 1 ? "order" : "orders"}</span>
      </div>

      {visible.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-xs text-slate-500">
          No orders in this category yet.
        </div>
      )}

      <div className="space-y-3">
        {visible.map((o) => (
          <OrderCard key={o.id} order={o} rated={!!rated[o.id]} onRate={setRatingFor} />
        ))}
      </div>

      {ratingFor && (
        <RatingModal
          seller={ratingFor.seller}
          initials={ratingFor.seller.split(" ").map((w) => w[0]).join("").slice(0, 2)}
          orderRef={`#BZ-2024-${ratingFor.id}`}
          onClose={() => setRatingFor(null)}
          onSubmit={({ rating, comment }) => {
            addRating(ratingFor.storeName, rating, comment);
            setRated({ ...rated, [ratingFor.id]: true });
            setRatingFor(null);
          }}
        />
      )}
    </div>
  );
}
