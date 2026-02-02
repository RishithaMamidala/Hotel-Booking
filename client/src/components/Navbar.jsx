import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HiMenu,
  HiX,
  HiUser,
  HiLogout,
  HiCalendar,
  HiCog,
  HiChevronDown,
  HiOfficeBuilding,
  HiSparkles
} from 'react-icons/hi';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);
  const { user, isAuthenticated, isAdmin, login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
    setDropdownOpen(false);
  }, [location]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActiveLink = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-lg shadow-soft border-b border-secondary-100'
          : 'bg-white'
      }`}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30 group-hover:shadow-primary-500/40 transition-all duration-300 group-hover:scale-105">
                <HiSparkles className="h-5 w-5 text-white" />
              </div>
            </div>
            <span className="text-xl font-bold font-display bg-gradient-to-r from-secondary-900 to-secondary-700 bg-clip-text text-transparent">
              HotelBook
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/hotels"
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActiveLink('/hotels')
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <HiOfficeBuilding className="h-4 w-4" />
                Browse Hotels
              </span>
            </Link>
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 ${
                    dropdownOpen
                      ? 'bg-secondary-100'
                      : 'hover:bg-secondary-50'
                  }`}
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-8 w-8 rounded-full ring-2 ring-white shadow-soft object-cover"
                    />
                  ) : (
                    <div className="avatar avatar-sm">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="text-left hidden lg:block">
                    <p className="text-sm font-medium text-secondary-900 line-clamp-1">{user.name}</p>
                    <p className="text-xs text-secondary-500">{isAdmin ? 'Administrator' : 'Member'}</p>
                  </div>
                  <HiChevronDown className={`h-4 w-4 text-secondary-400 transition-transform duration-200 ${
                    dropdownOpen ? 'rotate-180' : ''
                  }`} />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="dropdown animate-fade-in-down">
                    <div className="px-4 py-3 border-b border-secondary-100 lg:hidden">
                      <p className="text-sm font-medium text-secondary-900">{user.name}</p>
                      <p className="text-xs text-secondary-500">{user.email}</p>
                    </div>

                    <Link to="/my-bookings" className="dropdown-item">
                      <HiCalendar className="h-4 w-4 text-secondary-400" />
                      <span>My Bookings</span>
                    </Link>

                    <Link to="/profile" className="dropdown-item">
                      <HiUser className="h-4 w-4 text-secondary-400" />
                      <span>Profile</span>
                    </Link>

                    {isAdmin && (
                      <>
                        <div className="dropdown-divider" />
                        <Link to="/admin" className="dropdown-item">
                          <HiCog className="h-4 w-4 text-secondary-400" />
                          <span>Admin Dashboard</span>
                        </Link>
                      </>
                    )}

                    <div className="dropdown-divider" />

                    <button onClick={handleLogout} className="dropdown-item w-full text-danger-600 hover:bg-danger-50">
                      <HiLogout className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={login} className="btn btn-primary">
                <HiUser className="h-4 w-4" />
                Sign In
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-xl text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900 transition-colors touch-target"
            aria-label="Toggle menu"
          >
            {isOpen ? <HiX className="h-6 w-6" /> : <HiMenu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="container-custom py-4 space-y-2 border-t border-secondary-100 bg-secondary-50/50">
          <Link
            to="/hotels"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              isActiveLink('/hotels')
                ? 'bg-primary-50 text-primary-600'
                : 'text-secondary-700 hover:bg-white'
            }`}
          >
            <HiOfficeBuilding className="h-5 w-5" />
            Browse Hotels
          </Link>

          {isAuthenticated ? (
            <>
              <div className="pt-2 pb-1 px-4">
                <p className="text-xs font-semibold text-secondary-400 uppercase tracking-wider">Account</p>
              </div>

              <Link
                to="/my-bookings"
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActiveLink('/my-bookings')
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-secondary-700 hover:bg-white'
                }`}
              >
                <HiCalendar className="h-5 w-5" />
                My Bookings
              </Link>

              <Link
                to="/profile"
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActiveLink('/profile')
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-secondary-700 hover:bg-white'
                }`}
              >
                <HiUser className="h-5 w-5" />
                Profile
              </Link>

              {isAdmin && (
                <Link
                  to="/admin"
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActiveLink('/admin')
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-secondary-700 hover:bg-white'
                  }`}
                >
                  <HiCog className="h-5 w-5" />
                  Admin Dashboard
                </Link>
              )}

              <div className="pt-2">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-danger-600 hover:bg-danger-50 transition-all"
                >
                  <HiLogout className="h-5 w-5" />
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <div className="pt-2">
              <button onClick={login} className="w-full btn btn-primary btn-lg">
                <HiUser className="h-5 w-5" />
                Sign In with Google
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
