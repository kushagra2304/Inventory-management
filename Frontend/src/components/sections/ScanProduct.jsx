import React, { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from '@zxing/browser';
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_URL;

const ScanProduct = () => {
  const videoRef = useRef(null);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [manualCode, setManualCode] = useState("");

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
              if (code) {
                fetchProduct(code);
              }
            }
          }
        );
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
  }, []);

  const fetchProduct = async (code) => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${BASE_URL}/api/products/barcode/${code}`);
      const product = res.data;
  
      console.log("Fetched product:", product);
  
      if (!product || !product.description || product.quantity === undefined) {
        throw new Error("Invalid product data.");
      }
  
      setCart((prevCart) => {
        const existingIndex = prevCart.findIndex((item) => item.comp_code === product.comp_code);
        if (existingIndex !== -1) {
          const updatedCart = [...prevCart];
          updatedCart[existingIndex].qty += 1;
          return updatedCart;
        }
        return [...prevCart, { ...product, qty: 1 }];
      });
      
    } catch (err) {
      console.error("Fetch error:", err);
      setError(`Product not found or invalid. Details: ${err.message}`);
    }
    setLoading(false);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualCode.trim()) {
      fetchProduct(manualCode.trim());
      setManualCode("");
    }
  };

  const handleBuyNow = async () => {
    if (cart.length === 0) {
      setError("Your cart is empty!");
      return;
    }
  
    try {
      const payload = {
        items: cart.map(item => ({
          comp_code: item.comp_code,
          qty: item.qty
        }))
      };
  
      console.log("Sending purchase payload:", payload);
  
      const res = await axios.post(`${BASE_URL}/api/purchase`, payload);
  
      if (res.data.message === "Purchase completed successfully!") {
        setCart([]);
        alert("Purchase completed successfully!");
      }
    } catch (err) {
      console.error("Purchase error:", err);
      setError("An error occurred while completing the purchase.");
    }
  };
  
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">📸 Scan Product</h2>

      <div className="w-full h-[300px] rounded-lg border-2 border-dashed border-indigo-400 overflow-hidden">
        <video ref={videoRef} className="w-full h-full object-cover" />
      </div>

      <form onSubmit={handleManualSubmit} className="flex gap-2 items-center justify-center">
        <input
          type="text"
          placeholder="Enter barcode manually"
          className="border p-2 rounded-lg w-64"
          value={manualCode}
          onChange={(e) => setManualCode(e.target.value)}
        />
        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg">
          Add
        </button>
      </form>

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

      <div className="space-y-4">
        {cart.length > 0 ? (
          <Card className="max-w-2xl mx-auto border-indigo-300 bg-indigo-50">
            <CardContent className="p-4 space-y-3">
              <h3 className="text-xl font-semibold text-indigo-800">Your Cart</h3>
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="text-indigo-600 border-b border-indigo-200">
                    <th className="p-2">Product</th>
                    <th className="p-2">Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item, index) => (
                    <tr key={index}>
                      <td className="p-2">{item.description}</td>
                      <td className="p-2">{item.qty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

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
