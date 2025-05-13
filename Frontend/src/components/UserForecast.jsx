import { useEffect, useState } from "react";
import { ForecastCard } from "@/components/sections/ForecastCard";

const BASE_URL = import.meta.env.VITE_API_URL;

export default function UserForecast() {
  const [products, setProducts] = useState([]);
  const [usageData, setUsageData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const productResponse = await fetch(`${BASE_URL}/api/user/inventory`);
        const productResult = await productResponse.json();

        const inventory = productResult.inventory || [];
        setProducts(inventory);

        const usageFetched = {};

        for (const product of inventory) {
          try {
            const usageResponse = await fetch(`${BASE_URL}/api/usage/user/${product.comp_code}`);
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
    return <div className="p-6 text-center text-lg">Loading forecast data...</div>;
  }

  return (
    <div className="text-center mb-8">
      <h1 className="text-3xl font-bold text-center mb-8 text-blue-900 relative inline-block after:block after:h-1 after:bg-red-600 after:w-full after:mt-1">
  Forecast and Prediction
</h1>


      {products.length === 0 && <p className="text-center">No products found.</p>}

      <div className="flex flex-wrap justify-center gap-6">
        {products.map((product) => {
          const usage = usageData[product.comp_code] || {};

          return (
            <div
              key={product.id}
              className="bg-white rounded-2xl shadow-md p-4 w-72 transition-transform hover:scale-105"
            >
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
    </div>
  );
}
