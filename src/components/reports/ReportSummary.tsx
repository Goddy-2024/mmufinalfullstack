import React, { useState, useEffect } from 'react';
import { reportsAPI } from '../../services/api';

interface MonthlySummary {
  totalEvents: number;
  totalAttendance: number;
  averagePerEvent: number;
}

const ReportSummary: React.FC = () => {
  const [summaryData, setSummaryData] = useState<MonthlySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSummaryData();
  }, []);

  const fetchSummaryData = async () => {
    try {
      setLoading(true);
      const response = await reportsAPI.getMonthlySummary();
      setSummaryData(response);
      setError(null);
    } catch (err) {
      console.error('Error fetching monthly summary:', err);
      setError('Failed to load summary data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Monthly Summary</h3>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between items-center">
              <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
              <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Monthly Summary</h3>
        </div>
        <div className="text-red-600 text-center py-4">{error}</div>
      </div>
    );
  }

  const data = [
    { label: 'Total Events:', value: summaryData?.totalEvents || 0 },
    { label: 'Total Attendance:', value: summaryData?.totalAttendance || 0 },
    { label: 'Average per Event:', value: summaryData?.averagePerEvent || 0 },
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Monthly Summary</h3>
      </div>
      
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index} className="flex justify-between items-center">
            <span className="text-gray-600">{item.label}</span>
            <span className="text-2xl font-bold text-gray-900">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportSummary;