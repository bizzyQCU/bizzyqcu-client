import useIsMobile from "../../../hooks/useIsMobile.js";
import MB_StorePage from "./MB_StorePage.jsx";
import { useEffect, useState } from "react";
import { flyToCart } from "../../../lib/flyToCart.js";
import { Link, useNavigate, useParams } from "react-router-dom";
import Icon from "../../../components/Icon.jsx";
import Lightbox from "../components/MarketPage/Lightbox.jsx";
import ConfirmDialog from "../components/Dialogs/ConfirmDialog.jsx";
import ReviewsSection from "../components/ReviewsSection.jsx";
import VerifiedSeal from "../../../components/VerifiedSeal.jsx";
import { galleryFor } from "../components/MarketPage/ProductArt.jsx";
import { useCart } from "../../../lib/CartContext.jsx";
import { useMessages } from "../../../lib/MessageContext.jsx";
import { useRatings } from "../../../lib/RatingContext.jsx";
import { getStore } from "../../marketplace/api.js";
import { getErrorMessage } from "../../../lib/api-client.js";

const SELLER_TYPE_LABELS = {
  STUDENT_ENTERPRISE: "Enterprise",
  RECOGNIZED_ORGANIZATION: "Organization",
  INDEPENDENT_SELLER: "Independent Seller",
};

function Stars({ value, size = "h-3.5 w-3.5" }) {
  return (
    <span className="inline-flex text-[#FFD444]" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((n) => (
        <Icon key={n} name="star" fill className={`${size} ${value >= n - 0.25 ? "" : "text-slate-200"}`} />
      ))}
    </span>
  );
}

function StoreDesktop() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { add } = useCart();
  const { openSeller } = useMessages();
  const { getRating } = useRatings();

  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [zoomProduct, setZoomProduct] = useState(null);
  const [confirm, setConfirm] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getStore(id)
      .then((data) => setStore(data.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <p className="py-20 text-center text-sm text-slate-500">Loading store…</p>;
  }

  if (error) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-rose-600">{error}</p>
        <Link to="/marketplace" className="mt-3 inline-block text-sm font-semibold text-sky-600">Back to marketplace</Link>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-slate-600">This store doesn't exist.</p>
        <Link to="/marketplace" className="mt-3 inline-block text-sm font-semibold text-sky-600">Back to marketplace</Link>
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

  /** Add to cart — uses the local CartContext; does not create an order. */
  function toCartItem(p) {
    return {
      id: p.id,
      title: p.name,
      meta: p.category?.name ?? "",
      price: parseFloat(p.price),
    };
  }

  /**
   * Buy Now — navigates to checkout with product as a single-item order group.
   * Does NOT create an order, does NOT touch the cart.
   */
  function handleBuyNow(p) {
    navigate("/checkout", {
      state: {
        items: [
          {
            productId: p.id,
            storeId: store.id,
            storeName: store.name,
            name: p.name,
            price: parseFloat(p.price),
            quantity: 1,
            stockQuantity: p.stockQuantity,
          },
        ],
        storeId: store.id,
      },
    });
  }

  return (
    <div className="space-y-6">
      <Link to="/marketplace" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0284C7] hover:text-sky-700">
        <Icon name="arrowLeft" className="h-4 w-4" />
        Back to marketplace
      </Link>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="h-48 rounded-t-2xl bg-sky-400 sm:h-56" />
        <div className="flex flex-wrap items-start justify-between gap-4 px-6 pb-6">
          <div className="flex items-start gap-5">
            <div className="-mt-10 flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 border-white bg-sky-100 text-xl font-bold text-sky-700 shadow-sm">
              {initials}
            </div>
            <div className="pt-3">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold leading-tight tracking-tight text-slate-900">{store.name}</h1>
                <VerifiedSeal className="h-5 w-5" />
              </div>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">{store.description}</p>
              <span className="mt-2 inline-block rounded-full border border-sky-200 bg-sky-50 px-2.5 py-0.5 text-[11px] font-semibold text-sky-700">
                {SELLER_TYPE_LABELS[store.sellerProfile?.sellerType] ?? store.sellerProfile?.sellerType}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 pt-4">
            <div className="flex items-center gap-2">
              <Stars value={rating.avg ?? 0} />
              <span className="text-sm font-extrabold text-slate-900">{rating.avg ? rating.avg.toFixed(1) : "New"}</span>
              <span className="text-[11px] text-slate-500">({rating.count} {rating.count === 1 ? "rating" : "ratings"})</span>
            </div>
            <button
              type="button"
              onClick={() => openSeller({ key: `store-${store.id}`, name: store.name, initials })}
              className="mt-1 rounded-full border-[1.5px] border-[#8ACFF8] bg-white px-4 py-2 text-xs font-semibold text-[#0369A1] transition hover:bg-sky-50 active:scale-95"
            >
              Message seller
            </button>
          </div>
        </div>
      </section>

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-900">Products</h2>
        <span className="text-xs text-slate-500">
          {store.products.length} {store.products.length === 1 ? "item" : "items"}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {store.products.map((p) => (
          <div key={p.id} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                aria-label={`View photos of ${p.name}`}
                onClick={() => setZoomProduct(p)}
                className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-sky-100 bg-sky-50 transition hover:scale-105 hover:shadow-md active:scale-95"
              >
                <svg viewBox="0 0 120 90" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden="true">
                  <rect width="120" height="90" fill="#BFD9FF" />
                  <circle cx="80" cy="26" r="14" fill="#fff" opacity=".9" />
                  <path d="M0 60Q26 38 52 56T120 48V90H0Z" fill="#A9C9F7" />
                  <path d="M0 82Q40 68 80 80T120 76V90H0Z" fill="#5A92E4" />
                </svg>
              </button>
              <div className="min-w-0">
                <h3 className="text-sm font-bold leading-snug text-slate-900">{p.name}</h3>
                <p className="mt-0.5 text-[11px] text-slate-500">{p.category?.name ?? ""}</p>
                <p className="mt-1 text-sm font-extrabold text-slate-900">₱{Number(p.price).toLocaleString("en-PH")}</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  add(toCartItem(p));
                  flyToCart(e.currentTarget);
                }}
                className="rounded-full border-[1.5px] border-[#8ACFF8] bg-white px-3.5 py-2 text-xs font-semibold text-[#0369A1] transition hover:bg-sky-50 active:scale-95"
              >
                Add to cart
              </button>
              <button
                type="button"
                onClick={() => handleBuyNow(p)}
                className="rounded-full bg-[#0284C7] px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#0369A1] active:scale-95"
              >
                Buy now
              </button>
            </div>
          </div>
        ))}
      </div>

      <ReviewsSection storeName={store.name} />

      <ConfirmDialog
        open={!!confirm}
        title={confirm?.title}
        message={confirm?.message}
        confirmLabel={confirm?.confirmLabel}
        tone={confirm?.tone}
        onCancel={() => setConfirm(null)}
        onConfirm={() => { confirm?.action(); setConfirm(null); }}
      />

      <Lightbox
        key={zoomProduct?.id}
        open={!!zoomProduct}
        onClose={() => setZoomProduct(null)}
        title={zoomProduct?.name}
        images={zoomProduct ? galleryFor(zoomProduct.id) : []}
      />
    </div>
  );
}

export default function StorePage() {
  return useIsMobile() ? <MB_StorePage /> : <StoreDesktop />;
}
