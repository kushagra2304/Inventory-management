import React, { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from '@zxing/browser';
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_URL;

const ScanProduct = () => {
  const videoRef = useRef(null);
  const [scannedCode, setScannedCode] = useState(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cart, setCart] = useState([]); // To store added products
  const [totalAmount, setTotalAmount] = useState(0); // Total bill amount

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();

    let stopScanner = null;

    const startScanner = async () => {
      try {
        const resultStream = await codeReader.decodeFromVideoDevice(
          null,
          videoRef.current,
          async (result, error) => {
            if (result) {
              const code = result.getText();
              if (code !== scannedCode) {
                setScannedCode(code);
                setLoading(true);
                setError("");
                try {
                  const res = await axios.get(`${BASE_URL}/api/products/barcode/${code}`);
                  setProduct(res.data);
                } catch (err) {
                  setProduct(null);
                  setError("Product not found in inventory.");
                }
                setLoading(false);
              }
            }
          }
        );

        // Store the stop function to use on cleanup
        stopScanner = () => resultStream.stop();
      } catch (err) {
        console.error("Error initializing ZXing:", err);
        setError("Failed to access camera for scanning.");
      }
    };

    startScanner();

    return () => {
      if (stopScanner) stopScanner();
    };
  }, [scannedCode]);

  // Add product to cart
  const addToCart = () => {
    if (product && product.quantity > 0) {
      const existingProduct = cart.find(item => item.id === product.id);
      if (existingProduct) {
        // If product is already in cart, increase the quantity
        setCart(prevCart =>
          prevCart.map(item =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        );
      } else {
        // If it's a new product, add it to the cart
        setCart(prevCart => [...prevCart, { ...product, quantity: 1 }]);
      }

      // Update the total amount
      setTotalAmount(prevAmount => prevAmount + product.price);
    } else {
      setError("Product out of stock.");
    }
  };

  // Handle the purchase
  const handlePurchase = async () => {
    try {
      const items = cart.map(item => ({
        comp_code: item.comp_code,
        qty: item.quantity
      }));
  
      const response = await axios.post(`${BASE_URL}/api/purchase`, { items });
      
      // Reset cart after successful purchase
      setCart([]);
      setTotalAmount(0);
      alert(response.data.message); // Purchase completed message
    } catch (err) {
      console.error("Error during purchase:", err);
      setError("Failed to complete the purchase.");
    }
  };
  

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">📸 Scan Product</h2>

      <div
        className="w-full h-[300px] rounded-lg border-2 border-dashed border-indigo-400 overflow-hidden"
      >
        <video ref={videoRef} className="w-full h-full object-cover" />
      </div>

      {loading && (
        <div className="flex justify-center items-center text-indigo-600 gap-2">
          <Loader2 className="animate-spin" /> Fetching product details...
        </div>
      )}

      {error && (
        <div className="text-red-500 flex items-center gap-2 text-center justify-center">
          <AlertCircle /> {error}
        </div>
      )}

      {product && (
        <Card className="max-w-md mx-auto border-indigo-300 bg-indigo-50">
          <CardContent className="p-4 space-y-3">
            <h3 className="text-xl font-semibold text-indigo-800">Product Details</h3>
            <p><strong>Code:</strong> {product.comp_code}</p>
            <p><strong>Name:</strong> {product.name}</p>
            <p><strong>Description:</strong> {product.description || "No description"}</p>
            <p><strong>Stock:</strong> {product.quantity}</p>
            <p><strong>Price:</strong> ${product.price}</p>
            <img
              src={product.image || "https://via.placeholder.com/150"}
              alt="Product"
              className="w-full h-40 object-cover rounded-lg border"
            />
            <button
              onClick={addToCart}
              className="mt-4 bg-indigo-600 text-white py-2 px-4 rounded"
            >
              Add to Cart
            </button>
          </CardContent>
        </Card>
      )}

      {cart.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold text-gray-800">Your Cart</h3>
          <ul className="space-y-3">
            {cart.map((item, index) => (
              <li key={index} className="flex justify-between items-center">
                <p>{item.name} x {item.quantity}</p>
                <p>${(item.price * item.quantity).toFixed(2)}</p>
              </li>
            ))}
          </ul>
          <div className="mt-4 text-lg font-semibold">
            Total Amount: ${totalAmount.toFixed(2)}
          </div>
          <button
            onClick={handlePurchase}
            className="mt-4 bg-green-600 text-white py-2 px-4 rounded"
          >
            Buy Now
          </button>
        </div>
      )}
    </div>
  );
};

export default ScanProduct;
