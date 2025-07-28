import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { dashboardAPI } from '../../services/api';

interface AttendanceData {
  month: string;
  attendance: number;
}

const AttendanceChart: React.FC = () => {
  const [data, setData] = useState<AttendanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getAttendanceTrend();
      setData(response);
      setError(null);
    } catch (err) {
      console.error('Error fetching attendance trend:', err);
      setError('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Monthly Attendance Trend</h3>
          <p className="text-sm text-gray-600">Average event attendance over time</p>
        </div>
        <div className="h-80 flex items-center justify-center">
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Monthly Attendance Trend</h3>
          <p className="text-sm text-gray-600">Average event attendance over time</p>
        </div>
        <div className="h-80 flex items-center justify-center">
          <div className="text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Monthly Attendance Trend</h3>
        <p className="text-sm text-gray-600">Average event attendance over time</p>
      </div>
      
      <div className="h-80">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="attendance" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, fill: '#3b82f6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            No attendance data available
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceChart;