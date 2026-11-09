import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createOrder } from "../api";
import { useAuth } from "../../../hooks";
import { getErrorMessage } from "../../../lib/api-client";

export default function CartPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [deliveryMethod, setDeliveryMethod] = useState("PICKUP");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [pickupInstructions, setPickupInstructions] = useState("Meet at Student Center Lobby");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("bizzyqcu_cart") || "[]");
      setCartItems(saved);
    } catch {
      setCartItems([]);
    }
  }, []);

  const updateQuantity = (productId, delta) => {
    const updated = cartItems
      .map((item) => {
        if (item.productId === productId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      })
      .filter(Boolean);

    setCartItems(updated);
    localStorage.setItem("bizzyqcu_cart", JSON.stringify(updated));
  };

  const removeItem = (productId) => {
    const updated = cartItems.filter((item) => item.productId !== productId);
    setCartItems(updated);
    localStorage.setItem("bizzyqcu_cart", JSON.stringify(updated));
  };

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (cartItems.length === 0) return;

    setError("");
    setSubmitting(true);

    try {
      // Group items by storeId if needed (backend accepts one store per order)
      const primaryStoreId = cartItems[0]?.storeId;
      const orderData = {
        storeId: primaryStoreId,
        deliveryMethod,
        paymentMethod,
        pickupInstructions: deliveryMethod === "PICKUP" ? pickupInstructions : undefined,
        items: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      };

      await createOrder(orderData);
      // Clear cart
      localStorage.removeItem("bizzyqcu_cart");
      setCartItems([]);
      navigate("/orders");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Campus Shopping Cart
          </h1>
          <Link
            to="/marketplace"
            className="text-xs font-bold text-amber-400 hover:underline"
          >
            ← Continue Shopping
          </Link>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm p-4 rounded-xl flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {cartItems.length === 0 ? (
          <div className="bg-[#1E293B] border border-dashed border-slate-700 p-12 rounded-2xl text-center space-y-4">
            <div className="text-4xl">🛒</div>
            <h3 className="text-lg font-bold text-white">Your cart is empty</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              You haven't added any campus items yet. Browse verified merchandise, food, and stationery.
            </p>
            <Link
              to="/marketplace"
              className="inline-block px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-md"
            >
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-3">
              {cartItems.map((item) => (
                <div
                  key={item.productId}
                  className="bg-[#1E293B] border border-slate-700/80 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-lg"
                >
                  <div className="flex items-center gap-3">
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-16 h-16 rounded-xl object-cover bg-[#0B1120] border border-slate-700"
                      />
                    )}
                    <div>
                      <h4 className="text-sm font-bold text-white line-clamp-1">{item.name}</h4>
                      <p className="text-xs text-slate-400">{item.storeName}</p>
                      <span className="text-xs font-extrabold text-amber-400">
                        ₱{item.price.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center bg-[#0B1120] rounded-lg border border-slate-700">
                      <button
                        onClick={() => updateQuantity(item.productId, -1)}
                        className="px-2.5 py-1 text-slate-300 hover:text-white font-bold"
                      >
                        -
                      </button>
                      <span className="px-2 text-xs font-bold text-white font-mono">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, 1)}
                        className="px-2.5 py-1 text-slate-300 hover:text-white font-bold"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.productId)}
                      className="text-slate-500 hover:text-rose-400 text-sm p-1"
                      title="Remove item"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Checkout Summary Card */}
            <div className="bg-[#1E293B] border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-5 h-fit">
              <h3 className="text-base font-bold text-white border-b border-slate-700 pb-3">
                Order Summary
              </h3>

              <div className="space-y-3 text-xs">
                {/* Delivery Options */}
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                    Delivery Option
                  </label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => setDeliveryMethod("PICKUP")}
                      className={`p-2 rounded-lg text-xs font-bold border transition-colors ${
                        deliveryMethod === "PICKUP"
                          ? "bg-amber-400 text-slate-950 border-amber-400"
                          : "bg-[#0B1120] text-slate-300 border-slate-700"
                      }`}
                    >
                      📍 Campus Pickup
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeliveryMethod("ROOM_TO_ROOM")}
                      className={`p-2 rounded-lg text-xs font-bold border transition-colors ${
                        deliveryMethod === "ROOM_TO_ROOM"
                          ? "bg-amber-400 text-slate-950 border-amber-400"
                          : "bg-[#0B1120] text-slate-300 border-slate-700"
                      }`}
                    >
                      🚪 Room Delivery
                    </button>
                  </div>
                </div>

                {/* Payment Option */}
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("CASH")}
                      className={`p-2 rounded-lg text-xs font-bold border transition-colors ${
                        paymentMethod === "CASH"
                          ? "bg-amber-400 text-slate-950 border-amber-400"
                          : "bg-[#0B1120] text-slate-300 border-slate-700"
                      }`}
                    >
                      💵 Cash on Pickup
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("GCASH_PAYMONGO")}
                      className={`p-2 rounded-lg text-xs font-bold border transition-colors ${
                        paymentMethod === "GCASH_PAYMONGO"
                          ? "bg-amber-400 text-slate-950 border-amber-400"
                          : "bg-[#0B1120] text-slate-300 border-slate-700"
                      }`}
                    >
                      💳 PayMongo GCash
                    </button>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-700 space-y-1.5">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal:</span>
                    <span>₱{totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Campus Handling Fee:</span>
                    <span className="text-emerald-400">₱0.00 (Free)</span>
                  </div>
                  <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-slate-700/60">
                    <span>Total Amount:</span>
                    <span className="text-amber-400">₱{totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={submitting}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? "Processing Order..." : "Confirm & Place Order"}
              </button>

              <div className="text-[11px] text-slate-400 text-center">
                Need help before ordering?{" "}
                <Link to="/contact-admin" className="text-amber-400 hover:underline">
                  Contact Campus Admin
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

