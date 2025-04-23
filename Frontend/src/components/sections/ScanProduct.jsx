import React, { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from '@zxing/browser';
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";
const BASE_URL = import.meta.env.VITE_API_URL;

const ScanProduct = () => {
  const videoRef = useRef(null);
  const [scannedCode, setScannedCode] = useState(null);
  const [cart, setCart] = useState([]);  // Holds the cart items
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
                  const product = res.data;

                  // Add the scanned product to the cart
                  setCart((prevCart) => {
                    const updatedCart = [...prevCart, { ...product, qty: 1 }];
                    return updatedCart;
                  });
                } catch (err) {
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

  // Handle Buy Now button click
  const handleBuyNow = async () => {
    if (cart.length === 0) {
      setError("Your cart is empty!");
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}/api/purchase`, { items: cart });
      if (res.data.message === "Purchase completed successfully!") {
        // Clear the cart after successful purchase
        setCart([]);
        alert("Purchase completed successfully!");
      }
    } catch (err) {
      setError("An error occurred while completing the purchase.");
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

      {/* Cart Section */}
      <div className="space-y-4">
        {cart.length > 0 ? (
          <Card className="max-w-md mx-auto border-indigo-300 bg-indigo-50">
            <CardContent className="p-4 space-y-3">
              <h3 className="text-xl font-semibold text-indigo-800">Your Cart</h3>
              <ul className="space-y-2">
                {cart.map((item, index) => (
                  <li key={index} className="flex justify-between">
                    <span>{item.name}</span>
                    <span>Qty: {item.qty}</span>
                  </li>
                ))}
              </ul>
              <button
                className="w-full bg-indigo-600 text-white py-2 rounded-lg mt-4"
                onClick={handleBuyNow}
              >
                Buy Now
              </button>
            </CardContent>
          </Card>
        ) : (
          <div className="text-gray-500 text-center">Your cart is empty</div>
        )}
      </div>
    </div>
  );
};

export default ScanProduct;
