import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const BASE_URL = import.meta.env.VITE_API_URL;

const ViewInventory = () => {
  const [products, setProducts] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/inventory`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
        },
      })
      .then((response) => {
        setProducts(response.data.inventory || []);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
      });
  }, []);

  const filteredProducts = products.filter((item) => {
    const search = searchTerm.toLowerCase();
    return (
      item.comp_code?.toLowerCase().includes(search) ||
      item.description?.toLowerCase().includes(search) ||
      item.category?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-3xl font-semibold text-gray-800 text-center">
        All Inventory Products
      </h2>

      <div className="flex justify-center mb-4">
        <input
          type="text"
          placeholder="Search by code, description, or category..."
          className="w-full max-w-md px-4 rounded-full py-2 border border-gray-300"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((item, idx) => (
            <Dialog key={idx}>
              <DialogTrigger asChild>
                <Card
                  className="border bg-white shadow hover:shadow-lg transition rounded-xl cursor-pointer"
                  onClick={() => setSelectedItem(item)}
                >
                  <CardContent className="p-4">
                    <img
                      src={item.image || "https://via.placeholder.com/150"}
                      alt="Item"
                      className="w-full h-48 object-cover rounded-xl border"
                    />
                    <h3 className="text-lg font-semibold text-gray-800 mt-4">
                      {item.description}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Quantity: {item.quantity}
                    </p>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-xl">
                    Product Details
                  </DialogTitle>
                  <DialogDescription>
                    Detailed view of the selected inventory item.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <img
                    src={item.image || "https://via.placeholder.com/150"}
                    alt="Item"
                    className="w-full h-48 object-cover rounded-xl border"
                  />
                  <div className="space-y-1 text-sm text-gray-700">
                    <p>
                      <strong>Code:</strong> {item.comp_code}
                    </p>
                    <p>
                      <strong>Description:</strong>{" "}
                      {item.description || "No description"}
                    </p>
                    <p>
                      <strong>Category:</strong> {item.category || "N/A"}
                    </p>
                    <p>
                      <strong>Unit:</strong> {item.unit_type || "N/A"}
                    </p>
                    <p>
                      <strong>Weight:</strong> {item.weight || "N/A"}
                    </p>
                    <p>
                      <strong>Price:</strong> ₹{item.price || "0.00"}
                    </p>
                    <p>
                      <strong>Total Inventory:</strong> {item.quantity}
                    </p>
                    <p>
                      <strong>Barcode:</strong>{" "}
                      {item.barcode || "Not available"}
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center">No products found.</p>
      )}
    </div>
  );
};

export default ViewInventory;
