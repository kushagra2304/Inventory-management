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
import Settings from "./components/sections/Settings";
import ScanProduct from "./components/sections/ScanProduct";
import ViewAllProducts from "./components/sections/viewAllProducts";

// User Components
import UserLayout from "./components/UserLayout";
import UserDashboard from "./components/UserDashboard";
import ViewInventory from "./components/ViewInventory";
import UserForecast from "./components/UserForecast";
import UserScan from "./components/UserScan";

// Stock Operator
import StockOperatorLayout from "./components/StockOperatorLayout";
import StockOperatorTransactions from "./components/SOTransactionLog";
import StockScan from "./components/SOScan"; 
import StockInventoryPage from "./components/SOViewInventory"; // ← if you have one
import StockDashboard from "./components/SODashboard"; // ← if you have one
// If not available, use the same ViewInventory/UserScan etc.

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
        <Route path="settings" element={<Settings />} />
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

      {/* Stock Operator Routes */}
      <Route path="/stock/*" element={<StockOperatorLayout />}>
        <Route index element={<StockDashboard />} />  
          <Route path ="inventory" element={<StockInventoryPage />} /> 
        <Route path="transactions" element={<StockOperatorTransactions />} />
        <Route path="scan" element={<StockScan />} />
        {/* Add more routes as needed */}
      </Route>
    </Routes>
  );
}

export default App;
