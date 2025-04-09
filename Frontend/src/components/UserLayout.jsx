import { Outlet, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

const UserLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    navigate("/");
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white p-4">
        <h2 className="text-xl font-bold mb-6">User Panel</h2>
        <ul>
          <li className="mb-2">
            <Link to="/user" className="hover:text-indigo-400">
              Dashboard
            </Link>
          </li>
          <li className="mb-2">
            <Link to="/user/inventory" className="hover:text-indigo-400">
              View Inventory
            </Link>
          </li>
          <li className="mb-2">
            <Link to="/user/requests" className="hover:text-indigo-400">
              Request Items
            </Link>
          </li>
          <li className="mt-6">
            <Button variant="destructive" onClick={handleLogout}>
              Logout
            </Button>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 bg-gray-100">
        <Card>
          <CardHeader>
            <h1 className="text-2xl font-bold">User Dashboard</h1>
          </CardHeader>
          <CardContent>
            <Outlet />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserLayout;
