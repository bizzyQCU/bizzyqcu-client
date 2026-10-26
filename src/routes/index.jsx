import { Routes, Route } from 'react-router-dom';
import Layout from '../layouts/Layout.jsx';
import AuthLayout from '../layouts/AuthLayout.jsx';
import {
  LandingPage,
  Login,
  SellerAuth,
  SellerRegister,
} from '../subsystems/auth';
import Placeholder from '../components/Placeholder.jsx';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Auth Routes (Subsystem 1) - No Navbar */}
      <Route element={<AuthLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/seller-register" element={<SellerRegister />} />
        <Route path="/seller-auth" element={<SellerAuth />} />
        <Route
          path="/seller-signup"
          element={<Placeholder title="Seller Sign Up" text="The seller registration form will live here." />}
        />
        <Route
          path="/signup"
          element={<Placeholder title="Create an Account" text="The student sign-up form will live here." />}
        />
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

        {/* Admin Routes (Subsystem 4) - Coming Soon */}
        <Route
          path="/admin"
          element={<Placeholder title="Admin Dashboard" text="Platform administration." />}
        />

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
