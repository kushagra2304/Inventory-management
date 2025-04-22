import React, { useEffect, useRef, useState } from "react";
import Quagga from "@ericblade/quagga2"; // Barcode scanning library
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";

const ScanProduct = () => {
  const scannerRef = useRef(null);
  const [scannedCode, setScannedCode] = useState(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Start the scanner
  useEffect(() => {
    Quagga.init({
      inputStream: {
        name: "Live",
        type: "LiveStream",
        target: scannerRef.current,
        constraints: {
          facingMode: "environment",
        },
      },
      decoder: {
        readers: ["code_128_reader"],
      },
    }, (err) => {
      if (err) {
        console.error("Error initializing Quagga:", err);
        return;
      }
      Quagga.start();
    });

    // Handle barcode detection
    Quagga.onDetected(handleDetected);

    return () => {
      Quagga.stop();
      Quagga.offDetected(handleDetected);
    };
  }, []);

  Quagga.onDetected(function(result) {
    console.log('Detected barcode:', result.codeResult.code);  // Check what Quagga is reading
    // Send the barcode data to the backend
  });
  
  const handleDetected = async (data) => {
    const code = data.codeResult.code;
    if (code !== scannedCode) {
      setScannedCode(code);
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(`http://localhost:5000/api/products/barcode/${code}`);
        setProduct(res.data);
      } catch (err) {
        setProduct(null);
        setError("Product not found in inventory.");
      }
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">📸 Scan Product</h2>

      <div
        ref={scannerRef}
        className="w-full h-[300px] rounded-lg border-2 border-dashed border-indigo-400"
      />

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
            <img
              src={product.image || "https://via.placeholder.com/150"}
              alt="Product"
              className="w-full h-40 object-cover rounded-lg border"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ScanProduct;
