import { useEffect, useState } from "react";
import { ForecastCard } from "@/components/sections/ForecastCard";

// Use the environment variable for the API URL
const BASE_URL = import.meta.env.VITE_API_URL;

export default function Settings() {
  const [products, setProducts] = useState([]);
  const [usageData, setUsageData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch inventory data from the backend
        const productResponse = await fetch(`${BASE_URL}/api/inventory`);
        const productResult = await productResponse.json();
        
        // Assume the backend returns an array of inventory items (products)
        setProducts(productResult.inventory || []);

        // Calculate forecasted data for each product
        const usageFetched = {};

        for (const product of productResult.inventory) {
          const usageResponse = await fetch(`${BASE_URL}/api/usage/${product.id}`);
          const usageResult = await usageResponse.json();
          usageFetched[product.id] = usageResult.usageData || [];
        }

        // Now apply forecast logic for each product
        const forecastedData = {};

        for (const productId in usageFetched) {
          const data = usageFetched[productId];

          if (data.length < 2) {
            forecastedData[productId] = data[data.length - 1]; // If there's not enough data, use the last month's data
          } else {
            const prevMonthUsage = data[data.length - 2];
            const currentMonthUsage = data[data.length - 1];

            const differencePercentage =
              ((currentMonthUsage - prevMonthUsage) / prevMonthUsage) * 100;

            let forecastedQuantity = currentMonthUsage;

            if (differencePercentage > 0) {
              forecastedQuantity += Math.round((differencePercentage / 100) * currentMonthUsage);
            } else if (differencePercentage < 0) {
              forecastedQuantity = Math.max(currentMonthUsage, prevMonthUsage);
            }

            forecastedData[productId] = forecastedQuantity;
          }
        }

        setUsageData(forecastedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return <div className="p-6">Loading forecast data...</div>;
  }

  return (
    <div className="p-6 flex flex-wrap gap-6">
      {products.map((product) => (
        <ForecastCard
          key={product.id}
          productName={product.description} // Use 'description' from inventory table
          usageData={[usageData[product.id] || 0]} // Send forecasted quantity as usageData
        />
      ))}
    </div>
  );
}
