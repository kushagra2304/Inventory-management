import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertTriangle,
  PackageCheck,
  UserCog,
  FileBarChart2,
  Settings,
  Camera,
} from "lucide-react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const BASE_URL = import.meta.env.VITE_API_URL;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState("Hello");
  const [items, setItems] = useState([]);
  const [allProducts, setAllProducts] = useState([]); // 🔧 New state
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  // Fetch low stock items
  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/inventory/low-stock`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
        },
      })
      .then((response) => {
        setItems(response.data.lowStock);
      })
      .catch((error) => {
        console.error("Error fetching low stock items:", error);
      });
  }, []);

  // 🔧 Fetch all products
  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/inventory/all`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
        },
      })
      .then((response) => {
        setAllProducts(response.data.products || []);
      })
      .catch((error) => {
        console.error("Error fetching all products:", error);
      });
  }, []);

  const lowStockItems = items.filter((item) => item.quantity < 10);

  const dashboardItems = [
    {
      title: "Manage Inventory",
      icon: <PackageCheck className="w-6 h-6 text-indigo-600" />,
      description: "Add, edit, and monitor stock levels.",
      path: "/admin/inventory",
    },
    {
      title: "View All Products",
      icon: <PackageCheck className="w-6 h-6 text-green-600" />,
      description: "See a complete list of all inventory products.",
      path: "/admin/products",
    },
    {
      title: "Transactions Log",
      icon: <FileBarChart2 className="w-6 h-6 text-indigo-600" />,
      description: "Track issued/received transaction history.",
      path: "/admin/transactions",
    },
    {
      title: "User Management",
      icon: <UserCog className="w-6 h-6 text-indigo-600" />,
      description: "Assign roles and manage users.",
      path: "/admin/users",
    },
    {
      title: "Reports & Analysis",
      icon: <FileBarChart2 className="w-6 h-6 text-indigo-600" />,
      description: "View past data and generate reports.",
      path: "/admin/reports",
    },
    {
      title: "Forecast & Predictions",
      icon: <Settings className="w-6 h-6 text-indigo-600" />,
      description: "Configure system preferences.",
      path: "/admin/settings",
    },
    {
      title: "Scan Product",
      icon: <Camera className="w-6 h-6 text-indigo-600" />,
      description: "Scan barcodes and fetch product details.",
      path: "/admin/scan",
    },
  ];
  

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="p-6 space-y-10">
      {/* Greeting */}
      <div className="space-y-1">
        <h1 className="text-4xl font-bold text-gray-900 text-center">{greeting}, Admin 👋</h1>
        <p className="text-gray-500 text-center">Here’s a quick summary of your inventory.</p>
      </div>

      {/* Low Stock Section */}
      <div>
  <div className="flex items-center mb-4 space-x-2">
    <AlertTriangle className="text-red-500 w-6 h-6" />
    <h2 className="text-2xl font-semibold text-red-600">Low Stock Alerts</h2>
  </div>

  {lowStockItems.length > 0 ? (
    <div className="space-y-4">
      {lowStockItems.map((item, idx) => {
        const maxStock = 100; // Can be dynamic later
        const percent = Math.min((item.quantity / maxStock) * 100, 100);

        // Bar color logic
        let barColor = "bg-green-500";
        if (percent < 50) barColor = "bg-yellow-500";
        if (percent < 20) barColor = "bg-red-600";

        return (
          <div key={idx}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-red-700">{item.comp_code}</span>
              <span className="text-xs text-gray-600">{item.quantity} in stock</span>
            </div>
            <div className="w-full h-2 bg-red-100 rounded-full">
              <div
                className={`h-2 ${barColor} rounded-full transition-all duration-300`}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  ) : (
    <p className="text-gray-500">All items are sufficiently stocked.</p>
  )}
</div>


      {/* Dashboard Tools */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Dashboard Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardItems.map((item, index) => (
            <Card
              key={index}
              onClick={() => handleNavigation(item.path)}
              className="cursor-pointer bg-white hover:shadow-xl transition rounded-2xl border border-gray-200 p-4 group"
            >
              <CardContent className="flex items-start gap-4">
                <div className="p-2 bg-indigo-100 rounded-full group-hover:bg-indigo-200 transition">
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 group-hover:text-indigo-700">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-500">{item.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
