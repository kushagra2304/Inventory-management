import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Reports = () => {
  const [reports, setReports] = useState([]);

  // Fetch reports on component mount
  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await axios.get('http://localhost:5000/inventory/reports');
      setReports(response.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">📅 Reports</h2>
      <p className="mb-6">View past data and generate reports.</p>

      {reports.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border">ID</th>
                <th className="px-4 py-2 border">Item Code</th>
                <th className="px-4 py-2 border">Description</th>
                <th className="px-4 py-2 border">Quantity</th>
                <th className="px-4 py-2 border">Type</th>
                <th className="px-4 py-2 border">Date</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id} className="text-center">
                  <td className="px-4 py-2 border">{report.id}</td>
                  <td className="px-4 py-2 border">{report.item_code}</td>
                  <td className="px-4 py-2 border">{report.description || '-'}</td>
                  <td className="px-4 py-2 border">{report.quantity}</td>
                  <td className={`px-4 py-2 border ${report.transaction_type === 'received' ? 'text-green-600' : 'text-red-600'}`}>
                    {report.transaction_type}
                  </td>
                  <td className="px-4 py-2 border">{new Date(report.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No transactions found.</p>
      )}
    </div>
  );
};

export default Reports;
