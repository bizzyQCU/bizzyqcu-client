import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Icon from "../../../components/Icon.jsx";
import ConfirmDialog from "../../../components/ConfirmDialog.jsx";
import { useCart } from "../../../lib/CartContext.jsx";
import { createMultiStoreOrders } from "../api.js";

const options = [
  { id: "room", title: "Room-to-room delivery", note: "Direct handoff right to your campus classroom or lab. Dispatched by Verified QCU Courier.", tag: "Instant", eta: "Estimated arrival: ~15-25 mins" },
  { id: "pickup", title: "Pickup at seller", note: "Meetup at University Library Gate / Gazebo Area. Standard campus daylight hours.", tag: "FREE", place: "Main Library Entrance Desk" },
];

const paymentOptions = [
  { id: "CASH", label: "Cash" },
  { id: "GCASH_PAYMONGO", label: "GCash" },
];

// Formats digits as 9XX XXX XXXX while typing (10 digits max).
function formatPhone(raw) {
  const d = raw.replace(/\D/g, "").slice(0, 10);
  return [d.slice(0, 3), d.slice(3, 6), d.slice(6, 10)].filter(Boolean).join(" ");
}

function PhoneInput({ id, value, onChange, invalid, placeholder }) {
  return (
    <div
      className={`flex overflow-hidden rounded-xl border bg-white shadow-sm focus-within:ring-1 ${
        invalid ? "border-red-500 focus-within:border-red-500 focus-within:ring-red-500" : "border-slate-200 focus-within:border-sky-500 focus-within:ring-sky-500"
      }`}
    >
      <span className="inline-flex items-center border-r border-slate-200 bg-slate-100/50 px-3 text-xs font-medium text-slate-600">+63</span>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(formatPhone(e.target.value))}
        placeholder={placeholder}
        className="min-w-0 flex-1 border-0 bg-transparent px-3 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:ring-0"
      />
      {invalid && <Icon name="alert" className="mr-3 h-4 w-4 self-center text-red-500" />}
    </div>
  );
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { selected: cartItems, selectedCount, remove, selectedTotal } = useCart();
  
  // Use Buy Now items if they exist, otherwise use cart items
  const buyNowItems = location.state?.items;
  const isBuyNow = !!buyNowItems;
  const items = isBuyNow ? buyNowItems : cartItems;
  
  // For Buy Now, track quantities separately
  const [buyNowQuantities, setBuyNowQuantities] = useState(
    isBuyNow ? Object.fromEntries(buyNowItems.map((item) => [item.productId, item.quantity])) : {}
  );
  
  const [delivery, setDelivery] = useState("room");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [collapsed, setCollapsed] = useState(false);
  const [building, setBuilding] = useState("Tech Building / San Bartolome Campus");
  const [room, setRoom] = useState("Room 402, 4th Floor");
  const [phone, setPhone] = useState("917 123 4567");
  const [sms, setSms] = useState("");
  const [notes, setNotes] = useState("");
  const [confirm, setConfirm] = useState(null);
  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState(null);
  const [orderConfirm, setOrderConfirm] = useState(false);

  const smsDigits = sms.replace(/\D/g, "").length;
  const smsIncomplete = smsDigits < 10;

  // Check if any Buy Now item is out of stock or has 0 quantity
  const hasOutOfStockItem = isBuyNow && items.some((item) => item.stockQuantity === 0);
  const hasZeroQuantity = isBuyNow && items.some((item) => (buyNowQuantities[item.productId] || item.quantity) === 0);
  
  // Map delivery radio to API enum
  const deliveryMethodMap = {
    room: "ROOM_TO_ROOM",
    pickup: "PICKUP",
  };
  const apiDeliveryMethod = deliveryMethodMap[delivery];
  
  // For ROOM_TO_ROOM, require building and room
  const buildingEmpty = apiDeliveryMethod === "ROOM_TO_ROOM" && !building.trim();
  const roomEmpty = apiDeliveryMethod === "ROOM_TO_ROOM" && !room.trim();
  
  const canPlaceOrder = isBuyNow && !smsIncomplete && !hasOutOfStockItem && !hasZeroQuantity && !buildingEmpty && !roomEmpty && items.length > 0;

  function updateBuyNowQuantity(productId, newQty) {
    setBuyNowQuantities((prev) => ({
      ...prev,
      [productId]: newQty,
    }));
  }
  
  // Calculate Buy Now totals
  const buyNowCount = Object.values(buyNowQuantities).reduce((sum, qty) => sum + qty, 0);
  const buyNowTotal = buyNowItems ? buyNowItems.reduce((sum, item) => {
    const qty = buyNowQuantities[item.productId] || item.quantity;
    return sum + item.price * qty;
  }, 0) : 0;
  
  // Display values depend on flow
  const displayCount = isBuyNow ? buyNowCount : selectedCount;
  const displayTotal = isBuyNow ? buyNowTotal : selectedTotal;

  async function placeOrder() {
    if (!canPlaceOrder) return;
    
    // Show confirmation modal first
    setOrderConfirm(true);
  }

  async function confirmPlaceOrder() {
    setOrderConfirm(false);
    setPlacing(true);
    setPlaceError(null);

    try {
      const item = items[0];
      const qty = buyNowQuantities[item.productId] || item.quantity;
      
      const orderGroup = {
        storeId: item.storeId,
        deliveryMethod: apiDeliveryMethod,
        paymentMethod,
        items: [
          {
            productId: item.productId,
            quantity: qty,
          },
        ],
      };

      // Add campus fields only for ROOM_TO_ROOM
      if (apiDeliveryMethod === "ROOM_TO_ROOM") {
        orderGroup.campusBuilding = building;
        orderGroup.campusRoomNumber = room;
      }

      const results = await createMultiStoreOrders([orderGroup]);

      // Handle errors first
      if (Object.keys(results.errors).length > 0) {
        const storeId = Object.keys(results.errors)[0];
        setPlaceError(results.errors[storeId].message);
        setPlacing(false);
        return;
      }

      // Handle GCash redirect
      if (results.gcashCheckoutUrls && results.gcashCheckoutUrls.length > 0) {
        window.location.href = results.gcashCheckoutUrls[0].checkoutUrl;
        return;
      }

      // Handle success - navigate to order detail
      if (results.orders && results.orders.length > 0) {
        navigate(`/orders/${results.orders[0].id}`);
      }
    } catch (err) {
      setPlaceError(err.message || "Failed to place order. Please try again.");
      setPlacing(false);
    }
  }

  return (
    <>
      <ConfirmDialog open={!!confirm} title={confirm?.title} message={confirm?.message} confirmLabel={confirm?.confirmLabel} tone={confirm?.tone} onCancel={() => setConfirm(null)} onConfirm={() => { confirm?.action(); setConfirm(null); }} />
      <ConfirmDialog 
        open={orderConfirm} 
        title="Confirm your order?" 
        message={`You're about to place an order for ₱${displayTotal.toFixed(2)}. Please review your delivery details before confirming.`}
        confirmLabel="Confirm & Place Order"
        tone="primary"
        onCancel={() => setOrderConfirm(false)}
        onConfirm={confirmPlaceOrder}
      />
      <div className="mb-4">
        <Link to="/marketplace" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0284C7] transition hover:text-sky-700">
          <Icon name="arrowLeft" className="h-4 w-4" />
          <span>Back to cart</span>
        </Link>
      </div>

      <div className="mx-auto mb-8 flex max-w-xl items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0284C7] text-xs font-bold text-white">1</div>
          <span className="text-xs font-bold text-[#0284C7]">1. Fulfillment</span>
        </div>
        <div className="relative mx-4 h-[2px] w-24 overflow-hidden bg-slate-200 sm:w-32">
          <div className="absolute inset-y-0 left-0 w-1/2 bg-[#0284C7]" />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-300 bg-white text-xs font-medium text-slate-400">2</div>
          <span className="text-xs font-semibold text-slate-400">2. Payment</span>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        <section className="space-y-6 lg:col-span-8">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">How do you want to get your order?</h1>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">Choose your preferred on-campus delivery method</p>
          </div>

          <div role="radiogroup" aria-label="Delivery method" className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {options.map((o) => {
              const selected = delivery === o.id;
              return (
                <button
                  key={o.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setDelivery(o.id)}
                  className={`relative block rounded-2xl p-4 text-left transition hover:shadow-sm ${
                    selected ? "border-2 border-[#0284C7] bg-sky-50/40 shadow-sm" : "border border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`flex h-4 w-4 items-center justify-center rounded-full border-2 ${selected ? "border-[#0284C7]" : "border-slate-300"}`}>
                        {selected && <div className="h-2 w-2 rounded-full bg-[#0284C7]" />}
                      </div>
                      <span className="text-xs font-bold text-slate-900">{o.title}</span>
                    </div>
                    {o.tag === "Instant" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                        <Icon name="bolt2" className="h-2.5 w-2.5" fill />
                        Instant
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600">FREE</span>
                    )}
                  </div>
                  <p className="mt-2.5 pl-6 text-[11px] leading-relaxed text-slate-500">{o.note}</p>
                  <div className="mt-4 flex items-center justify-between border-t border-sky-100/80 pt-3 text-xs font-semibold">
                    {o.eta ? (
                      <div className="flex items-center gap-1.5 text-[11px] text-sky-700">
                        <Icon name="clock" className="h-3.5 w-3.5 text-sky-600" />
                        <span>{o.eta}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                        <Icon name="pin" className="h-3.5 w-3.5 text-slate-400" />
                        <span>{o.place}</span>
                      </div>
                    )}
                    <span className="font-bold text-[#0284C7]">Free</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                <Icon name="wallet" className="h-4 w-4 text-[#0284C7]" />
                <span>Payment Method</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-2">
              {paymentOptions.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPaymentMethod(p.id)}
                  className={`rounded-xl border-2 p-3 text-left text-xs font-semibold transition ${
                    paymentMethod === p.id
                      ? "border-[#0284C7] bg-sky-50 text-[#0284C7]"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                <Icon name="pin" className="h-4 w-4 text-[#0284C7]" />
                <span>Delivery Location &amp; Contact</span>
              </div>
              <span className="text-[11px] font-medium text-slate-400">* Required Campus Fields</span>
            </div>

            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="building" className="mb-1.5 block text-xs font-bold text-slate-700">Campus Building <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select id="building" value={building} onChange={(e) => setBuilding(e.target.value)} className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 pr-8 text-xs font-medium text-slate-800 focus:border-sky-500 focus:ring-sky-500">
                      <option>Tech Building / San Bartolome Campus</option>
                      <option>Main Building / San Bartolome Campus</option>
                      <option>Belmonte Hall / Batasan Campus</option>
                    </select>
                    <Icon name="chevronDown" className="pointer-events-none absolute inset-y-0 right-3 my-auto h-4 w-4 text-slate-400" />
                  </div>
                </div>
                <div>
                  <label htmlFor="room" className="mb-1.5 block text-xs font-bold text-slate-700">Room number / Floor <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input id="room" type="text" value={room} onChange={(e) => setRoom(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 pr-8 text-xs font-medium text-slate-800 focus:border-sky-500 focus:ring-sky-500" />
                    <Icon name="building" className="pointer-events-none absolute inset-y-0 right-3 my-auto h-4 w-4 text-slate-400" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="phone" className="mb-1.5 block text-xs font-bold text-slate-700">Active student phone number <span className="text-red-500">*</span></label>
                  <PhoneInput id="phone" value={phone} onChange={setPhone} placeholder="9XX XXX XXXX" />
                </div>
                <div>
                  <label htmlFor="sms" className="mb-1.5 block text-xs font-bold text-slate-700">Backup SMS line for security <span className="text-red-500">*</span></label>
                  <PhoneInput id="sms" value={sms} onChange={setSms} invalid={isBuyNow && smsIncomplete} placeholder="9XX XXX XXXX" />
                  {isBuyNow && smsIncomplete && (
                    <p className="mt-1 text-[11px] font-medium leading-tight text-red-500">Add a complete backup SMS line to place the order.</p>
                  )}
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label htmlFor="notes" className="text-xs font-bold text-slate-700">Delivery notes <span className="font-normal text-slate-400">(optional)</span></label>
                  <span className="text-[10px] text-slate-400">{notes.length}/120 chars</span>
                </div>
                <textarea id="notes" rows={2} maxLength={120} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Leave with CS Class President at the lab counter" className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-normal text-slate-800 placeholder-slate-400 focus:border-sky-500 focus:ring-sky-500" />
              </div>

              <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-sky-100 bg-sky-50/60 p-3 text-sky-800">
                <Icon name="shield" className="h-4 w-4 flex-shrink-0 text-sky-600" />
                <p className="text-[11px] leading-tight">
                  Couriers will match your Student ID tag <strong className="font-bold text-slate-900">#21-08492</strong> upon room entry to ensure secure handover.
                </p>
              </div>

            </form>
          </div>
        </section>

        <aside className="space-y-4 lg:col-span-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className={`flex items-center justify-between ${collapsed ? "" : "border-b border-slate-100 pb-3.5"}`}>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Order summary</h2>
                <p className="text-[11px] font-medium text-slate-400">({displayCount} items) · ₱{displayTotal.toFixed(2)}</p>
              </div>
              <button type="button" aria-label={collapsed ? "Expand summary" : "Collapse summary"} aria-expanded={!collapsed} onClick={() => setCollapsed((c) => !c)} className="rounded p-1 text-slate-400 transition hover:text-slate-600">
                <Icon name={collapsed ? "chevronDown" : "chevronUp"} className="h-4 w-4" />
              </button>
            </div>

            {!collapsed && (
              <>
                <div className="my-2 divide-y divide-slate-100">
                  {items.length === 0 && <p className="py-4 text-center text-xs text-slate-500">Your cart is empty.</p>}
                  {isBuyNow ? (
                    // Buy Now flow: show quantity stepper
                    items.map((item) => {
                      const isOutOfStock = item.stockQuantity === 0;
                      const maxQty = Math.min(item.stockQuantity || 99, 99);
                      const currentQty = buyNowQuantities[item.productId] || item.quantity;
                      const lineTotal = item.price * currentQty;
                      
                      return (
                        <div key={item.productId} className="flex items-center justify-between gap-3 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-sky-100 bg-sky-50 text-sky-600">
                              <Icon name="tag" className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="text-xs font-bold leading-snug text-slate-800">{item.name}</h3>
                              <p className="text-[10px] text-slate-400">{item.storeName}</p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {isOutOfStock ? (
                              <span className="text-xs font-bold text-rose-600">Out of stock</span>
                            ) : (
                              <>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    disabled={currentQty <= 1}
                                    onClick={() => updateBuyNowQuantity(item.productId, currentQty - 1)}
                                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
                                    aria-label="Decrease quantity"
                                  >
                                    <span className="text-sm font-bold leading-none">−</span>
                                  </button>
                                  <span className="w-6 text-center text-xs font-bold text-slate-800">{currentQty}</span>
                                  <button
                                    type="button"
                                    disabled={currentQty >= maxQty}
                                    onClick={() => updateBuyNowQuantity(item.productId, currentQty + 1)}
                                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
                                    aria-label="Increase quantity"
                                  >
                                    <span className="text-sm font-bold leading-none">+</span>
                                  </button>
                                </div>
                                <span className="text-xs font-bold text-slate-800">₱{lineTotal.toFixed(2)}</span>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    // Cart flow: original code, no stepper
                    cartItems.map((i) => (
                      <div key={i.id} className="flex items-center justify-between gap-3 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-sky-100 bg-sky-50 text-sky-600">
                            <Icon name="tag" className="h-4 w-4" />
                          </div>
                          <div>
                            <h3 className="text-xs font-bold leading-snug text-slate-800">{i.title}</h3>
                            <p className="text-[10px] text-slate-400">{i.meta}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-800">₱{i.price.toFixed(2)}</span>
                          <button type="button" aria-label={`Remove ${i.title}`} onClick={() => setConfirm({ title: "Remove this item?", message: `${i.title} will be removed from your order.`, confirmLabel: "Remove", tone: "danger", action: () => remove(i.id) })} className="rounded p-1 text-slate-300 transition hover:text-rose-500">
                            <Icon name="x" className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="space-y-2 border-t border-slate-100 pt-3 text-xs">
                  <div className="flex justify-between text-slate-500"><span>Items Total</span><span className="font-medium text-slate-700">₱{displayTotal.toFixed(2)}</span></div>
                  <div className="flex justify-between text-slate-500"><span>Campus delivery fee</span><span className="font-medium text-slate-700">Free</span></div>
                </div>
              </>
            )}

            <div className="mt-3 flex items-baseline justify-between border-t border-slate-100 pt-4">
              <div>
                <span className="block text-xs font-bold text-slate-900">Total Amount</span>
                <span className="text-[10px] text-slate-400">Includes all campus fees</span>
              </div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900">₱{displayTotal.toFixed(2)}</span>
            </div>

            {placeError && isBuyNow && (
              <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                <p className="font-semibold">Error placing order:</p>
                <p>{placeError}</p>
              </div>
            )}

            {isBuyNow && (buildingEmpty || roomEmpty) && (
              <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
                <p>Enter your campus building and room to place the order.</p>
              </div>
            )}

            <div className="mt-5">
              {isBuyNow ? (
                <button
                  type="button"
                  onClick={placeOrder}
                  disabled={!canPlaceOrder || placing}
                  className="block w-full rounded-full bg-[#0284C7] px-4 py-3 text-center text-xs font-semibold tracking-wide text-white shadow-sm transition hover:bg-sky-700 hover:shadow active:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {placing ? "Placing order…" : "Place order"}
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    disabled={true}
                    className="block w-full rounded-full bg-slate-300 px-4 py-3 text-center text-xs font-semibold tracking-wide text-slate-600 shadow-sm cursor-not-allowed"
                  >
                    Continue to payment
                  </button>
                  <p className="mt-2 text-center text-[11px] font-medium text-slate-500">Cart checkout is not connected yet.</p>
                </>
              )}
              {items.length === 0 && <Link to="/marketplace" className="mt-2 block text-center text-[11px] font-semibold text-sky-600">Browse the marketplace</Link>}
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
