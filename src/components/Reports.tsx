import React, { useState } from 'react';
import { FileText, X } from 'lucide-react';
import AttendanceChart from './reports/AttendanceChart';
import DepartmentChart from './reports/DepartmentChart';
import ReportSummary from './reports/ReportSummary';
import TopEvents from './reports/TopEvents';
import GrowthMetrics from './reports/GrowthMetrics';
import { reportsAPI, dashboardAPI, eventsAPI } from '../services/api';

const Reports: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('Current Month');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [eventsList, setEventsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      const [attendanceTrend, departmentDistribution, monthlySummary, topEvents, growthMetrics, eventsRes] = await Promise.all([
        dashboardAPI.getAttendanceTrend(),
        reportsAPI.getDepartmentDistribution(),
        reportsAPI.getMonthlySummary(),
        reportsAPI.getTopEvents(),
        reportsAPI.getGrowthMetrics(),
        eventsAPI.getAll({ limit: 1000 })
      ]);
      // Sort events by date descending
      const sortedEvents = (eventsRes.events || []).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setReportData({
        attendanceTrend,
        departmentDistribution,
        monthlySummary,
        topEvents,
        growthMetrics,
      });
      setEventsList(sortedEvents);
      setIsModalOpen(true);
    } catch (e) {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (!reportData) return;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write('<html><head><title>Fellowship Report</title>');
      printWindow.document.write('<style>body{font-family:sans-serif;} table{border-collapse:collapse;width:100%;} th,td{border:1px solid #ccc;padding:8px;} th{background:#f0f0f0;}</style>');
      printWindow.document.write('</head><body>');
      printWindow.document.write('<h1>Fellowship Report</h1>');
      printWindow.document.write('<h2>Events Attended</h2>');
      printWindow.document.write('<table><tr><th>Date</th><th>Event Name</th><th>Number of Attendees</th></tr>');
      eventsList.forEach((event: any) => {
        printWindow.document.write(`<tr><td>${event.date ? event.date.split('T')[0] : ''}</td><td>${event.name}</td><td>${event.actualAttendees ?? event.expectedAttendees ?? '-'}</td></tr>`);
      });
      printWindow.document.write('</table>');
      printWindow.document.write('<h2>Monthly Attendance Trend</h2>');
      printWindow.document.write('<table><tr><th>Month</th><th>Attendance</th></tr>');
      reportData.attendanceTrend.forEach((row: any) => {
        printWindow.document.write(`<tr><td>${row.month}</td><td>${row.attendance}</td></tr>`);
      });
      printWindow.document.write('</table>');
      printWindow.document.write('<h2>Department Distribution</h2>');
      printWindow.document.write('<table><tr><th>Department</th><th>Members</th></tr>');
      reportData.departmentDistribution.forEach((row: any) => {
        printWindow.document.write(`<tr><td>${row.department}</td><td>${row.members}</td></tr>`);
      });
      printWindow.document.write('</table>');
      printWindow.document.write('<h2>Monthly Summary</h2>');
      printWindow.document.write('<ul>');
      printWindow.document.write(`<li>Total Events: ${reportData.monthlySummary.totalEvents}</li>`);
      printWindow.document.write(`<li>Total Attendance: ${reportData.monthlySummary.totalAttendance}</li>`);
      printWindow.document.write(`<li>Average per Event: ${reportData.monthlySummary.averagePerEvent}</li>`);
      printWindow.document.write('</ul>');
      printWindow.document.write('<h2>Top Events</h2>');
      printWindow.document.write('<table><tr><th>Event</th><th>Avg Attendance</th></tr>');
      reportData.topEvents.forEach((row: any) => {
        printWindow.document.write(`<tr><td>${row.name}</td><td>${row.avgAttendance}</td></tr>`);
      });
      printWindow.document.write('</table>');
      printWindow.document.write('<h2>Growth Metrics</h2>');
      printWindow.document.write('<ul>');
      printWindow.document.write(`<li>Member Growth: ${reportData.growthMetrics.memberGrowth}</li>`);
      printWindow.document.write(`<li>Attendance Growth: ${reportData.growthMetrics.attendanceGrowth}</li>`);
      printWindow.document.write(`<li>Event Frequency: ${reportData.growthMetrics.eventFrequency}</li>`);
      printWindow.document.write('</ul>');
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-1">Generate and view fellowship reports</p>
        </div>
        <div className="flex items-center space-x-4">
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option>Current Month</option>
            <option>Last 3 Months</option>
            <option>Last 6 Months</option>
            <option>This Year</option>
          </select>
          <button
            className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors duration-200 flex items-center space-x-2"
            onClick={handleGenerateReport}
            disabled={loading}
          >
            <FileText className="w-4 h-4" />
            <span>{loading ? 'Generating...' : 'Generate Report'}</span>
          </button>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <AttendanceChart />
        <DepartmentChart />
      </div>

      {/* Summary Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <ReportSummary />
        <TopEvents />
        <GrowthMetrics />
      </div>

      {/* Printable Report Modal */}
      {isModalOpen && reportData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="p-8">
              <h2 className="text-2xl font-bold mb-4">Fellowship Report</h2>
              <h3 className="text-lg font-semibold mt-6 mb-2">Events Attended</h3>
              <table className="w-full mb-4">
                <thead><tr><th className="text-left">Date</th><th className="text-left">Event Name</th><th className="text-left">Number of Attendees</th></tr></thead>
                <tbody>
                  {eventsList.map((event, idx) => (
                    <tr key={idx}>
                      <td>{event.date ? event.date.split('T')[0] : ''}</td>
                      <td>{event.name}</td>
                      <td>{event.actualAttendees ?? event.expectedAttendees ?? '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <h3 className="text-lg font-semibold mt-6 mb-2">Monthly Attendance Trend</h3>
              <table className="w-full mb-4">
                <thead><tr><th className="text-left">Month</th><th className="text-left">Attendance</th></tr></thead>
                <tbody>
                  {reportData.attendanceTrend.map((row: any, idx: number) => (
                    <tr key={idx}><td>{row.month}</td><td>{row.attendance}</td></tr>
                  ))}
                </tbody>
              </table>
              <h3 className="text-lg font-semibold mt-6 mb-2">Department Distribution</h3>
              <table className="w-full mb-4">
                <thead><tr><th className="text-left">Department</th><th className="text-left">Members</th></tr></thead>
                <tbody>
                  {reportData.departmentDistribution.map((row: any, idx: number) => (
                    <tr key={idx}><td>{row.department}</td><td>{row.members}</td></tr>
                  ))}
                </tbody>
              </table>
              <h3 className="text-lg font-semibold mt-6 mb-2">Monthly Summary</h3>
              <ul className="mb-4">
                <li>Total Events: {reportData.monthlySummary.totalEvents}</li>
                <li>Total Attendance: {reportData.monthlySummary.totalAttendance}</li>
                <li>Average per Event: {reportData.monthlySummary.averagePerEvent}</li>
              </ul>
              <h3 className="text-lg font-semibold mt-6 mb-2">Top Events</h3>
              <table className="w-full mb-4">
                <thead><tr><th className="text-left">Event</th><th className="text-left">Avg Attendance</th></tr></thead>
                <tbody>
                  {reportData.topEvents.map((row: any, idx: number) => (
                    <tr key={idx}><td>{row.name}</td><td>{row.avgAttendance}</td></tr>
                  ))}
                </tbody>
              </table>
              <h3 className="text-lg font-semibold mt-6 mb-2">Growth Metrics</h3>
              <ul className="mb-4">
                <li>Member Growth: {reportData.growthMetrics.memberGrowth}</li>
                <li>Attendance Growth: {reportData.growthMetrics.attendanceGrowth}</li>
                <li>Event Frequency: {reportData.growthMetrics.eventFrequency}</li>
              </ul>
              <button
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                onClick={handlePrint}
              >
                Print Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;