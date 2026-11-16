import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../../../../lib/CartContext.jsx";

export default function CheckoutSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearCheckedOut } = useCart();

  useEffect(() => {
    // Clear checked-out items from cart upon successful PayMongo payment
    clearCheckedOut();

    const searchParams = new URLSearchParams(location.search);
    const orderNumber = searchParams.get("order");

    navigate(`/payment/confirmed${location.search}`, {
      replace: true,
      state: {
        order: orderNumber ? { orderNumber } : null,
        method: "gcash",
      },
    });
  }, [navigate, location.search, clearCheckedOut]);

  return (
    <div className="flex justify-center py-16">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0284C7] border-t-transparent" />
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
          Confirming your PayMongo payment…
        </p>
      </div>
    </div>
  );
}
