import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "react-hot-toast";

export default function ManageTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [itemCode, setItemCode] = useState(""); // Item Code
  const [quantity, setQuantity] = useState(""); // Quantity
  const [transactionType, setTransactionType] = useState("issued"); // Default to 'issued'

  // Fetch transactions on component mount
  useEffect(() => {
    fetchTransactions();
  }, []);

  const BASE_URL = process.env.REACT_APP_API_URL;


  // Function to fetch transaction logs
  const fetchTransactions = async () => {
    setFetching(true);
    try {
      const response = await axios.get(`${BASE_URL}/inventory/transactions`, { withCredentials: true });

      if (!response.data || !Array.isArray(response.data)) {
        throw new Error("Invalid data format");
      }

      // Map transaction data
      setTransactions(
        response.data.map((txn) => ({
          id: txn.id,
          itemCode: txn.item_code || "Unknown",
          quantity: txn.quantity || "0",
          type: txn.transaction_type || "N/A",
          date: new Date(txn.transaction_date).toLocaleString(), // Convert date to readable format
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

  // Function to add new transaction
  const addTransaction = async () => {
    if (!itemCode.trim() || !quantity.trim() || !transactionType) {
      toast.error("Please fill all fields");
      return;
    }
  
    try {
      const newTransaction = { 
        item_code: itemCode.trim(), 
        quantity: parseInt(quantity, 10), // Ensure it's a number
        transaction_type: transactionType 
      };
      
      await axios.post(`${BASE_URL}/inventory/transaction`, newTransaction, { withCredentials: true });
      
      toast.success("Transaction added successfully");
      setItemCode(""); // Reset fields
      setQuantity("");
      setTransactionType("issued");
      fetchTransactions(); // Refresh list
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
                  <TableCell className={txn.type === "issued" ? "text-red-500" : "text-green-500"}>{txn.type}</TableCell>
                  <TableCell>{txn.date}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan="4" className="text-center text-gray-500">
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
