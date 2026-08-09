import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import CartDrawer from "./components/cart/CartDrawer";
import Toast from "./components/ui/Toast";
import IntroOverlay from "./components/layout/IntroOverlay";
import AdminLayout from "./components/admin/AdminLayout";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import SkinQuiz from "./pages/SkinQuiz";
import Wishlist from "./pages/Wishlist";
import Account from "./pages/Account";
import Orders from "./pages/Orders";
import Login from "./pages/Login";
import Register from "./pages/Register";
import About from "./pages/About";
import OrderComplete from "./pages/OrderComplete";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminPromos from "./pages/admin/AdminPromos";
import AdminOffers from "./pages/admin/AdminOffers";
import AdminHomepage from "./pages/admin/AdminHomepage";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminContentCards from "./pages/admin/AdminContentCards";
import { useAuthStore } from "./store/authStore";

function StorefrontShell({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-folia-cream text-folia-ink">
      <IntroOverlay />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
      <Toast />
    </div>
  );
}

export default function App() {
  const hydrateUser = useAuthStore((s) => s.hydrateUser);
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  useEffect(() => {
    hydrateUser();
  }, [hydrateUser]);

  if (isAdmin) {
    return (
      <>
        <Routes>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="homepage" element={<AdminHomepage />} />
            <Route path="cards" element={<AdminContentCards />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="promos" element={<AdminPromos />} />
            <Route path="offers" element={<AdminOffers />} />
            <Route path="reviews" element={<AdminReviews />} />
          </Route>
        </Routes>
        <Toast />
      </>
    );
  }

  return (
    <StorefrontShell>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:slug" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/quiz" element={<SkinQuiz />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/account" element={<Account />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about" element={<About />} />
        <Route path="/order-complete" element={<OrderComplete />} />
      </Routes>
    </StorefrontShell>
  );
}
