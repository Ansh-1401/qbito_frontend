import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import MenuPage from "./pages/MenuPage";
import CartPage from "./pages/CartPage";
import OrderSuccess from "./pages/OrderSuccess";
import OrderTracking from "./pages/OrderTracking";
import LoginPage from "./pages/LoginPage";
import QrGenerator from "./pages/QrGenerator";
import MyOrders from "./pages/MyOrders";

// Auth
import ProtectedRoute from "./components/ProtectedRoute";

// Restaurant Admin
import AdminLayout from "./admin/AdminLayout";
import AdminDashboard from "./admin/AdminDashboard";
import LiveOrdersAdmin from "./admin/LiveOrdersAdmin";
import RestaurantPanel from "./admin/RestaurantPanel";

// Super Admin
import SuperAdminLayout from "./superadmin/SuperAdminLayout";
import SuperAdminDashboard from "./superadmin/SuperAdminDashboard";
import ManageRestaurants from "./superadmin/ManageRestaurants";
import ManageUsers from "./superadmin/ManageUsers";
import AllOrders from "./superadmin/AllOrders";

export default function App() {
  return (
    <Routes>
      {/* Public: Customer */}
      <Route path="/" element={<HomePage />} />
      <Route path="/restro/:slug" element={<MenuPage />} />
      <Route path="/restro/:slug/table/:tableNo" element={<MenuPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/order-tracking" element={<OrderTracking />} />
      <Route path="/order-success" element={<OrderSuccess />} />

      {/* Login */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected: Customer */}
      <Route
        path="/my-orders"
        element={
          <ProtectedRoute role="CUSTOMER">
            <MyOrders />
          </ProtectedRoute>
        }
      />

      {/* Protected: Restaurant Admin */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="RESTAURANT_ADMIN">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="orders" element={<LiveOrdersAdmin />} />
        <Route path="restaurants" element={<RestaurantPanel />} />
        <Route path="qr" element={<QrGenerator />} />
      </Route>

      {/* Protected: Super Admin */}
      <Route
        path="/super-admin"
        element={
          <ProtectedRoute role="SUPER_ADMIN">
            <SuperAdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<SuperAdminDashboard />} />
        <Route path="restaurants" element={<ManageRestaurants />} />
        <Route path="users" element={<ManageUsers />} />
        <Route path="orders" element={<AllOrders />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
