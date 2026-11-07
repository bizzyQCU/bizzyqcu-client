import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import ConfirmDialog from "../../../components/ConfirmDialog.jsx";
import FullScreenPage from "../../../components/FullScreenPage.jsx";
import Icon from "../../../components/Icon.jsx";
import VerifiedSeal from "../../../components/VerifiedSeal.jsx";
import { useCart } from "../../../lib/CartContext.jsx";
import { useMessages } from "../../../lib/MessageContext.jsx";
import { useRatings } from "../../../lib/RatingContext.jsx";
import { stores } from "../../../lib/mockData.js";
import ReviewsSection from "../components/ReviewsSection.jsx";

function Stat({ value, label }) {
  return (
    <div>
      <p className="text-sm font-extrabold text-slate-900">{value}</p>
      <p className="text-[10px] text-slate-500">{label}</p>
    </div>
  );
}

export default function StoreMobile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  // React Router marks the first page of a session with key "default".
  // If the page was opened directly, there is nothing to go back to.
  const goBack = () => (location.key !== "default" ? navigate(-1) : navigate("/marketplace"));
  const { add, buyNow, count } = useCart();
  const { openSeller } = useMessages();
  const { getRating } = useRatings();
  const store = stores.find((s) => String(s.id) === id);
  const [selectedId, setSelectedId] = useState(store?.products[0]?.id);
  const [added, setAdded] = useState(false);
  const [confirm, setConfirm] = useState(null);

  if (!store) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-slate-600">This store doesn't exist.</p>
        <button type="button" onClick={() => navigate("/marketplace")} className="mt-3 text-sm font-semibold text-sky-600">Back to marketplace</button>
      </div>
    );
  }

  const rating = getRating(store.name);
  const selected = store.products.find((p) => p.id === selectedId) ?? store.products[0];
  const toItem = (p) => ({ id: p.id, title: p.title, meta: p.detail, price: p.price });

  function addSelected() {
    add(toItem(selected));
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  function buySelected() {
    const go = () => {
      buyNow(toItem(selected));
      navigate("/checkout");
    };
    if (count > 0) {
      setConfirm({
        title: "Replace your cart?",
        message: `Buy now will replace the ${count} ${count === 1 ? "item" : "items"} in your cart with ${selected.title}.`,
        confirmLabel: "Buy now",
        tone: "primary",
        action: go,
      });
    } else {
      go();
    }
  }

  return (
    <FullScreenPage
      header={
        <div className="flex items-center justify-between px-4 py-3">
          <button type="button" aria-label="Back" onClick={goBack} className="rounded-full p-1.5 text-slate-700">
            <Icon name="arrowLeft" className="h-5 w-5" />
          </button>
          <span className="truncate px-2 text-sm font-bold text-slate-900">{store.name}</span>
          <span className="w-8" />
        </div>
      }
      footer={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => openSeller({ key: `store-${store.id}`, name: store.name, initials: store.initials })}
            className="flex flex-col items-center gap-0.5 px-2 text-[10px] font-semibold text-slate-600"
          >
            <Icon name="chat" className="h-5 w-5" />
            Message
          </button>
          <button
            type="button"
            onClick={addSelected}
            className="flex-1 rounded-full border-[1.5px] border-[#8ACFF8] bg-white py-2.5 text-xs font-bold text-[#0369A1] transition active:scale-95"
          >
            {added ? "Added ✓" : "Add to Cart"}
          </button>
          <button
            type="button"
            onClick={buySelected}
            className="flex-1 rounded-full bg-[#0284C7] py-2.5 text-xs font-bold text-white shadow-sm transition active:scale-95"
          >
            Buy Now
          </button>
        </div>
      }
    >
      <div className="h-32 bg-gradient-to-br from-sky-200 to-sky-300" />

      <div className="px-4 pb-6">
        <div className="-mt-10 flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-sky-100 text-xl font-bold text-sky-700 shadow-sm">
          {store.initials}
        </div>
        <div className="mt-3 flex items-center gap-1.5">
          <h1 className="text-lg font-extrabold leading-tight text-slate-900">{store.name}</h1>
          {store.verified && <VerifiedSeal className="h-4 w-4" />}
        </div>
        <p className="mt-0.5 text-xs font-semibold text-slate-500">{store.category}</p>
        <p className="mt-2 text-xs leading-relaxed text-slate-600">{store.desc}</p>

        <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl border border-slate-200 bg-white p-3 text-center">
          <Stat value={store.products.length} label="Items" />
          <Stat value={rating.avg ? rating.avg.toFixed(1) : "New"} label={`${rating.count} ${rating.count === 1 ? "rating" : "ratings"}`} />
          <Stat value={store.type} label="Seller type" />
        </div>

        <div className="mt-6 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Products</h2>
          <span className="text-xs text-slate-500">{store.products.length} items</span>
        </div>

        <ul className="mt-3 space-y-3">
          {store.products.map((p) => {
            const active = p.id === selected.id;
            return (
              <li key={p.id}>
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSelectedId(p.id)}
                  className={`flex w-full items-center gap-3 rounded-2xl border bg-white p-3 text-left transition ${
                    active ? "border-[#0284C7] ring-1 ring-[#0284C7]" : "border-slate-200"
                  }`}
                >
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
                    <Icon name="book" className="h-6 w-6" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-slate-900">{p.title}</span>
                    <span className="block truncate text-[11px] text-slate-500">{p.detail}</span>
                  </span>
                  <span className="text-sm font-extrabold text-slate-900">₱{p.price.toFixed(2)}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="mt-6">
          <ReviewsSection storeName={store.name} />
        </div>
      </div>

      <ConfirmDialog
        open={!!confirm}
        title={confirm?.title}
        message={confirm?.message}
        confirmLabel={confirm?.confirmLabel}
        tone={confirm?.tone}
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          confirm?.action();
          setConfirm(null);
        }}
      />
    </FullScreenPage>
  );
}
