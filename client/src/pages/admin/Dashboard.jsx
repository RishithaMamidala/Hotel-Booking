import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { format } from 'date-fns';
import {
  HiUsers,
  HiOfficeBuilding,
  HiCalendar,
  HiCurrencyDollar,
  HiBell,
  HiExclamation,
  HiInformationCircle,
} from 'react-icons/hi';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [dashboardRes, analyticsRes, notificationsRes] = await Promise.all([
        adminAPI.getDashboard(),
        adminAPI.getAnalytics({ period: 30 }),
        adminAPI.getNotifications(),
      ]);

      setStats(dashboardRes.data.stats);
      setAnalytics(analyticsRes.data.analytics);
      setNotifications(notificationsRes.data.notifications);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner className="min-h-screen" />;
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: HiUsers,
      color: 'bg-blue-500',
      link: '/admin/users',
    },
    {
      title: 'Total Hotels',
      value: stats?.totalHotels || 0,
      icon: HiOfficeBuilding,
      color: 'bg-green-500',
      link: '/admin/hotels',
    },
    {
      title: 'Total Bookings',
      value: stats?.totalBookings || 0,
      icon: HiCalendar,
      color: 'bg-purple-500',
      link: '/admin/bookings',
    },
    {
      title: 'Total Revenue',
      value: `$${(stats?.totalRevenue || 0).toLocaleString()}`,
      icon: HiCurrencyDollar,
      color: 'bg-yellow-500',
      link: '/admin/reports',
    },
  ];

  const COLORS = ['#22c55e', '#3b82f6', '#a855f7', '#f59e0b', '#ef4444'];

  const bookingStatusData = Object.entries(stats?.bookingsByStatus || {}).map(
    ([status, count]) => ({ name: status, value: count })
  );

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'warning':
        return <HiExclamation className="h-5 w-5 text-yellow-500" />;
      case 'alert':
        return <HiExclamation className="h-5 w-5 text-red-500" />;
      default:
        return <HiInformationCircle className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3 flex items-center">
            <HiBell className="h-5 w-5 mr-2" />
            Notifications
          </h2>
          <div className="space-y-2">
            {notifications.map((notification, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg flex items-center ${
                  notification.type === 'warning'
                    ? 'bg-yellow-50 border border-yellow-200'
                    : notification.type === 'alert'
                    ? 'bg-red-50 border border-red-200'
                    : 'bg-blue-50 border border-blue-200'
                }`}
              >
                {getNotificationIcon(notification.type)}
                <span className="ml-2">{notification.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <Link
            key={index}
            to={stat.link}
            className="card p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Chart */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">Revenue (Last 30 Days)</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics?.revenueByDay || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="_id"
                  tickFormatter={(value) => format(new Date(value), 'MMM d')}
                />
                <YAxis tickFormatter={(value) => `$${value}`} />
                <Tooltip
                  formatter={(value) => [`$${value}`, 'Revenue']}
                  labelFormatter={(label) => format(new Date(label), 'MMM d, yyyy')}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Booking Status Chart */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">Bookings by Status</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={bookingStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} (${(percent * 100).toFixed(0)}%)`
                  }
                >
                  {bookingStatusData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="card mt-8">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">Recent Bookings</h2>
          <Link to="/admin/bookings" className="text-primary-600 hover:underline text-sm">
            View All
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Booking ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Guest
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Hotel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stats?.recentBookings?.map((booking) => (
                <tr key={booking._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">
                    {booking.bookingId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {booking.user?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {booking.hotel?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`badge ${
                        booking.status === 'confirmed'
                          ? 'badge-info'
                          : booking.status === 'cancelled'
                          ? 'badge-danger'
                          : booking.status === 'checked-out'
                          ? 'bg-gray-100 text-gray-700'
                          : 'badge-warning'
                      }`}
                    >
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">
                    ${booking.pricing?.grandTotal?.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
