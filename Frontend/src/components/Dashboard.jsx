import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminDashboard from "./AdminDashboard";
import UserDashboard from "./UserDashboard";

const Dashboard = () => {
  const [role, setRole] = useState(""); 
  const navigate = useNavigate();

  useEffect(() => {
    const storedRole = localStorage.getItem("userRole"); 
    if (!storedRole) {
      navigate("/"); 
    } else {
      setRole(storedRole);
    }
  }, [navigate]);
  if (!role) return <p>Loading...</p>;
  return role === "admin" ? <AdminDashboard /> : <UserDashboard />;
};

export default Dashboard;
