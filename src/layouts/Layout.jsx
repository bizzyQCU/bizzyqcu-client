import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";

// Scrolls to #hash targets on route change, or to top when there's no hash.
function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }
    window.scrollTo({ top: 0 });
  }, [pathname, hash]);

  return null;
}

export default function Layout() {
  const { pathname } = useLocation();
  const isSellerMessages = pathname === "/seller/messages";
  const isSellerOrders = pathname === "/seller/orders";
  const isSellerAnalytics = pathname === "/seller/analytics";
  const isSellerDashboard = pathname === "/seller/dashboard";
  const isSellerProducts = pathname === "/seller/products";
  const isSellerInventory = pathname === "/seller/inventory";
  const isSellerSettings = pathname === "/seller/settings";

  // Pages that have their own full-page layout (sidebar + internal header)
  // should not render the global Navbar or Footer.
  const hideShell = isSellerMessages || isSellerOrders || isSellerAnalytics || 
                    isSellerDashboard || isSellerProducts || isSellerInventory || isSellerSettings;

  return (
    <div
      className={`min-h-screen flex flex-col ${isSellerMessages ? "bg-[#f1f3f6] text-slate-900" : (isSellerOrders || isSellerAnalytics || isSellerDashboard || isSellerProducts || isSellerInventory || isSellerSettings) ? "bg-[#F8FAFC]" : "text-white"} overflow-x-hidden`}
    >
      <ScrollManager />
      {!hideShell && <Navbar />}
      <Outlet />
      {!hideShell && <Footer />}
    </div>
  );
}
