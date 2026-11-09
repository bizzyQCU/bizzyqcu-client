import { useEffect, useState } from "react";
import { flyToCart } from "../../../lib/flyToCart.js";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import ConfirmDialog from "../../../components/ConfirmDialog.jsx";
import FullScreenPage from "../../../components/FullScreenPage.jsx";
import Icon from "../../../components/Icon.jsx";
import VerifiedSeal from "../../../components/VerifiedSeal.jsx";
import { useCart } from "../../../lib/CartContext.jsx";
import { useMessages } from "../../../lib/MessageContext.jsx";
import { useRatings } from "../../../lib/RatingContext.jsx";
import ReviewsSection from "../components/ReviewsSection.jsx";
import { getStore } from "../../marketplace/api.js";
import { getErrorMessage } from "../../../lib/api-client.js";

const SELLER_TYPE_LABELS = {
  STUDENT_ENTERPRISE: "Enterprise",
  RECOGNIZED_ORGANIZATION: "Organization",
  INDEPENDENT_SELLER: "Independent Seller",
};

function Stat({ value, label }) {
  return (
    <div>
      <p className="text-sm font-extrabold text-slate-900">{value}</p>
      <p className="text-[10px] text-slate-500">{label}</p>
    </div>
  );
}

export default function MB_StorePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  // React Router marks the first page of a session with key "default".
  const goBack = () => (location.key !== "default" ? navigate(-1) : navigate("/marketplace"));
  const { add, count } = useCart();
  const { openSeller } = useMessages();
  const { getRating } = useRatings();

  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [confirm, setConfirm] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getStore(id)
      .then((data) => {
        const s = data.data;
        setStore(s);
        setSelectedId(s?.products[0]?.id ?? null);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <FullScreenPage
        header={
          <div className="flex items-center px-4 py-3">
            <button type="button" aria-label="Back" onClick={goBack} className="rounded-full p-1.5 text-slate-700">
              <Icon name="arrowLeft" className="h-5 w-5" />
            </button>
          </div>
        }
      >
        <p className="py-20 text-center text-sm text-slate-500">Loading store…</p>
      </FullScreenPage>
    );
  }

  if (error || !store) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-rose-600">{error ?? "This store doesn't exist."}</p>
        <button type="button" onClick={() => navigate("/marketplace")} className="mt-3 text-sm font-semibold text-sky-600">
          Back to marketplace
        </button>
      </div>
    );
  }

  const rating = getRating(store.name);
  const initials = store.name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  const selected = store.products.find((p) => p.id === selectedId) ?? store.products[0];

  function toCartItem(p) {
    return {
      id: p.id,
      title: p.name,
      meta: p.category?.name ?? "",
      price: parseFloat(p.price),
    };
  }

  function addSelected(fromEl) {
    add(toCartItem(selected));
    flyToCart(fromEl, "cart-button-store");
  }

  /**
   * Buy Now — navigates to checkout with product as a single-item order group.
   * Does NOT create an order, does NOT touch the cart.
   */
  function buySelected() {
    if (!selected) return;
    navigate("/checkout", {
      state: {
        items: [
          {
            productId: selected.id,
            storeId: store.id,
            name: selected.name,
            price: parseFloat(selected.price),
            quantity: 1,
          },
        ],
        storeId: store.id,
      },
    });
  }

  return (
    <FullScreenPage
      header={
        <div className="flex items-center justify-between px-4 py-3">
          <button type="button" aria-label="Back" onClick={goBack} className="rounded-full p-1.5 text-slate-700">
            <Icon name="arrowLeft" className="h-5 w-5" />
          </button>
          <span className="truncate px-2 text-sm font-bold text-slate-900">{store.name}</span>
          <button type="button" id="cart-button-store" aria-label="Cart" onClick={() => navigate("/cart")} className="relative rounded-full p-1.5 text-slate-700">
            <Icon name="cart" className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#0284C7] px-1 text-[9px] font-bold text-white ring-2 ring-white">{count}</span>
            )}
          </button>
        </div>
      }
      footer={
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => openSeller({ key: `store-${store.id}`, name: store.name, initials })}
              className="flex flex-col items-center gap-0.5 px-2 text-[10px] font-semibold text-slate-600"
            >
              <Icon name="chat" className="h-5 w-5" />
              Message
            </button>
            <button
              type="button"
              onClick={(e) => addSelected(e.currentTarget)}
              className="flex-1 rounded-full border-[1.5px] border-[#8ACFF8] bg-white py-2.5 text-xs font-bold text-[#0369A1] transition active:scale-95"
            >
              Add to Cart
            </button>
            <button
              type="button"
              onClick={buySelected}
              className="flex-1 rounded-full bg-[#0284C7] py-2.5 text-xs font-bold text-white shadow-sm transition active:scale-95"
            >
              Buy Now
            </button>
          </div>
        </div>
      }
    >
      <div className="h-32 bg-gradient-to-br from-sky-200 to-sky-300" />

      <div className="px-4 pb-6">
        <div className="-mt-10 flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-sky-100 text-xl font-bold text-sky-700 shadow-sm">
          {initials}
        </div>
        <div className="mt-3 flex items-center gap-1.5">
          <h1 className="text-lg font-extrabold leading-tight text-slate-900">{store.name}</h1>
          <VerifiedSeal className="h-4 w-4" />
        </div>
        <p className="mt-0.5 text-xs font-semibold text-slate-500">
          {SELLER_TYPE_LABELS[store.sellerProfile?.sellerType] ?? store.sellerProfile?.sellerType}
        </p>
        <p className="mt-2 text-xs leading-relaxed text-slate-600">{store.description}</p>

        <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl border border-slate-200 bg-white p-3 text-center">
          <Stat value={store.products.length} label="Items" />
          <Stat value={rating.avg ? rating.avg.toFixed(1) : "New"} label={`${rating.count} ${rating.count === 1 ? "rating" : "ratings"}`} />
          <Stat value={SELLER_TYPE_LABELS[store.sellerProfile?.sellerType] ?? "—"} label="Seller type" />
        </div>

        <div className="mt-6 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Products</h2>
          <span className="text-xs text-slate-500">{store.products.length} {store.products.length === 1 ? "item" : "items"}</span>
        </div>

        <ul className="mt-3 space-y-3">
          {store.products.map((p) => {
            const active = p.id === (selected?.id);
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
                    <span className="block truncate text-sm font-bold text-slate-900">{p.name}</span>
                    <span className="block truncate text-[11px] text-slate-500">{p.category?.name ?? ""}</span>
                  </span>
                  <span className="text-sm font-extrabold text-slate-900">₱{Number(p.price).toLocaleString("en-PH")}</span>
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
