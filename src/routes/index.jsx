import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../layouts/Layout.jsx';
import AuthLayout from '../layouts/AuthLayout.jsx';
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
} from '../subsystems/auth';
import Placeholder from '../components/Placeholder.jsx';

// Subsystem 3: Orders, cart, checkout, payment, messages
import CartPage from '../subsystems/orders/pages/Cart/CartPage.jsx';
import CheckoutPage from '../subsystems/orders/pages/Cart/CheckoutPage.jsx';
import PaymentPage from '../subsystems/orders/pages/Cart/PaymentPage.jsx';
import PaymentPendingPage from '../subsystems/orders/pages/Cart/PaymentPendingPage.jsx';
import PaymentConfirmedPage from '../subsystems/orders/pages/Cart/PaymentConfirmedPage.jsx';
import PaymentFailedPage from '../subsystems/orders/pages/Cart/PaymentFailedPage.jsx';
import OrdersPage from '../subsystems/orders/pages/OrderPage/OrdersPage.jsx';
import OrderDetailPage from '../subsystems/orders/pages/OrderPage/OrderDetailPage.jsx';
import MessagesPage from '../subsystems/orders/pages/Messages/MessagesPage.jsx';
import OrdersLayout from '../subsystems/orders/OrdersLayout.jsx';
import MarketPage from '../subsystems/orders/pages/MarketPage/MarketPage.jsx';
import StorePage from '../subsystems/orders/pages/MarketPage/StorePage.jsx';
import ProfilePage from '../subsystems/auth/pages/ProfilePage.jsx';
import NotificationsPage from '../subsystems/orders/pages/Messages/NotificationsPage.jsx';

// Import your new Admin Dashboard
import AdminDashboard from '../subsystems/admin/pages/AdminDashboard.jsx';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Auth Routes (Subsystem 1) - No Navbar */}
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

        {/* Seller Signup Portal Chooser & Type-Specific Registration Pages */}
        <Route path="/seller-signup" element={<SellerSignup />} />
        <Route path="/seller-register" element={<SellerSignup />} />
        <Route path="/seller-signup/enterprise" element={<EnterpriseSeller />} />
        <Route path="/seller-signup/individual" element={<IndividualSeller />} />
        <Route path="/seller-signup/organization" element={<OrganizationSeller />} />
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

      {/* Main App Routes - With Navbar */}
      <Route element={<Layout />}>
        <Route
          path="/products/:productId"
          element={<Placeholder title="Product" text="Product details page." />}
        />


        {/* Admin Routes (Subsystem 4) - YOUR DASHBOARD */}
        <Route path="/admin" element={<AdminDashboard />} />

        {/* Fallback */}
        <Route
          path="*"
          element={<Placeholder title="Page not found" text="The page you're looking for doesn't exist." />}
        />
      </Route>
    </Routes>
  );
}