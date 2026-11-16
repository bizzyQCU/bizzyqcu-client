import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function CheckoutCancelPage() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const orderNumber = searchParams.get("order");

    navigate(`/payment/failed${location.search}`, {
      replace: true,
      state: {
        order: orderNumber ? { orderNumber } : null,
        method: "gcash",
      },
    });
  }, [navigate, location.search]);

  return (
    <div className="flex justify-center py-16">
      <div className="flex flex-col items-center gap-3">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
          Redirecting to payment status…
        </p>
      </div>
    </div>
  );
}
