import { Link, useNavigate, Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  PackageCheck,
  FileBarChart2,
  UserCog,
  Sun,
  Camera,
  LogOut,
} from "lucide-react";

const navLinks = [
  {
    title: "View Inventory",
    icon: <PackageCheck size={18} />,
    path: "/user/inventory",
  },
  // {
  //   title: "My Products",
  //   icon: <PackageCheck size={18} />,
  //   path: "/user/products",
  // },
  // {
  //   title: "Order History",
  //   icon: <FileBarChart2 size={18} />,
  //   path: "/user/transactions",
  // },
  // {
  //   title: "Account Settings",
  //   icon: <UserCog size={18} />,
  //   path: "/user/settings",
  // },
  // {
  //   title: "Reports",
  //   icon: <FileBarChart2 size={18} />,
  //   path: "/user/reports",
  // },
  // {
  //   title: "Forecast & Predictions",
  //   icon: <Sun size={18} />,
  //   path: "/user/predictions",
  // },
  {
    title: "Scan Products",
    icon: <Camera size={18} />,
    path: "/user/read",
  },
];

const UserLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="fixed top-0 left-0 h-full w-64 bg-[#010D2A] text-white shadow-lg p-4 z-40">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-semibold">User Panel</h2>
        </div>

        <nav className="flex flex-col space-y-4 text-sm font-medium">
          <Link
            to="/user"
            className={`group flex items-center gap-2 ${
              location.pathname === "/user"
                ? "text-blue-400"
                : "text-white hover:text-blue-400"
            }`}
          >
            <span>🏠</span>
            <span className="relative inline-block">
              Dashboard
              <span
                className={`absolute bottom-0 right-0 h-0.5 bg-red-500 transform origin-right transition-transform duration-300 ${
                  location.pathname === "/user"
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
            onClick={handleLogout}
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

      {/* Main Content */}
      <div className="flex-1 p-6 bg-gray-100 w-full overflow-y-auto ml-64">
        <Outlet />
      </div>
    </div>
  );
};

export default UserLayout;
