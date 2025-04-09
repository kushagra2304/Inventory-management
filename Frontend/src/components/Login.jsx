import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import axios from "axios";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("admin");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Handle Role Switching
  const handleRoleChange = (newRole) => {
    if (newRole) {
      setRole(newRole);
      setError(""); // Clear error when role changes
    }
  };

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); // Reset error message

    try {
      const response = await axios.post(
        "http://localhost:5000/login",
        { email, password, role },
        { withCredentials: true } // Ensure cookies work if using sessions
      );

      // Store user data
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("role", response.data.user.role);

      // Redirect based on role
      navigate(response.data.user.role === "admin" ? "/admin" : "/user");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password!");
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 px-4">
      <Card className="w-full max-w-md p-6 shadow-lg bg-white rounded-lg">
        <CardHeader>
          <CardTitle className="text-center text-xl font-semibold">
            {role === "admin" ? "Admin" : "User"} Login
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Role Toggle */}
          <ToggleGroup type="single" value={role} onValueChange={handleRoleChange} className="mb-4 flex justify-center">
            <ToggleGroupItem value="admin" className="px-4 py-2">Admin</ToggleGroupItem>
            <ToggleGroupItem value="user" className="px-4 py-2">User</ToggleGroupItem>
          </ToggleGroup>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <Input 
              type="email" 
              placeholder="Email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
            <Input 
              type="password" 
              placeholder="Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">Login</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}