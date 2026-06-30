import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

// Public
import Landing from "./pages/Landing";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import StoreDetail from "./pages/StoreDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RoleSelect from "./pages/RoleSelect";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

// Seller
import SellerDashboard from "./pages/seller/SellerDashboard";
import SellerStore from "./pages/seller/SellerStore";
import SellerProducts from "./pages/seller/SellerProducts";
import SellerOrders from "./pages/seller/SellerOrders";
import SellerReport from "./pages/seller/SellerReport";

// Buyer
import BuyerDashboard from "./pages/buyer/BuyerDashboard";
import Wallet from "./pages/buyer/Wallet";
import Addresses from "./pages/buyer/Addresses";
import Cart from "./pages/buyer/Cart";
import Checkout from "./pages/buyer/Checkout";
import Orders from "./pages/buyer/Orders";
import OrderDetail from "./pages/buyer/OrderDetail";
import BuyerReport from "./pages/buyer/BuyerReport";

// Driver
import DriverDashboard from "./pages/driver/DriverDashboard";
import DriverJobs from "./pages/driver/DriverJobs";
import JobDetail from "./pages/driver/JobDetail";

// Admin
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminDiscounts from "./pages/admin/AdminDiscounts";
import AdminOverdue from "./pages/admin/AdminOverdue";

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              {/* Public */}
              <Route path="/" element={<Landing />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/store/:id" element={<StoreDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Authenticated (any role) */}
              <Route path="/select-role" element={<RoleSelect />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              {/* Seller */}
              <Route path="/seller" element={<ProtectedRoute roles={["seller"]}><SellerDashboard /></ProtectedRoute>} />
              <Route path="/seller/store" element={<ProtectedRoute roles={["seller"]}><SellerStore /></ProtectedRoute>} />
              <Route path="/seller/products" element={<ProtectedRoute roles={["seller"]}><SellerProducts /></ProtectedRoute>} />
              <Route path="/seller/orders" element={<ProtectedRoute roles={["seller"]}><SellerOrders /></ProtectedRoute>} />
              <Route path="/seller/report" element={<ProtectedRoute roles={["seller"]}><SellerReport /></ProtectedRoute>} />

              {/* Buyer */}
              <Route path="/buyer" element={<ProtectedRoute roles={["buyer"]}><BuyerDashboard /></ProtectedRoute>} />
              <Route path="/buyer/wallet" element={<ProtectedRoute roles={["buyer"]}><Wallet /></ProtectedRoute>} />
              <Route path="/buyer/addresses" element={<ProtectedRoute roles={["buyer"]}><Addresses /></ProtectedRoute>} />
              <Route path="/buyer/cart" element={<ProtectedRoute roles={["buyer"]}><Cart /></ProtectedRoute>} />
              <Route path="/buyer/checkout" element={<ProtectedRoute roles={["buyer"]}><Checkout /></ProtectedRoute>} />
              <Route path="/buyer/orders" element={<ProtectedRoute roles={["buyer"]}><Orders /></ProtectedRoute>} />
              <Route path="/buyer/orders/:id" element={<ProtectedRoute roles={["buyer"]}><OrderDetail /></ProtectedRoute>} />
              <Route path="/buyer/report" element={<ProtectedRoute roles={["buyer"]}><BuyerReport /></ProtectedRoute>} />

              {/* Driver */}
              <Route path="/driver" element={<ProtectedRoute roles={["driver"]}><DriverDashboard /></ProtectedRoute>} />
              <Route path="/driver/jobs" element={<ProtectedRoute roles={["driver"]}><DriverJobs /></ProtectedRoute>} />
              <Route path="/driver/jobs/:id" element={<ProtectedRoute roles={["driver"]}><JobDetail /></ProtectedRoute>} />

              {/* Admin */}
              <Route path="/admin" element={<ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/discounts" element={<ProtectedRoute roles={["admin"]}><AdminDiscounts /></ProtectedRoute>} />
              <Route path="/admin/overdue" element={<ProtectedRoute roles={["admin"]}><AdminOverdue /></ProtectedRoute>} />

              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
