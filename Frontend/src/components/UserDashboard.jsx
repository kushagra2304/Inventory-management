import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertTriangle,
  PackageCheck,
  UserCog,
  FileBarChart2,
  Sun,
  Camera,
} from "lucide-react";
import axios from "axios";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer, Label} from "recharts";

const BASE_URL = import.meta.env.VITE_API_URL;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState("Hello");
  const [items, setItems] = useState([]);
  const [allProducts, setAllProducts] = useState([]);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

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

  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/inventory-pie`, {
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
    // {
    //   title: "Manage Inventory",
    //   icon: <PackageCheck className="w-6 h-6 text-indigo-600" />,
    //   description: "Add, edit, and monitor stock levels.",
    //   path: "/admin/inventory",
    // },
    {
      title: "View Inventory",
      icon: <PackageCheck className="w-6 h-6 text-indigo-600" />,
      description: "See a complete list of all inventory products.",
      path: "/user/inventory",
    },
    // {
    //   title: "Transactions Log",
    //   icon: <FileBarChart2 className="w-6 h-6 text-indigo-600" />,
    //   description: "Track issued/received transaction history.",
    //   path: "/admin/transactions",
    // },
    // 
    {
      title: "Forecast & Predictions",
      icon: <Sun className="w-6 h-6 text-indigo-600" />,
      description: "View inventory trends and predict future stock requirements.",
      path: "/user/predictions",
    },
    {
      title: "Scan Product",
      icon: <Camera className="w-6 h-6 text-indigo-600" />,
      description: "Scan barcodes, fetch product details, and purchase.",
      path: "/user/read",
    },
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };


    const pieData = allProducts
  .filter((item) => item.quantity > 0)
  .map((item) => ({
    name: item.comp_code,
    value: item.quantity,
  }));

const totalQuantity = pieData.reduce((sum, item) => sum + item.value, 0);

const COLORS = [
  "#bfdbfe", // light blue (blue-200)
  "#93c5fd", // blue-300
  "#60a5fa", // blue-400
  "#3b82f6", // blue-500
  "#2563eb", // blue-600
  "#1d4ed8", // blue-700
  "#1e40af", // blue-800
  "#1e3a8a", // blue-900
  "#172554", // very dark blue
];


  return (
    <div className="p-6 space-y-10 bg-gray-50 min-h-screen">
      {/* Greeting */}
      <div className="space-y-1 text-center">
        <h1 className="text-4xl font-bold text-blue-900 relative inline-block after:block after:h-1 after:bg-red-600 after:w-full after:mt-1">{greeting}, User 👋</h1>
        <p className="text-gray-500">Here’s a quick summary of your inventory.</p>
      </div>

      {/* Low Stock & Pie Chart Section */}
      <div className="flex flex-col md:flex-row justify-between gap-6">
        {/* Low Stock */}
        <div className="w-full md:w-1/2 bg-white rounded-2xl p-6 shadow-md">
          <div className="flex items-center mb-4 space-x-2">
            <AlertTriangle className="text-red-500 w-6 h-6" />
            <h2 className="text-2xl font-semibold text-red-600">Low Stock Alerts</h2>
          </div>

          {lowStockItems.length > 0 ? (
            <div className="space-y-4">
              {lowStockItems.map((item, idx) => {
                const maxStock = 100;
                const percent = Math.min((item.quantity / maxStock) * 100, 100);
                let barColor = "bg-green-500";
                if (percent < 50) barColor = "bg-yellow-500";
                if (percent < 20) barColor = "bg-red-600";

                return (
                  <div key={idx}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-red-700">
                        {item.comp_code}
                      </span>
                      <span className="text-xs text-gray-600">
                        {item.quantity} left
                      </span>
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

        {/* Pie Chart */}
        <div className="w-full md:w-1/2 bg-white rounded-2xl p-6 shadow-md">
                <h2 className="text-2xl font-semibold text-blue-900 mb-4">
                  Product Quantity Distribution
                </h2>
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                    <Pie
        dataKey="value"
        data={pieData}
        cx="50%"
        cy="50%"
        innerRadius={60}
        outerRadius={100}
        paddingAngle={3}
      >
        {pieData.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
        {/* Custom Center Label */}
        <Label
          position="center"
          content={({ viewBox }) => {
            const { cx, cy } = viewBox;
            return (
              <>
                <text
                  x={cx}
                  y={cy - 10}
                  textAnchor="middle"
                  fill="#1f2937"
                  fontSize="16"
                  fontWeight="bold"
                >
                  {totalQuantity}
                </text>
                <text
                  x={cx}
                  y={cy + 10}
                  textAnchor="middle"
                  fill="#6b7280"
                  fontSize="12"
                >
                  Items in Stock
                </text>
              </>
            );
          }}
        />
      </Pie>
                <Tooltip />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500">No product data available.</p>
          )}
        </div>
      </div>

      {/* Dashboard Tools */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Dashboard Tools
        </h2>
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
