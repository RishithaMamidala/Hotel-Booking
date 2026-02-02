import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { hotelsAPI } from '../services/api';
import SearchBar from '../components/SearchBar';
import HotelCard from '../components/HotelCard';
import LoadingSpinner, { HotelCardSkeleton } from '../components/LoadingSpinner';
import {
  HiShieldCheck,
  HiCurrencyDollar,
  HiSupport,
  HiArrowRight,
  HiStar,
  HiGlobe,
  HiUserGroup,
  HiSparkles,
} from 'react-icons/hi';

function Home() {
  const [featuredHotels, setFeaturedHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedHotels = async () => {
      try {
        const response = await hotelsAPI.getAll({ limit: 6 });
        setFeaturedHotels(response.data.hotels);
      } catch (error) {
        console.error('Error fetching hotels:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedHotels();
  }, []);

  const features = [
    {
      icon: HiShieldCheck,
      title: 'Secure Booking',
      description: 'Your payments are protected with industry-leading encryption technology.',
      color: 'from-success-500 to-success-600',
    },
    {
      icon: HiCurrencyDollar,
      title: 'Best Price Guarantee',
      description: 'Find a lower price? We\'ll match it and give you an extra 10% off.',
      color: 'from-warning-500 to-warning-600',
    },
    {
      icon: HiSupport,
      title: '24/7 Support',
      description: 'Our dedicated support team is available around the clock to assist you.',
      color: 'from-primary-500 to-primary-600',
    },
  ];

  const stats = [
    { icon: HiGlobe, value: '500+', label: 'Destinations' },
    { icon: HiUserGroup, value: '100K+', label: 'Happy Guests' },
    { icon: HiStar, value: '4.9', label: 'Average Rating' },
    { icon: HiSparkles, value: '50K+', label: 'Bookings' },
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] lg:min-h-[85vh] flex items-center">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1920)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-secondary-900/90 via-secondary-900/70 to-secondary-900/50" />
        </div>

        {/* Content */}
        <div className="relative container-custom py-20 lg:py-24">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6 animate-fade-in-down">
              <HiSparkles className="h-4 w-4 text-warning-400" />
              <span className="text-sm font-medium text-white">Trusted by 100,000+ travelers</span>
            </div>

            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold font-display text-white mb-6 animate-fade-in-up leading-tight">
              Find Your Perfect
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400">
                Stay Anywhere
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-secondary-200 mb-10 max-w-xl animate-fade-in leading-relaxed">
              Discover amazing hotels at unbeatable prices. Book your next adventure
              with confidence, flexibility, and ease.
            </p>

            {/* Stats - Mobile */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10 lg:hidden">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="text-center p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10"
                >
                  <stat.icon className="h-5 w-5 text-primary-400 mx-auto mb-2" />
                  <div className="text-xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-secondary-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <SearchBar variant="hero" className="max-w-5xl" />
          </div>
        </div>

        {/* Stats - Desktop */}
        <div className="hidden lg:block absolute bottom-0 left-0 right-0">
          <div className="container-custom pb-8">
            <div className="flex items-center justify-start gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="flex items-center gap-3 text-white/80">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                    <stat.icon className="h-5 w-5 text-primary-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-sm text-secondary-300">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="section-header">
            <h2 className="section-title">Why Book With Us?</h2>
            <p className="section-subtitle">
              We provide the best service and guarantee for your travel needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-6 lg:p-8 rounded-3xl bg-secondary-50 hover:bg-white hover:shadow-soft-xl border border-transparent hover:border-secondary-100 transition-all duration-300"
              >
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} shadow-lg mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-secondary-900 mb-3">{feature.title}</h3>
                <p className="text-secondary-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Hotels Section */}
      <section className="section bg-secondary-50">
        <div className="container-custom">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-secondary-900 mb-2">
                Featured Hotels
              </h2>
              <p className="text-secondary-500">
                Hand-picked hotels for an unforgettable experience
              </p>
            </div>
            <Link
              to="/hotels"
              className="btn btn-secondary self-start sm:self-auto group"
            >
              View All Hotels
              <HiArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <HotelCardSkeleton key={i} />
              ))}
            </div>
          ) : featuredHotels.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredHotels.map((hotel) => (
                <HotelCard key={hotel._id} hotel={hotel} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <HiSparkles className="empty-state-icon" />
              <h3 className="empty-state-title">No hotels available</h3>
              <p className="empty-state-description">Check back later for amazing hotel deals.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />

        <div className="relative container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display text-white mb-6">
              Ready to Start Your Journey?
            </h2>
            <p className="text-lg sm:text-xl text-primary-100 mb-10 max-w-xl mx-auto">
              Join thousands of happy travelers who book their perfect stays with us.
              Sign up today and get exclusive deals!
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/hotels"
                className="w-full sm:w-auto btn btn-lg bg-white text-primary-600 hover:bg-primary-50 shadow-xl shadow-primary-900/30"
              >
                <HiSparkles className="h-5 w-5" />
                Explore Hotels
              </Link>
              <Link
                to="/hotels"
                className="w-full sm:w-auto btn btn-lg bg-transparent text-white border-2 border-white/30 hover:bg-white/10"
              >
                Learn More
                <HiArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
