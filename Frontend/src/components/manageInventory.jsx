import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

const BASE_URL = import.meta.env.VITE_API_URL;

const categoryOptions = [
  "Life Style", "Handicrafts", "Textiles", "Food Products", "Traditional Art", "Organic Products",
  "Home Decor", "Sustainable Products", "Eco-friendly Goods", "Jewelry & Accessories",
  "Bamboo & Cane Products", "Pottery & Ceramics", "Spices & Condiments",
  "Herbal Products", "Leather Goods", "Handloom", "Natural Skincare"
];

export default function ManageInventory() {
  const [inventory, setInventory] = useState([]);
  const [compCode, setCompCode] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("");
  const [barcode, setBarcode] = useState("");
  const [category, setCategory] = useState("");
  const [unitType, setUnitType] = useState(""); // Single Unit or Pack
  const [packSize, setPackSize] = useState(""); // For Pack type
  const [weight, setWeight] = useState("");     // Weight per unit
  const [price, setPrice] = useState("");       // Price

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    const response = await fetch(`${BASE_URL}/inventory`);
    const data = await response.json();
    setInventory(data);
  };

  const handleAddItem = async () => {
    if (!compCode || !description || !quantity || !barcode || !category || !unitType || !weight || !price) return;
    if (unitType === "Pack" && !packSize) return;

    const response = await fetch(`${BASE_URL}/inventory`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        comp_code: compCode,
        description,
        quantity,
        barcode,
        category,
        unit_type: unitType,
        weight,
        price,
        pack_size: unitType === "Pack" ? packSize : null,
      }),
    });

    if (response.ok) {
      fetchInventory();
      setCompCode("");
      setDescription("");
      setQuantity("");
      setBarcode("");
      setCategory("");
      setUnitType("");
      setPackSize("");
      setWeight("");
      setPrice("");
    }
  };

  const handleDeleteItem = async (id) => {
    const response = await fetch(`${BASE_URL}/inventory/${id}`, { method: "DELETE" });
    if (response.ok) {
      fetchInventory();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Inventory</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Add Item Section */}
        <div className="grid grid-cols-2 md:grid-cols-10 gap-2 mb-4 items-center">
          <Input placeholder="Component Code" className="text-sm h-9" value={compCode} onChange={(e) => setCompCode(e.target.value)} />
          <Input placeholder="Description" className="text-sm h-9" value={description} onChange={(e) => setDescription(e.target.value)} />
          <Input placeholder="Quantity" type="number" className="text-sm h-9" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          <Input placeholder="Barcode" className="text-sm h-9" value={barcode} onChange={(e) => setBarcode(e.target.value)} />

          <select value={category} onChange={(e) => setCategory(e.target.value)} className="text-sm h-9 px-2 border border-gray-300 rounded-md">
            <option value="">Category</option>
            {categoryOptions.map((option, idx) => (
              <option key={idx} value={option}>{option}</option>
            ))}
          </select>

          <select value={unitType} onChange={(e) => setUnitType(e.target.value)} className="text-sm h-9 px-2 border border-gray-300 rounded-md">
            <option value="">Unit</option>
            <option value="Single Unit">Single</option>
            <option value="Pack">Pack</option>
          </select>

          {/* Conditionally show pack size input */}
          {unitType === "Pack" && (
            <Input placeholder="Pack of how many?" type="number" className="text-sm h-9" value={packSize} onChange={(e) => setPackSize(e.target.value)} />
          )}

          <Input placeholder="Weight (g/kg)" className="text-sm h-9" value={weight} onChange={(e) => setWeight(e.target.value)} />
          <Input placeholder="Price (₹)" type="number" className="text-sm h-9" value={price} onChange={(e) => setPrice(e.target.value)} />

          <Button onClick={handleAddItem} className="text-sm h-9">Add</Button>
        </div>

        {/* Inventory Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Component Code</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Barcode</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Weight</TableHead>
              <TableHead>Price</TableHead>
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
                  <TableCell>{item.barcode}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>
  {item.unit_type === "Pack" ? `Pack (${item.pack_size})` : item.unit_type}
</TableCell>
                  <TableCell>{item.weight}</TableCell>
                  <TableCell>{item.price}</TableCell>
                  <TableCell>{new Date(item.created_at).toLocaleDateString()}</TableCell>

                  <TableCell>
                    <Button variant="destructive" onClick={() => handleDeleteItem(item.id)}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan="10" className="text-center">No items in inventory</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
