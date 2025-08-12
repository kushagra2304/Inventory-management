// components/Home.jsx
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 bg-white shadow">
        <h1 className="text-xl font-semibold">SARAS Inventory System</h1>
<Button
  onClick={() => navigate("/login")}
  className="w-20 bg-[#010D2A] hover:bg-blue-950 text-white py-2 rounded-full"
>
  Login
</Button>
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold mb-6">Welcome to SARAS</h2>
        <p className="mb-4 text-lg">
          SARAS is a smart inventory management platform that helps organizations track, manage, and forecast inventory across departments. With features like role-based access, barcode scanning, low-stock alerts, and interactive dashboards, SARAS streamlines stock operations and improves accuracy.

It provides real-time insights, automates key processes, and supports better decision-making—making it ideal for teams seeking efficient and transparent inventory control.
        </p>

        <h3 className="text-2xl font-semibold mt-8 mb-4">Key Functionalities:</h3>
        <ul className="list-disc ml-6 text-lg space-y-2">
          <li>🔍 Barcode Scanning for real-time product lookup</li>
          <li>📦 Role-based dashboards (Admin, User, Stock User)</li>
          <li>📊 Smart Inventory Forecasting</li>
          <li>📉 Transaction logs and analytics</li>
          <li>🔐 Secure login system</li>
          <li>📥 Product issuing & replenishment workflows</li>
          <li>📈 Visual reports and insights for management</li>
        </ul>

        <p className="mt-8 text-lg">
          This system aims to reduce manual effort, improve stock visibility, and streamline the supply chain within any organization.
        </p>
      </main>
    </div>
  );
}
