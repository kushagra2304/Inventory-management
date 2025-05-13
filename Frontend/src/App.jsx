import { Routes, Route } from "react-router-dom";
import LoginPage from "./components/Login";
import Dashboard from "./components/Dashboard";

// Admin Components
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./components/AdminDashboard";
import ManageInventory from "./components/manageInventory";
import ManageUsers from "./components/manageUsers";
import TransactionsLog from "./components/sections/TransactionsLog";
import Reports from "./components/sections/Reports";
import Settings from "./components/sections/Settings"; // ✅ Correctly importing Settings.jsx now
import ScanProduct from "./components/sections/ScanProduct";
import ViewAllProducts from "./components/sections/viewAllProducts";

// User Components
import UserLayout from "./components/UserLayout";
import UserDashboard from "./components/UserDashboard";
import ViewInventory from "./components/ViewInventory";
import UserForecast from "./components/UserForecast";
import UserScan from "./components/UserScan";

function App() {
  return (
    <Routes>
      {/* Login Route */}
      <Route path="/" element={<LoginPage />} />

      {/* General Dashboard Route */}
      <Route path="/dashboard" element={<Dashboard />} />

      {/* Admin Routes */}
      <Route path="/admin/*" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="inventory" element={<ManageInventory />} />
        <Route path="users" element={<ManageUsers />} />
        <Route path="transactions" element={<TransactionsLog />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} /> {/* ✅ Settings page */}
        <Route path="scan" element={<ScanProduct />} />
        <Route path="products" element={<ViewAllProducts />} />
      </Route>

      {/* User Routes */}
      <Route path="/user/*" element={<UserLayout />}>
        <Route index element={<UserDashboard />} />
        <Route path="inventory" element={<ViewInventory />} />
        <Route path="predictions" element={<UserForecast />} />
        <Route path="read" element={<UserScan />} />
      </Route>
    </Routes>
  );
}

export default App;
