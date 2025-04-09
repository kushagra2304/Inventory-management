import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const UserDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {/* Dashboard Overview */}
      <Card 
        className="cursor-pointer hover:shadow-xl transition-shadow" 
        onClick={() => navigate("/dashboard")}
      >
        <CardHeader>
          <h3 className="text-lg font-semibold">📊 Dashboard Overview</h3>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">View overall inventory, recent requests, and status.</p>
        </CardContent>
      </Card>

      {/* View Inventory */}
      <Card 
        className="cursor-pointer hover:shadow-xl transition-shadow" 
        onClick={() => navigate("/user/inventory")}
      >
        <CardHeader>
          <h3 className="text-lg font-semibold">📦 View Inventory</h3>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Browse available products and their stock status.</p>
        </CardContent>
      </Card>

      {/* Request Items */}
      <Card 
        className="cursor-pointer hover:shadow-xl transition-shadow" 
        onClick={() => navigate("/user/requests")}
      >
        <CardHeader>
          <h3 className="text-lg font-semibold">📩 Request Items</h3>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Submit new item requests and track approvals.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDashboard;
