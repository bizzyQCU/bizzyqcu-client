import useIsMobile from "../../../../hooks/useIsMobile.js";
import OrdersDesktop from "./OrdersDesktop.jsx";
import MB_OrdersPage from "../MobileUI/MB_OrdersPage.jsx";

export default function OrdersPage() {
  return useIsMobile() ? <MB_OrdersPage /> : <OrdersDesktop />;
}
