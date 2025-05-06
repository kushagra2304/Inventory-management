import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
const BASE_URL = import.meta.env.VITE_API_URL;

export default function ManageInventory() {
  const [inventory, setInventory] = useState([]);
  const [compCode, setCompCode] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("");
  const [barcode, setBarcode] = useState("");  // New state for barcode
  const [category, setCategory] = useState(""); // New state for category

  // Fetch inventory from backend
  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    const response = await fetch(`${BASE_URL}/inventory`);
    const data = await response.json();
    setInventory(data);
  };

  // Handle adding items
  const handleAddItem = async () => {
    if (!compCode || !description || !quantity || !barcode || !category) return;

    const response = await fetch(`${BASE_URL}/inventory`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comp_code: compCode, description, quantity, barcode, category }),
    });

    if (response.ok) {
      fetchInventory(); // Refresh inventory after adding
      setCompCode("");
      setDescription("");
      setQuantity("");
      setBarcode("");  // Clear barcode input
      setCategory("");  // Clear category input
    }
  };

  // Handle deleting items
  const handleDeleteItem = async (id) => {
    const response = await fetch(`${BASE_URL}/inventory/${id}`, { method: "DELETE" });

    if (response.ok) {
      fetchInventory(); // Refresh inventory after deleting
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Inventory</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Add Item Section */}
        <div className="flex space-x-4 mb-4">
          <Input placeholder="Component Code" value={compCode} onChange={(e) => setCompCode(e.target.value)} />
          <Input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <Input placeholder="Quantity" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          <Input placeholder="Barcode" value={barcode} onChange={(e) => setBarcode(e.target.value)} /> {/* Barcode input */}
          <Input placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} /> {/* Category input */}
          <Button onClick={handleAddItem}>Add Item</Button>
        </div>

        {/* Inventory Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Component Code</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Barcode</TableHead> {/* New column for Barcode */}
              <TableHead>Category</TableHead> {/* New column for Category */}
              <TableHead>Created At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventory.length > 0 ? (
              inventory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.comp_code}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.barcode}</TableCell> {/* Display Barcode */}
                  <TableCell>{item.category}</TableCell> {/* Display Category */}
                  <TableCell>{new Date(item.created_at).toLocaleString()}</TableCell>
                  <TableCell>
                    <Button variant="destructive" onClick={() => handleDeleteItem(item.id)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan="7" className="text-center">
                  No items in inventory
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
