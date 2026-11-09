import { Routes, Route, Link } from 'react-router-dom';
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

// Admin Subsystem Pages
import AdminDashboard from '../subsystems/admin/pages/AdminDashboard.jsx';
import AdminLogin from '../subsystems/admin/pages/AdminLogin.jsx';
import ContactAdmin from '../subsystems/admin/pages/ContactAdmin.jsx';

// Marketplace & Orders Pages
import Marketplace from '../subsystems/marketplace/pages/Marketplace.jsx';
import OrdersPage from '../subsystems/orders/pages/OrdersPage.jsx';
import CartPage from '../subsystems/orders/pages/CartPage.jsx';

function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center text-slate-900">
      <div className="bg-white rounded-3xl max-w-md p-10 shadow-xl space-y-4">
        <div className="text-4xl">🔍</div>
        <h1 className="text-2xl font-black text-slate-900">Page Not Found</h1>
        <p className="text-sm text-slate-500">
          The page or product you are looking for does not exist or may have been moved.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            to="/marketplace"
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-colors shadow-md"
          >
            Go to Marketplace
          </Link>
          <Link
            to="/contact-admin"
            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
          >
            Contact Admin
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Hidden / Standalone Admin Portal Routes (No Public Navbar) */}
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Auth Routes (No Navbar) */}
      <Route element={<AuthLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Seller Login Forms */}
        <Route path="/seller-login-form" element={<SellerLoginForm />} />
        <Route path="/seller-login" element={<SellerLoginForm />} />
        <Route path="/seller-auth" element={<SellerLoginForm />} />

        {/* Seller Signup Portals */}
        <Route path="/seller-signup" element={<SellerSignup />} />
        <Route path="/seller-register" element={<SellerSignup />} />
        <Route path="/seller-signup/enterprise" element={<EnterpriseSeller />} />
        <Route path="/seller-signup/individual" element={<IndividualSeller />} />
        <Route path="/seller-signup/organization" element={<OrganizationSeller />} />
      </Route>

      {/* Main Student & Customer App Routes (With Navbar & Layout) */}
      <Route element={<Layout />}>
        {/* Marketplace Routes */}
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/dashboard" element={<Marketplace />} />
        <Route path="/stores/:storeId" element={<Marketplace />} />
        <Route path="/products/:productId" element={<Marketplace />} />

        {/* Cart & Orders Routes */}
        <Route path="/cart" element={<CartPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/orders/:orderId" element={<OrdersPage />} />

        {/* Customer Contact Admin & Support Ticket Resolution Desk */}
        <Route path="/contact-admin" element={<ContactAdmin />} />
        <Route path="/support" element={<ContactAdmin />} />
        <Route path="/complaints" element={<ContactAdmin />} />

        {/* Fallback 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
