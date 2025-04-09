import { Routes, Route } from "react-router-dom";
import LoginPage from "./components/Login";
import Dashboard from "./components/Dashboard";

// Admin Components
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./components/AdminDashboard";
import ManageInventory from "./components/ManageInventory";
import ManageUsers from "./components/ManageUsers";
import TransactionsLog from "./components/sections/TransactionsLog";
import Reports from "./components/sections/Reports";
import Settings from "./components/sections/Settings";

// User Components
import UserLayout from "./components/UserLayout";
import UserDashboard from "./components/UserDashboard";
import ViewInventory from "./components/ViewInventory";
import RequestItems from "./components/RequestItems";

function App() {
  return (
    <Routes>
      {/* Login Route */}
      <Route path="/" element={<LoginPage />} />
      
      {/* General Dashboard Route */}
      <Route path="/dashboard" element={<Dashboard />} />

      {/* Admin Routes (Wrapped in AdminLayout) */}
      <Route path="/admin/*" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="inventory" element={<ManageInventory />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="transactions" element={<TransactionsLog />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      {/* User Routes (Wrapped in UserLayout) */}
      <Route path="/user/*" element={<UserLayout />}>
  <Route index element={<UserDashboard />} />
  <Route path="inventory" element={<ViewInventory />} />
  <Route path="requests" element={<RequestItems />} />
</Route>

    </Routes>
  );
}

export default App;
