import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { reportsAPI } from '../../services/api';

interface DepartmentData {
  department: string;
  members: number;
}

const DepartmentChart: React.FC = () => {
  const [data, setData] = useState<DepartmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDepartmentData();
  }, []);

  const fetchDepartmentData = async () => {
    try {
      setLoading(true);
      const response = await reportsAPI.getDepartmentDistribution();
      setData(response);
      setError(null);
    } catch (err) {
      console.error('Error fetching department distribution:', err);
      setError('Failed to load department data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Department Distribution</h3>
          <p className="text-sm text-gray-600">Members by department</p>
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
          <h3 className="text-lg font-semibold text-gray-900">Department Distribution</h3>
          <p className="text-sm text-gray-600">Members by department</p>
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
        <h3 className="text-lg font-semibold text-gray-900">Department Distribution</h3>
        <p className="text-sm text-gray-600">Members by department</p>
      </div>
      
      <div className="h-80">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="department" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                height={60}
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
              <Bar 
                dataKey="members" 
                fill="#10b981" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            No department data available
          </div>
        )}
      </div>
    </div>
  );
};

export default DepartmentChart;