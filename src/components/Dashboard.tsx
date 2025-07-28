import React, { useEffect, useState } from 'react';
import { Users, Calendar, UserPlus, TrendingUp, Link } from 'lucide-react';
import StatsCard from './dashboard/StatsCard';
import ActivityList from './dashboard/ActivityList';
import UpcomingEvents from './dashboard/UpcomingEvents';
import RegistrationForms from './dashboard/RegistrationForms';
import GenerateFormModal from './modals/GenerateFormModal';
import { dashboardAPI } from '../services/api';

const statusColorMap: Record<string, string> = {
  Upcoming: 'bg-blue-100 text-blue-800',
  Confirmed: 'bg-green-100 text-green-800',
  Planning: 'bg-purple-100 text-purple-800',
  Cancelled: 'bg-red-100 text-red-800',
};

type StatColor = 'blue' | 'green' | 'purple' | 'orange';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState([
    { title: 'Total Members', value: '-', subtitle: 'Active fellowship members', icon: Users, color: 'blue' as StatColor },
    { title: "This Month's Events", value: '-', subtitle: 'Scheduled activities', icon: Calendar, color: 'green' as StatColor },
    { title: 'New Members', value: '-', subtitle: 'Joined this month', icon: UserPlus, color: 'purple' as StatColor },
    { title: 'Attendance Rate', value: '-', subtitle: 'Average event attendance', icon: TrendingUp, color: 'orange' as StatColor },
  ]);
  const [activities, setActivities] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerateFormModalOpen, setIsGenerateFormModalOpen] = useState(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        console.log('Fetching dashboard data...');
        const res = await dashboardAPI.getStats();
        console.log('Dashboard response:', res);
        
        if (res.stats) {
          setStats([
            { title: 'Total Members', value: res.stats.totalMembers?.toString() || '0', subtitle: 'Active fellowship members', icon: Users, color: 'blue' as StatColor },
            { title: "This Month's Events", value: res.stats.thisMonthEvents?.toString() || '0', subtitle: 'Scheduled activities', icon: Calendar, color: 'green' as StatColor },
            { title: 'New Members', value: res.stats.newMembersThisMonth?.toString() || '0', subtitle: 'Joined this month', icon: UserPlus, color: 'purple' as StatColor },
            { title: 'Attendance Rate', value: res.stats.attendanceRate || '0%', subtitle: 'Average event attendance', icon: TrendingUp, color: 'orange' as StatColor },
          ]);
        }
        if (res.recentActivities) {
          setActivities(res.recentActivities.map((a: any) => ({
            name: a.name,
            attendees: a.attendees,
            timeAgo: a.timeAgo,
            color: 'blue', // You can enhance this to use different colors based on event type
          })));
        }
        if (res.upcomingEvents) {
          setUpcomingEvents(res.upcomingEvents.map((e: any) => ({
            name: e.name,
            date: e.date,
            status: e.status,
            statusColor: statusColorMap[e.status] || 'bg-gray-100 text-gray-800',
          })));
        }
      } catch (e) {
        console.error('Error fetching dashboard data:', e);
        // handle error
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome to MMU RHSF Fellowship Management System</p>
        </div>
        <button
          onClick={() => setIsGenerateFormModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
        >
          <Link className="w-4 h-4" />
          <span>Generate Form</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Activity Sections */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <ActivityList activities={activities} />
        <UpcomingEvents events={upcomingEvents} />
      </div>

      {/* Registration Forms Section */}
      <RegistrationForms />

      <GenerateFormModal
        isOpen={isGenerateFormModalOpen}
        onClose={() => setIsGenerateFormModalOpen(false)}
        onFormGenerated={(formData) => {
          console.log('Form generated:', formData);
          setIsGenerateFormModalOpen(false);
          // Force a page refresh to show the new form in the list
          window.location.reload();
        }}
      />
    </div>
  );
};

export default Dashboard;