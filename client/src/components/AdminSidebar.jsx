import { NavLink } from 'react-router-dom';
import {
  HiChartBar,
  HiOfficeBuilding,
  HiKey,
  HiCalendar,
  HiUsers,
  HiDocumentReport,
} from 'react-icons/hi';

const menuItems = [
  { path: '/admin', icon: HiChartBar, label: 'Dashboard', end: true },
  { path: '/admin/hotels', icon: HiOfficeBuilding, label: 'Hotels' },
  { path: '/admin/rooms', icon: HiKey, label: 'Rooms' },
  { path: '/admin/bookings', icon: HiCalendar, label: 'Bookings' },
  { path: '/admin/users', icon: HiUsers, label: 'Users' },
  { path: '/admin/reports', icon: HiDocumentReport, label: 'Reports' },
];

function AdminSidebar() {
  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen">
      <div className="p-4">
        <h2 className="text-xl font-bold text-primary-400">Admin Panel</h2>
      </div>
      <nav className="mt-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors ${
                isActive ? 'bg-gray-800 text-white border-l-4 border-primary-500' : ''
              }`
            }
          >
            <item.icon className="h-5 w-5 mr-3" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default AdminSidebar;
