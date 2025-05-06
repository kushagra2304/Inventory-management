import { Link, useNavigate, Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  Menu,
  X,
  PackageCheck,
  FileBarChart2,
  UserCog,
  Settings,
  Camera,
  LogOut,
} from "lucide-react";

const navLinks = [
  {
    title: "Inventory Management",
    icon: <PackageCheck size={18} />,
    path: "/admin/inventory",
  },
  {
    title: "View All Products",
    icon: <PackageCheck size={18} />,
    path: "/admin/products",
  },
  {
    title: "Transactions Log",
    icon: <FileBarChart2 size={18} />,
    path: "/admin/transactions",
  },
  {
    title: "User Management",
    icon: <UserCog size={18} />,
    path: "/admin/users",
  },
  {
    title: "Reports & Analysis",
    icon: <FileBarChart2 size={18} />,
    path: "/admin/reports",
  },
  {
    title: "Forecast & Predictions",
    icon: <Settings size={18} />,
    path: "/admin/settings",
  },
  {
    title: "Scan Product",
    icon: <Camera size={18} />,
    path: "/admin/scan",
  },
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Toggle Button */}
      {!isOpen && (
        <button
          className="fixed top-4 left-4 z-50 bg-black p-2 rounded"
          onClick={() => setIsOpen(true)}
        >
          <Menu size={24} color="white" />
        </button>
      )}

      {/* Sidebar */}
      {isOpen && (
        <div className="fixed top-0 left-0 h-full w-64 bg-[#010D2A] text-white shadow-lg p-4 z-40 transition-transform duration-300 ease-in-out">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-semibold">Admin Panel</h2>
            <button className="text-white" onClick={() => setIsOpen(false)}>
              <X size={24} />
            </button>
          </div>

          <nav className="flex flex-col space-y-4 text-sm font-medium">
            <Link
              to="/admin"
              onClick={() => setIsOpen(false)}
              className={`group flex items-center gap-2 ${
                location.pathname === "/admin"
                  ? "text-blue-400"
                  : "text-white hover:text-blue-400"
              }`}
            >
              <span>🏠</span>
              <span className="relative inline-block">
                Dashboard
                <span
                  className={`absolute bottom-0 right-0 h-0.5 bg-red-500 transform origin-right transition-transform duration-300 ${
                    location.pathname === "/admin"
                      ? "scale-x-100"
                      : "scale-x-0 group-hover:scale-x-100"
                  } w-full`}
                ></span>
              </span>
            </Link>

            {navLinks.map(({ title, path, icon }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setIsOpen(false)}
                  className={`group flex items-center gap-2 ${
                    isActive ? "text-blue-400" : "text-white hover:text-blue-400"
                  }`}
                >
                  {icon}
                  <span className="relative inline-block">
                    {title}
                    <span
                      className={`absolute bottom-0 right-0 h-0.5 bg-red-500 transform origin-right transition-transform duration-300 ${
                        isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                      } w-full`}
                    ></span>
                  </span>
                </Link>
              );
            })}

            <button
              onClick={() => {
                setIsOpen(false);
                handleLogout();
              }}
              className="group mt-8 flex items-center gap-2 text-red-400 hover:text-red-600"
            >
              <LogOut size={18} />
              <span className="relative inline-block">
                Logout
                <span className="absolute bottom-0 right-0 h-0.5 bg-red-500 transform scale-x-0 origin-right transition-transform duration-300 group-hover:scale-x-100 w-full"></span>
              </span>
            </button>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 p-6 bg-gray-100 w-full overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
