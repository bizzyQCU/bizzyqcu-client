import useIsMobile from "../../../hooks/useIsMobile.js";
import OrdersDesktop from "./OrdersDesktop.jsx";
import OrdersMobile from "./OrdersMobile.jsx";

export default function OrdersPage() {
  return useIsMobile() ? <OrdersMobile /> : <OrdersDesktop />;
}
