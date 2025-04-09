import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertTriangle,
  PackageCheck,
  UserCog,
  FileBarChart2,
  Settings,
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

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState("Hello");
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

  // Set time-based greeting
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/inventory/low-stock", {
        withCredentials: true, // for sending cookies with JWT
      })
      .then((response) => {
        setItems(response.data.lowStock);
      })
      .catch((error) => {
        console.error("Error fetching low stock items:", error);
      });
  }, []);

  // Filter items with quantity < 10
  const lowStockItems = items.filter((item) => item.quantity < 10);

  const dashboardItems = [
    {
      title: "Inventory Management",
      icon: <PackageCheck className="w-6 h-6 text-indigo-600" />,
      description: "Add, edit, and monitor stock levels.",
      path: "/admin/inventory",
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
      title: "Settings & Permissions",
      icon: <Settings className="w-6 h-6 text-indigo-600" />,
      description: "Configure system preferences.",
      path: "/admin/settings",
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
        <div className="flex items-center mb-4 space-x-2 ">
          <AlertTriangle className="text-red-500 w-6 h-6" />
          <h2 className="text-2xl font-semibold text-red-600 ">Low Stock Alerts</h2>
        </div>
        {lowStockItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {lowStockItems.map((item, idx) => (
              <Dialog key={idx}>
                <DialogTrigger asChild>
                  <Card
                    className="border border-red-200 bg-red-50 shadow-sm hover:shadow-md transition rounded-xl cursor-pointer"
                    onClick={() => setSelectedItem(item)}
                  >
                    <CardContent className="p-4">
                      <h3 className="text-lg font-semibold text-red-700">{item.comp_code}</h3>
                      <p className="text-sm text-red-500">Only {item.quantity} left in stock</p>
                    </CardContent>
                  </Card>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-xl">Item Details</DialogTitle>
                    <DialogDescription>Detailed view of the selected inventory item.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <img
                      src={item.image || "https://via.placeholder.com/150"}
                      alt="Item"
                      className="w-full h-48 object-cover rounded-xl border"
                    />
                    <div>
                      <p><strong>Code:</strong> {item.comp_code}</p>
                      <p><strong>Description:</strong> {item.description || "No description"}</p>
                      <p><strong>Quantity:</strong> {item.quantity}</p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            ))}
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
