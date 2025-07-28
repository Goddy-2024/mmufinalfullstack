import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import AddEventModal from './modals/AddEventModal';
import { eventsAPI } from '../services/api';

interface Event {
  _id: string;
  name: string;
  date: string;
  time: string;
  location: string;
  type: string;
  expectedAttendees: number;
  description?: string;
  status: string;
}

type NewEvent = Omit<Event, '_id'>;

type EditEventModalProps = {
  isOpen: boolean;
  onClose: () => void;
  event: Event | null;
  onSubmit: (eventData: Partial<Event>) => void;
};

const EditEventModal: React.FC<EditEventModalProps> = ({ isOpen, onClose, event, onSubmit }) => {
  const [formData, setFormData] = useState<Partial<Event>>(event || {});

  useEffect(() => {
    setFormData(event || {});
  }, [event]);

  const eventTypes = [
    'Service',
    'Study',
    'Conference',
    'Meeting',
    'Outreach',
    'Social',
    'Training',
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) onSubmit(formData);
  };

  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Edit Event</h2>
            <p className="text-sm text-gray-600 mt-1">Update event information.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors duration-200">
            <Edit className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Event Name *</label>
            <input type="text" id="name" name="name" value={formData.name || ''} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
              <input type="date" id="date" name="date" value={formData.date ? formData.date.split('T')[0] : ''} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">Time *</label>
              <input type="time" id="time" name="time" value={formData.time || ''} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
          </div>
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
            <input type="text" id="location" name="location" value={formData.location || ''} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">Event Type *</label>
            <select id="type" name="type" value={formData.type || ''} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="">Select event type</option>
              {eventTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="expectedAttendees" className="block text-sm font-medium text-gray-700 mb-2">Expected Attendees</label>
            <input type="number" id="expectedAttendees" name="expectedAttendees" value={formData.expectedAttendees || 0} onChange={handleChange} min="0" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea id="description" name="description" value={formData.description || ''} onChange={handleChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors duration-200">Update Event</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Events: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const res = await eventsAPI.getAll({ limit: 100 });
        setEvents(res.events || []);
      } catch (e) {
        // handle error
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleAddEvent = async (eventData: NewEvent) => {
    try {
      await eventsAPI.create(eventData);
      const res = await eventsAPI.getAll({ limit: 100 });
      setEvents(res.events || []);
    } catch (e) {
      // handle error
    }
  };

  const handleEditClick = (event: Event) => {
    setSelectedEvent(event);
    setIsEditModalOpen(true);
  };

  const handleEditEvent = async (eventData: Partial<Event>) => {
    if (!selectedEvent) return;
    try {
      await eventsAPI.update(selectedEvent._id, eventData);
      const res = await eventsAPI.getAll({ limit: 100 });
      setEvents(res.events || []);
      setIsEditModalOpen(false);
      setSelectedEvent(null);
    } catch (e) {
      // handle error
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await eventsAPI.delete(eventId);
      setEvents(events => events.filter(e => e._id !== eventId));
    } catch (err) {
      alert('Failed to delete event.');
    }
  };

  const filteredEvents = events.filter(event =>
    event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Event Management</h1>
          <p className="text-gray-600 mt-1">Schedule and manage fellowship events</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors duration-200 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Event</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Events Calendar</h3>
              <p className="text-sm text-gray-600">View and manage all fellowship events</p>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expected</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEvents.map((event) => (
                <tr key={event._id} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {event.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {event.date ? event.date.split('T')[0] : ''}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {event.time}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {event.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {event.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {event.expectedAttendees}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                      {event.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button className="text-blue-600 hover:text-blue-800 transition-colors duration-200" onClick={() => handleEditClick(event)}>
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteEvent(event._id)} style={{ color: 'red', marginLeft: 8 }}><Trash2 /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <AddEventModal
      isOpen={isAddModalOpen}
      onClose={() => setIsAddModalOpen(false)}
      onSubmit={handleAddEvent}
    />
    <EditEventModal
      isOpen={isEditModalOpen}
      onClose={() => { setIsEditModalOpen(false); setSelectedEvent(null); }}
      event={selectedEvent}
      onSubmit={handleEditEvent}
    />
    </>
  );
};

export default Events;