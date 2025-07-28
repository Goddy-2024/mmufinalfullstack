import React, { useState, useEffect } from 'react';
import { reportsAPI } from '../../services/api';

interface GrowthMetrics {
  memberGrowth: string;
  attendanceGrowth: string;
  eventFrequency: string;
}

const GrowthMetrics: React.FC = () => {
  const [metrics, setMetrics] = useState<GrowthMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGrowthMetrics();
  }, []);

  const fetchGrowthMetrics = async () => {
    try {
      setLoading(true);
      const response = await reportsAPI.getGrowthMetrics();
      setMetrics(response);
      setError(null);
    } catch (err) {
      console.error('Error fetching growth metrics:', err);
      setError('Failed to load growth metrics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Growth Metrics</h3>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between items-center">
              <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
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
          <h3 className="text-lg font-semibold text-gray-900">Growth Metrics</h3>
        </div>
        <div className="text-red-600 text-center py-4">{error}</div>
      </div>
    );
  }

  const getColorClass = (value: string) => {
    if (value.includes('+')) return 'text-green-600';
    if (value.includes('-')) return 'text-red-600';
    return 'text-blue-600';
  };

  const data = [
    { label: 'Member Growth:', value: metrics?.memberGrowth || '0.0%', color: getColorClass(metrics?.memberGrowth || '') },
    { label: 'Attendance Growth:', value: metrics?.attendanceGrowth || '0.0%', color: getColorClass(metrics?.attendanceGrowth || '') },
    { label: 'Event Frequency:', value: metrics?.eventFrequency || '0.0/week', color: 'text-blue-600' },
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Growth Metrics</h3>
      </div>
      
      <div className="space-y-4">
        {data.map((metric, index) => (
          <div key={index} className="flex justify-between items-center">
            <span className="text-gray-600">{metric.label}</span>
            <span className={`font-bold ${metric.color}`}>{metric.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GrowthMetrics;