import { useMemo, useState } from "react";
import Icon from "../../../components/Icon.jsx";
import RatingModal from "../../../components/RatingModal.jsx";
import { orders } from "../../../lib/mockData.js";
import { useRatings } from "../../../lib/RatingContext.jsx";
import OrderCard from "./OrderCard.jsx";
import { categories } from "./orderCategories.js";

export default function OrdersDesktop() {
  const { addRating } = useRatings();
  const [active, setActive] = useState("all");
  const [query, setQuery] = useState("");
  const [ratingFor, setRatingFor] = useState(null);
  const [rated, setRated] = useState({});

  const current = categories.find((c) => c.id === active);
  const visible = useMemo(
    () =>
      orders
        .filter(current.match)
        .filter((o) => `${o.id} ${o.seller} ${o.status}`.toLowerCase().includes(query.toLowerCase())),
    [active, query, current]
  );

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      <aside className="w-full shrink-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:w-60">
        <div className="flex items-center gap-3 pb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
            <Icon name="bag" className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">My Orders</p>
            <p className="text-[11px] text-slate-500">Manage your purchases</p>
          </div>
        </div>
        <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Orders</p>
        <nav className="space-y-1" aria-label="Order categories">
          {categories.map((c) => {
            const selected = active === c.id;
            return (
              <button
                key={c.id}
                type="button"
                aria-current={selected ? "page" : undefined}
                onClick={() => setActive(c.id)}
                className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                  selected ? "bg-sky-100/70 font-semibold text-slate-900" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon name={c.icon} className={`h-4 w-4 ${selected ? "text-[#0284C7]" : "text-slate-400"}`} />
                  {c.label}
                </span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${selected ? "bg-white text-sky-700" : "bg-slate-100 text-slate-500"}`}>
                  {orders.filter(c.match).length}
                </span>
              </button>
            );
          })}
        </nav>
      </aside>

      <section className="min-w-0 flex-1 space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-[#0F172A]">{current.label}</h1>
            <p className="mt-1 text-xs text-[#64748B]">{visible.length} {visible.length === 1 ? "order" : "orders"}</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Icon name="search" className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search orders or sellers..."
              className="w-full rounded-full border border-slate-200 bg-white py-2 pl-9 pr-4 text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            />
          </div>
        </div>

        {visible.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
            {query ? "No orders match your search." : "No orders in this category yet."}
          </div>
        )}

        <div className="space-y-4">
          {visible.map((o) => (
            <OrderCard key={o.id} order={o} rated={!!rated[o.id]} onRate={setRatingFor} />
          ))}
        </div>
      </section>

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
