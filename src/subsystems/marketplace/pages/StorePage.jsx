import useIsMobile from "../../../hooks/useIsMobile.js";
import StoreMobile from "./StoreMobile.jsx";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Icon from "../../../components/Icon.jsx";
import Lightbox from "../../../components/Lightbox.jsx";
import ConfirmDialog from "../../../components/ConfirmDialog.jsx";
import ReviewsSection from "../components/ReviewsSection.jsx";
import VerifiedSeal from "../../../components/VerifiedSeal.jsx";
import { galleryFor } from "../../../components/ProductArt.jsx";
import { useCart } from "../../../lib/CartContext.jsx";
import { useMessages } from "../../../lib/MessageContext.jsx";
import { useRatings } from "../../../lib/RatingContext.jsx";
import { stores } from "../../../lib/mockData.js";

// Product flies from its button into the cart icon, then the cart badge pulses.
function flyToCart(fromEl) {
  const cart = document.getElementById("cart-button");
  if (!fromEl || !cart) return;
  const a = fromEl.getBoundingClientRect();
  const b = cart.getBoundingClientRect();
  const dot = document.createElement("div");
  dot.textContent = "+1";
  dot.className = "pointer-events-none fixed z-[60] flex h-9 w-9 items-center justify-center rounded-full bg-[#0284C7] text-xs font-bold text-white shadow-lg";
  dot.style.left = `${a.left + a.width / 2 - 18}px`;
  dot.style.top = `${a.top + a.height / 2 - 18}px`;
  document.body.appendChild(dot);

  const dx = b.left + b.width / 2 - (a.left + a.width / 2);
  const dy = b.top + b.height / 2 - (a.top + a.height / 2);
  const anim = dot.animate(
    [
      { transform: "translate(0, 0) scale(1)", opacity: 1 },
      { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 90}px) scale(1.1)`, opacity: 1, offset: 0.45 },
      { transform: `translate(${dx}px, ${dy}px) scale(0.4)`, opacity: 0.4 },
    ],
    { duration: 750, easing: "cubic-bezier(0.4, 0, 0.2, 1)" }
  );
  anim.onfinish = () => {
    dot.remove();
    cart.animate([{ transform: "scale(1)" }, { transform: "scale(1.25)" }, { transform: "scale(1)" }], { duration: 350 });
  };
}

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
  const { add, buyNow, count } = useCart();
  const { openSeller } = useMessages();
  const { getRating } = useRatings();
  const store = stores.find((s) => String(s.id) === id);
  const [zoomProduct, setZoomProduct] = useState(null);
  const [confirm, setConfirm] = useState(null);

  if (!store) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-slate-600">This store doesn't exist.</p>
        <Link to="/marketplace" className="mt-3 inline-block text-sm font-semibold text-sky-600">Back to marketplace</Link>
      </div>
    );
  }

  const rating = getRating(store.name);

  function toCartItem(p) {
    return { id: p.id, title: p.title, meta: p.detail, price: p.price };
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
              {store.initials}
            </div>
            <div className="pt-3">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold leading-tight tracking-tight text-slate-900">{store.name}</h1>
                <VerifiedSeal className="h-5 w-5" />
              </div>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">{store.desc}</p>
              <span className="mt-2 inline-block rounded-full border border-sky-200 bg-sky-50 px-2.5 py-0.5 text-[11px] font-semibold text-sky-700">{store.type}</span>
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
              onClick={() => openSeller({ key: `store-${store.id}`, name: store.name, initials: store.initials })}
              className="mt-1 rounded-full border-[1.5px] border-[#8ACFF8] bg-white px-4 py-2 text-xs font-semibold text-[#0369A1] transition hover:bg-sky-50 active:scale-95"
            >
              Message seller
            </button>
          </div>
        </div>
      </section>

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-900">Products</h2>
        <span className="text-xs text-slate-500">{store.products.length} items · {store.category}</span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {store.products.map((p) => (
          <div key={p.id} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                aria-label={`View photos of ${p.title}`}
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
                <h3 className="text-sm font-bold leading-snug text-slate-900">{p.title}</h3>
                <p className="mt-0.5 text-[11px] text-slate-500">{p.detail}</p>
                <p className="mt-1 text-sm font-extrabold text-slate-900">₱{p.price.toFixed(2)}</p>
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
                onClick={() => {
                  const go = () => {
                    buyNow(toCartItem(p));
                    navigate("/checkout");
                  };
                  if (count > 0) {
                    setConfirm({ title: "Replace your cart?", message: `Buy now will replace the ${count} ${count === 1 ? "item" : "items"} in your cart with ${p.title}.`, confirmLabel: "Buy now", tone: "primary", action: go });
                  } else {
                    go();
                  }
                }}
                className="rounded-full bg-[#0284C7] px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#0369A1] active:scale-95"
              >
                Buy now
              </button>
            </div>
          </div>
        ))}
      </div>

      <ReviewsSection storeName={store.name} />

      <ConfirmDialog open={!!confirm} title={confirm?.title} message={confirm?.message} confirmLabel={confirm?.confirmLabel} tone={confirm?.tone} onCancel={() => setConfirm(null)} onConfirm={() => { confirm?.action(); setConfirm(null); }} />

      <Lightbox
        key={zoomProduct?.id}
        open={!!zoomProduct}
        onClose={() => setZoomProduct(null)}
        title={zoomProduct?.title}
        images={zoomProduct ? galleryFor(zoomProduct.id) : []}
      />
    </div>
  );
}

export default function StorePage() {
  return useIsMobile() ? <StoreMobile /> : <StoreDesktop />;
}
