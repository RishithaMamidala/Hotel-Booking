import { useState } from 'react';
import { adminAPI } from '../../services/api';
import DatePicker from 'react-datepicker';
import { HiDocumentReport, HiDownload, HiCurrencyDollar, HiCalendar } from 'react-icons/hi';
import 'react-datepicker/dist/react-datepicker.css';

function AdminReports() {
  const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState(new Date());
  const [reportType, setReportType] = useState('bookings');
  const [generating, setGenerating] = useState(false);

  const handleGenerateReport = async () => {
    setGenerating(true);

    try {
      const response = await adminAPI.getReports({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        type: reportType,
      });

      // Create download link
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `report-${reportType}-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Failed to generate report');
      console.error(error);
    } finally {
      setGenerating(false);
    }
  };

  const reportTypes = [
    {
      id: 'bookings',
      name: 'Bookings Report',
      description: 'Overview of all bookings including status breakdown and recent bookings list',
      icon: HiCalendar,
    },
    {
      id: 'revenue',
      name: 'Revenue Report',
      description: 'Daily revenue breakdown with totals and averages',
      icon: HiCurrencyDollar,
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Reports</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Report Configuration */}
        <div className="lg:col-span-2">
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-6">Generate Report</h2>

            {/* Report Type Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Report Type
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reportTypes.map((type) => (
                  <div
                    key={type.id}
                    onClick={() => setReportType(type.id)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      reportType === type.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      <type.icon
                        className={`h-6 w-6 mr-2 ${
                          reportType === type.id ? 'text-primary-600' : 'text-gray-400'
                        }`}
                      />
                      <span className="font-medium">{type.name}</span>
                    </div>
                    <p className="text-sm text-gray-500">{type.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  maxDate={endDate}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate}
                  maxDate={new Date()}
                  className="input"
                />
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerateReport}
              disabled={generating}
              className="w-full btn btn-primary flex items-center justify-center"
            >
              {generating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <HiDownload className="h-5 w-5 mr-2" />
                  Generate PDF Report
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="lg:col-span-1">
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <HiDocumentReport className="h-5 w-5 mr-2" />
              Quick Actions
            </h2>

            <div className="space-y-4">
              <button
                onClick={() => {
                  setStartDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
                  setEndDate(new Date());
                }}
                className="w-full btn btn-secondary text-left"
              >
                Last 7 Days
              </button>
              <button
                onClick={() => {
                  setStartDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
                  setEndDate(new Date());
                }}
                className="w-full btn btn-secondary text-left"
              >
                Last 30 Days
              </button>
              <button
                onClick={() => {
                  const now = new Date();
                  setStartDate(new Date(now.getFullYear(), now.getMonth(), 1));
                  setEndDate(new Date());
                }}
                className="w-full btn btn-secondary text-left"
              >
                This Month
              </button>
              <button
                onClick={() => {
                  const now = new Date();
                  setStartDate(new Date(now.getFullYear(), 0, 1));
                  setEndDate(new Date());
                }}
                className="w-full btn btn-secondary text-left"
              >
                This Year
              </button>
            </div>
          </div>

          <div className="card p-6 mt-6">
            <h3 className="font-semibold mb-3">Report Contents</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              {reportType === 'bookings' ? (
                <>
                  <li>- Total bookings count</li>
                  <li>- Revenue summary</li>
                  <li>- Status breakdown</li>
                  <li>- Recent bookings list</li>
                </>
              ) : (
                <>
                  <li>- Total revenue</li>
                  <li>- Paid bookings count</li>
                  <li>- Average per booking</li>
                  <li>- Daily breakdown</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminReports;
