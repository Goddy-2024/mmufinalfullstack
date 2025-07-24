import React from 'react';

interface UpcomingEvent {
  name: string;
  date: string;
  status: string;
  statusColor: string;
}

interface UpcomingEventsProps {
  events: UpcomingEvent[];
}

const UpcomingEvents: React.FC<UpcomingEventsProps> = ({ events }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Upcoming Events</h3>
        <p className="text-sm text-gray-600">Scheduled fellowship events</p>
      </div>

      <div className="space-y-4">
        {events.map((event, index) => (
          <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">{event.name}</p>
              <p className="text-sm text-gray-600">{event.date}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${event.statusColor}`}>
              {event.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpcomingEvents;