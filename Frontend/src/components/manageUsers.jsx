import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { toast } from "react-hot-toast";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setFetching(true);
    try {
      const response = await axios.get("http://localhost:5000/admin/users", { withCredentials: true });

      if (!response.data || !Array.isArray(response.data)) {
        throw new Error("Invalid data format");
      }

      setUsers(response.data.map(user => ({
        id: user.id || user._id || Math.random(),
        name: user.name || "Unknown",
        email: user.email || "No Email",
        role: user.role || "user"
      })));
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
      setUsers([]);
    } finally {
      setFetching(false);
    }
  };

  const handleAddUser = async () => {
    if (!name || !email || !password || !role) {
      return toast.error("All fields are required");
    }

    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/auth/add-user", 
        { name, email, password, role }, 
        { withCredentials: true }
      );

      toast.success("User added successfully");
      fetchUsers();
      setName("");
      setEmail("");
      setPassword("");
      setRole("user");
    } catch (error) {
      console.error("Error adding user:", error);
      toast.error(error.response?.data?.message || "Failed to add user");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!userId) return;
    
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await axios.delete(`http://localhost:5000/admin/users/${userId}`, { withCredentials: true });
      toast.success("User deleted successfully");
      fetchUsers(); // Refresh users after deletion
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      await axios.put(`http://localhost:5000/admin/users/${userId}/role`, 
        { role: newRole }, 
        { withCredentials: true }
      );
      toast.success("User role updated successfully");
      fetchUsers();
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Failed to update role");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Users</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4 mb-6">
          <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <select className="border p-2 rounded" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <Button onClick={handleAddUser} disabled={loading}>{loading ? "Adding..." : "Add User"}</Button>
        </div>

        {fetching ? <p className="text-center text-gray-500">Loading users...</p> : null}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length > 0 ? (
              users.map((user) => (
                <TableRow key={user.id || user._id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <select
                      className="border p-2 rounded"
                      value={user.role}
                      onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="destructive"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan="4" className="text-center text-gray-500">No users found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
