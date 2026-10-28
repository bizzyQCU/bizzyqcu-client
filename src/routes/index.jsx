import { Routes, Route } from 'react-router-dom';
import Layout from '../layouts/Layout.jsx';
import AuthLayout from '../layouts/AuthLayout.jsx';
import {
  LandingPage,
  Login,
  Signup,
  SellerLoginForm,
  SellerSignup,
  EnterpriseSeller,
  IndividualSeller,
  OrganizationSeller,
} from '../subsystems/auth';
import Placeholder from '../components/Placeholder.jsx';

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

      {/* Main App Routes - With Navbar */}
      <Route element={<Layout />}>

        {/* Marketplace Routes (Subsystem 2) - Coming Soon */}
        <Route
          path="/marketplace"
          element={<Placeholder title="Marketplace" text="Browse products and stores." />}
        />
        <Route
          path="/stores/:storeId"
          element={<Placeholder title="Store" text="Store details page." />}
        />
        <Route
          path="/products/:productId"
          element={<Placeholder title="Product" text="Product details page." />}
        />

        {/* Orders Routes (Subsystem 3) - Coming Soon */}
        <Route
          path="/cart"
          element={<Placeholder title="Shopping Cart" text="Your cart items." />}
        />
        <Route
          path="/orders"
          element={<Placeholder title="Orders" text="Your order history." />}
        />
        <Route
          path="/orders/:orderId"
          element={<Placeholder title="Order Details" text="Detailed order view." />}
        />

        {/* Admin Routes (Subsystem 4) - YOUR DASHBOARD */}
        <Route path="/admin" element={<AdminDashboard />} />

        {/* Fallback */}
        <Route
          path="/dashboard"
          element={<Placeholder title="Marketplace Dashboard" text="You're signed in. The marketplace will live here." />}
        />
        <Route
          path="*"
          element={<Placeholder title="Page not found" text="The page you're looking for doesn't exist." />}
        />
      </Route>
    </Routes>
  );
}