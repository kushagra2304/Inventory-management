import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ForecastCard({ productName, usageData = [] }) {
  function extractValue(key, usageString) {
    const match = usageString.match(new RegExp(`${key}:\\s*(\\d+)`));
    return match ? parseInt(match[1], 10) : null;
  }

  function splitLabelAndValue(line) {
    const [label, value] = line.split(":");
    return { label: label?.trim(), value: value?.trim() };
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
        <CardTitle className="text-lg text-blue-600">{productName}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm space-y-2">
        {usageData.map((line, index) => {
          const { label, value } = splitLabelAndValue(line);
          return (
            <div key={index} className="flex justify-between">
              <span className="text-blue-900">{label}</span>
              <span>{value}</span>
            </div>
          );
        })}
        <div className="flex justify-between font-semibold border-t pt-2 mt-2">
          <span className="text-blue-900">Forecast (Required Next Month):</span>
          <span className="text-red-600">
            {forecastToAdd} {forecastToAdd !== "N/A" ? "units" : ""}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
