import { Link, useNavigate, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";

const AdminLayout = () => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.removeItem("userRole");
    navigate("/");
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white p-4">
        <h2 className="text-xl font-bold mb-6">Admin Panel</h2>
        <ul>
          <li className="mb-2">
            <Link to="/admin" className="hover:text-gray-400">Dashboard</Link>
          </li>
          <li className="mb-2">
            <Link to="/admin/inventory" className="hover:text-gray-400">Manage Inventory</Link>
          </li>
          <li className="mb-2">
            <Link to="/admin/users" className="hover:text-gray-400">Manage Users</Link>
          </li>
          <li className="mt-6">
            <Button variant="destructive" onClick={handleLogout}>Logout</Button>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 bg-gray-100">
        <Outlet />  {/* This loads AdminDashboard, ManageInventory, or ManageUsers */}
      </div>
    </div>
  );
};

export default AdminLayout;
