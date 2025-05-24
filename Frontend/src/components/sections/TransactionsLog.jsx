import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "react-hot-toast";
const BASE_URL = import.meta.env.VITE_API_URL;

export default function ManageTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [itemCode, setItemCode] = useState(""); // Item Code
  const [quantity, setQuantity] = useState(""); // Quantity
  const [price, setPrice] = useState(""); // Price (new)
  const [transactionType, setTransactionType] = useState("issued"); // Default to 'issued'

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setFetching(true);
    try {
      const response = await axios.get(`${BASE_URL}/inventory/transactions`, { withCredentials: true });

      if (!response.data || !Array.isArray(response.data)) {
        throw new Error("Invalid data format");
      }

      setTransactions(
        response.data.map((txn) => ({
          id: txn.id,
          itemCode: txn.item_code || "Unknown",
          quantity: txn.quantity || "0",
          price: txn.price !== undefined ? parseFloat(txn.price).toFixed(2) : "0.00", // format price
          type: txn.transaction_type || "N/A",
          date: new Date(txn.transaction_date).toLocaleDateString(),

        }))
      );
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Failed to load transactions");
      setTransactions([]);
    } finally {
      setFetching(false);
    }
  };

  const addTransaction = async () => {
    if (!itemCode.trim() || !quantity.trim() || !transactionType || !price.trim()) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      const newTransaction = {
        item_code: itemCode.trim(),
        quantity: parseInt(quantity, 10),
        transaction_type: transactionType,
        price: parseFloat(price),
      };

      await axios.post(`${BASE_URL}/inventory/transaction`, newTransaction, { withCredentials: true });

      toast.success("Transaction added successfully");
      setItemCode("");
      setQuantity("");
      setPrice(""); // reset price
      setTransactionType("issued");
      fetchTransactions();
    } catch (error) {
      console.error("Error adding transaction:", error);
      toast.error("Failed to add transaction");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory Transaction Logs</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Add Transaction Section */}
        <div className="flex gap-4 mb-4 flex-wrap">
          <Input
            placeholder="Item Code"
            value={itemCode}
            onChange={(e) => setItemCode(e.target.value)}
          />
          <Input
            placeholder="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            type="number"
            min="1"
          />
          <Input
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            type="number"
            min="0"
            step="0.01"
          />

          <Select value={transactionType} onValueChange={(value) => setTransactionType(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="issued">Issued</SelectItem>
              <SelectItem value="received">Received</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={addTransaction}>Add Transaction</Button>
        </div>

        {/* Loading indicator */}
        {fetching && <p className="text-center text-gray-500">Loading transactions...</p>}

        {/* Transactions Table */}
       <Table>
  <TableHeader>
    <TableRow>
      <TableHead>Item Code</TableHead>
      <TableHead>Quantity</TableHead>
      <TableHead>Price</TableHead>
      <TableHead>Type</TableHead>
      <TableHead>Date</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {transactions.length > 0 ? (
      transactions.map((txn) => (
        <TableRow key={txn.id}>
          <TableCell>{txn.itemCode}</TableCell>
          <TableCell>{txn.quantity}</TableCell>
          <TableCell>Rs.{txn.price}</TableCell>
          <TableCell className={txn.type === "issued" ? "text-red-500" : "text-green-500"}>
            {txn.type}
          </TableCell>
          <TableCell>{txn.date}</TableCell>
        </TableRow>
      ))
    ) : (
      <TableRow>
        <TableCell colSpan="5" className="text-center text-gray-500">
          No transactions found
        </TableCell>
      </TableRow>
    )}
  </TableBody>
</Table>

      </CardContent>
    </Card>
  );
}
