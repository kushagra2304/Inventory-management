// ForecastCard.jsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ForecastCard({ productName, usageData = [] }) {
  // Forecast calculation logic
  function calculateForecast(data) {
    if (data.length < 3) return 0; // need at least 3 months data

    const [first, second, third] = data.slice(-3); // last three months

    const growthFirstSecond = ((second - first) / first) * 100;
    const growthSecondThird = ((third - second) / second) * 100;
    const growthDiff = growthSecondThird - growthFirstSecond;
    const predictedGrowth = growthSecondThird + growthDiff;
    const forecastedUsage = third * (1 + predictedGrowth / 100);

    if (forecastedUsage < 0) {
      return third; // fallback to last month's usage
    } else {
      return Math.round(forecastedUsage);
    }
  }

  const forecast = calculateForecast(usageData);

  return (
    <Card className="w-full max-w-sm shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg">{productName}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2 text-sm">
          {usageData.slice(-3).map((usage, index) => (
            <div key={index} className="flex justify-between">
              <span className="text-muted-foreground">Month {index + 1}:</span>
              <span>{usage} units</span>
            </div>
          ))}
          <div className="flex justify-between font-semibold border-t pt-2 mt-2">
            <span>Forecast (Next Month):</span>
            <span>{forecast} units</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
