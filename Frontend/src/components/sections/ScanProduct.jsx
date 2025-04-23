import React, { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from '@zxing/browser';
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_URL;

const ScanProduct = () => {
  const videoRef = useRef(null);
  const [scannedCode, setScannedCode] = useState(null);
  const [cart, setCart] = useState([]);
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
                setTimeout(() => setScannedCode(null), 3000);
                setError("");
                try {
                  const res = await axios.get(`${BASE_URL}/api/products/barcode/${code}`);
                  const scannedProduct = res.data;

                  setCart((prevCart) => {
                    const existing = prevCart.find(p => p.comp_code === scannedProduct.comp_code);
                    if (existing) {
                      return prevCart.map(p =>
                        p.comp_code === scannedProduct.comp_code
                          ? { ...p, qty: p.qty + 1 }
                          : p
                      );
                    } else {
                      return [...prevCart, { ...scannedProduct, qty: 1 }];
                    }
                  });
                } catch (err) {
                  setError("Product not found in inventory.");
                }
                setLoading(false);
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
  }, [scannedCode]);

  const handleBuyNow = async () => {
    try {
      await axios.post(`${BASE_URL}/api/purchase`, { items: cart });
      alert("✅ Purchase successful!");
      setCart([]);
      setScannedCode(null);
    } catch (err) {
      console.error(err);
      alert("❌ Failed to complete purchase.");
    }
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.qty * item.price, 0);

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">📸 Scan Product</h2>

      <div className="w-full h-[300px] rounded-lg border-2 border-dashed border-indigo-400 overflow-hidden">
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

      {cart.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-2xl font-semibold text-center text-green-700">🧺 Bucket List</h3>
          {cart.map((item) => (
            <Card key={item.comp_code} className="border-indigo-200 bg-white">
              <CardContent className="p-4">
                <p><strong>{item.name}</strong> × {item.qty}</p>
                <p>₹{item.price} each — Subtotal: ₹{item.qty * item.price}</p>
              </CardContent>
            </Card>
          ))}

          <h4 className="text-xl text-right font-bold text-indigo-800">
            Grand Total: ₹{totalAmount}
          </h4>

          <button
            onClick={handleBuyNow}
            className="w-full mt-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            🛒 Buy Now
          </button>
        </div>
      )}
    </div>
  );
};

export default ScanProduct;
