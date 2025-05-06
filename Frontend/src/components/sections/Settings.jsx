import { useEffect, useState } from "react";
import { ForecastCard } from "@/components/sections/ForecastCard";

const BASE_URL = import.meta.env.VITE_API_URL;

export default function Settings() {
  const [products, setProducts] = useState([]);
  const [usageData, setUsageData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const productResponse = await fetch(`${BASE_URL}/api/inventory`);
        const productResult = await productResponse.json();

        const inventory = productResult.inventory || [];
        setProducts(inventory);

        const usageFetched = {};

        for (const product of inventory) {
          try {
            const usageResponse = await fetch(`${BASE_URL}/api/usage/${product.comp_code}`);
            const usageResult = await usageResponse.json();
            usageFetched[product.comp_code] = usageResult;
          } catch (err) {
            console.error(`Failed to fetch usage for product ${product.comp_code}`, err);
          }
        }

        setUsageData(usageFetched);
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
    <div className="flex flex-wrap gap-6 p-6">
    {products.length === 0 && <p>No products found.</p>}
    {products.map((product) => {
      const usage = usageData[product.comp_code] || {};
  
      return (
        <div key={product.id} className="border p-4 rounded-md shadow-md w-64">
          <p className="font-semibold mb-2">{product.description}</p>
          <ForecastCard
            productName={product.description}
            usageData={[
              `Current Stock: ${usage.currentStock ?? "N/A"}`,
              `Monthly Usage: ${usage.averageMonthlyUsage ?? "N/A"}`,
              `Stock lasts (months): ${usage.estimatedMonthsLeft ?? "N/A"}`
            ]}
          />
        </div>
      );
    })}
  </div>
  );
}
