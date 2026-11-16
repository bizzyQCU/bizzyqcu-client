import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "../layouts/Layout.jsx";
import AuthLayout from "../layouts/AuthLayout.jsx";
import {
  LandingPage,
  Login,
  Signup,
  AccountSecurity,
  RequireAuth,
  SellerLoginForm,
  SellerSignup,
  EnterpriseSeller,
  IndividualSeller,
  OrganizationSeller,
} from "../subsystems/auth";
import Placeholder from "../components/Placeholder.jsx";
import SellerPlaceholder from "../subsystems/marketplace/organization/components/SellerPlaceholder.jsx";
import SellerMessages from "../subsystems/marketplace/organization/components/messages/SellerMessages.jsx";
import SellerOrders from "../subsystems/marketplace/organization/pages/Orders.jsx";

// Subsystem 3: Orders, cart, checkout, payment, messages
import CartPage from "../subsystems/orders/pages/Cart/CartPage.jsx";
import CheckoutPage from "../subsystems/orders/pages/Cart/CheckoutPage.jsx";
import PaymentPage from "../subsystems/orders/pages/Cart/PaymentPage.jsx";
import PaymentPendingPage from "../subsystems/orders/pages/Cart/PaymentPendingPage.jsx";
import PaymentConfirmedPage from "../subsystems/orders/pages/Cart/PaymentConfirmedPage.jsx";
import PaymentFailedPage from "../subsystems/orders/pages/Cart/PaymentFailedPage.jsx";
import OrdersPage from "../subsystems/orders/pages/OrderPage/OrdersPage.jsx";
import OrderDetailPage from "../subsystems/orders/pages/OrderPage/OrderDetailPage.jsx";
import MessagesPage from "../subsystems/orders/pages/Messages/MessagesPage.jsx";
import OrdersLayout from "../subsystems/orders/OrdersLayout.jsx";
import MarketPage from "../subsystems/orders/pages/MarketPage/MarketPage.jsx";
import StorePage from "../subsystems/orders/pages/MarketPage/StorePage.jsx";
import ProfilePage from "../subsystems/auth/pages/ProfilePage.jsx";
import NotificationsPage from "../subsystems/orders/pages/Messages/NotificationsPage.jsx";

// Organization seller portal pages
import OrgDashboard from "../subsystems/marketplace/organization/pages/Dashboard.jsx";
import OrgProducts from "../subsystems/marketplace/organization/pages/Products.jsx";
import OrgInventory from "../subsystems/marketplace/organization/pages/Inventory.jsx";
import OrgAnalytics from "../subsystems/marketplace/organization/pages/Analytics.jsx";
import OrgMessages from "../subsystems/marketplace/organization/pages/Messages.jsx";
import OrgSettings from "../subsystems/marketplace/organization/pages/Settings.jsx";

// Import Admin Dashboard
import AdminDashboard from "../subsystems/admin/pages/AdminDashboard.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Auth Routes - No Navbar */}
      <Route element={<AuthLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/account"
          element={
            <RequireAuth>
              <AccountSecurity />
            </RequireAuth>
          }
        />

        {/* Seller Login Form */}
        <Route path="/seller-login-form" element={<SellerLoginForm />} />
        <Route path="/seller-login" element={<SellerLoginForm />} />
        <Route path="/seller-auth" element={<SellerLoginForm />} />

        {/* Seller Signup Portal and Registration Pages */}
        <Route path="/seller-signup" element={<SellerSignup />} />
        <Route path="/seller-register" element={<SellerSignup />} />
        <Route
          path="/seller-signup/enterprise"
          element={<EnterpriseSeller />}
        />
        <Route
          path="/seller-signup/individual"
          element={<IndividualSeller />}
        />
        <Route
          path="/seller-signup/organization"
          element={<OrganizationSeller />}
        />
      </Route>

      {/* Subsystem 3: Orders, cart, checkout, payment, messages (prototype shell) */}
      <Route element={<OrdersLayout />}>
        <Route path="/marketplace" element={<MarketPage />} />
        <Route path="/stores/:id" element={<StorePage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/payment/pending" element={<PaymentPendingPage />} />
        <Route path="/payment/confirmed" element={<PaymentConfirmedPage />} />
        <Route path="/payment/failed" element={<PaymentFailedPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/orders/:id" element={<OrderDetailPage />} />
        <Route path="/messages" element={<MessagesPage />} />
      </Route>

      {/* Redirect legacy /dashboard route to buyer Marketplace (OrdersLayout) */}
      <Route path="/dashboard" element={<Navigate to="/marketplace" replace />} />

      {/* Seller Portal Routes - No Global Navbar */}
      <Route path="/seller/messages" element={<SellerMessages />} />
      <Route path="/seller/orders" element={<SellerOrders />} />

      {/* Organization Seller Portal Routes */}
      <Route path="/seller/org/dashboard" element={<OrgDashboard />} />
      <Route path="/seller/org/products" element={<OrgProducts />} />
      <Route path="/seller/org/inventory" element={<OrgInventory />} />
      <Route path="/seller/org/orders" element={<SellerOrders />} />
      <Route path="/seller/org/analytics" element={<OrgAnalytics />} />
      <Route path="/seller/org/messages" element={<OrgMessages />} />
      <Route path="/seller/org/settings" element={<OrgSettings />} />

      {/* Main App Routes */}
      <Route element={<Layout />}>
        {/* Seller Routes */}
        <Route
          path="/seller/dashboard"
          element={
            <SellerPlaceholder
              title="Seller Dashboard"
              text="Dashboard overview coming soon."
            />
          }
        />
        <Route
          path="/seller/products"
          element={
            <SellerPlaceholder
              title="Products"
              text="Product management coming soon."
            />
          }
        />
        <Route
          path="/seller/inventory"
          element={
            <SellerPlaceholder
              title="Inventory"
              text="Inventory management coming soon."
            />
          }
        />
        <Route
          path="/seller/settings"
          element={
            <SellerPlaceholder
              title="Settings"
              text="Account settings coming soon."
            />
          }
        />
        <Route path="/seller/analytics" element={<OrgAnalytics />} />

        {/* Product Detail Route */}
        <Route
          path="/products/:productId"
          element={<Placeholder title="Product" text="Product details page." />}
        />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboard />} />

        {/* Fallback */}
        <Route
          path="*"
          element={
            <Placeholder
              title="Page not found"
              text="The page you're looking for doesn't exist."
            />
          }
        />
      </Route>
    </Routes>
  );
}
