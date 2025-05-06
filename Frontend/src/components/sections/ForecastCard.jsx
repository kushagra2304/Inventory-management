import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ForecastCard({ productName, usageData = [] }) {
  function extractValue(key, usageString) {
    const match = usageString.match(new RegExp(`${key}:\\s*(\\d+)`));
    return match ? parseInt(match[1], 10) : null;
  }

  const currentStock = extractValue("Current Stock", usageData[0]);
  const monthlyUsage = extractValue("Monthly Usage", usageData[1]);

  const forecastToAdd =
    currentStock !== null && monthlyUsage !== null
      ? Math.max(monthlyUsage - currentStock, 0)
      : "N/A";

  return (
    <Card className="w-full max-w-sm shadow-lg">
  <CardHeader>
    <CardTitle className="text-lg">{productName}</CardTitle>
  </CardHeader>
  <CardContent className="text-sm space-y-2">
    {usageData.map((line, index) => (
      <div key={index} className="flex justify-between">
        <span className="text-muted-foreground">•</span>
        <span>{line}</span>
      </div>
    ))}
    <div className="flex justify-between font-semibold border-t pt-2 mt-2">
      <span>Forecast (Required Next Month):</span>
      <span>{forecastToAdd} units</span>
    </div>
  </CardContent>
</Card>

  );
}
