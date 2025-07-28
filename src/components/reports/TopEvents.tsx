import React, { useState, useEffect } from 'react';
import { reportsAPI } from '../../services/api';

interface TopEvent {
  name: string;
  avgAttendance: string;
}

const TopEvents: React.FC = () => {
  const [topEvents, setTopEvents] = useState<TopEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTopEvents();
  }, []);

  const fetchTopEvents = async () => {
    try {
      setLoading(true);
      const response = await reportsAPI.getTopEvents();
      setTopEvents(response);
      setError(null);
    } catch (err) {
      console.error('Error fetching top events:', err);
      setError('Failed to load top events');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Top Events</h3>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex justify-between items-center">
              <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
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
          <h3 className="text-lg font-semibold text-gray-900">Top Events</h3>
        </div>
        <div className="text-red-600 text-center py-4">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Top Events</h3>
      </div>
      
      <div className="space-y-4">
        {topEvents.length > 0 ? (
          topEvents.map((event, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-gray-900 font-medium">{event.name}</span>
              <span className="text-gray-600">{event.avgAttendance}</span>
            </div>
          ))
        ) : (
          <div className="text-gray-500 text-center py-4">No events data available</div>
        )}
      </div>
    </div>
  );
};

export default TopEvents;