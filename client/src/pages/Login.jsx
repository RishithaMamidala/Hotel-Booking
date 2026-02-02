import { useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiSparkles, HiShieldCheck, HiLockClosed } from 'react-icons/hi';
import { FcGoogle } from 'react-icons/fc';

function Login() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const benefits = [
    'Access exclusive deals and discounts',
    'Manage bookings easily',
    'Save favorite hotels',
    'Earn loyalty rewards',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900 flex">
      {/* Left Side - Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative overflow-hidden">
        {/* Background Pattern */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />

        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          {/* Logo */}
          <Link to="/" className="inline-flex items-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <HiSparkles className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold font-display text-white">HotelBook</span>
          </Link>

          {/* Content */}
          <h1 className="text-4xl xl:text-5xl font-bold font-display text-white mb-6 leading-tight">
            Book Your Perfect
            <span className="block text-primary-300">Stay Today</span>
          </h1>

          <p className="text-lg text-primary-200 mb-10 max-w-md leading-relaxed">
            Join millions of travelers who trust HotelBook for their accommodation needs worldwide.
          </p>

          {/* Benefits */}
          <ul className="space-y-4">
            {benefits.map((benefit, index) => (
              <li key={index} className="flex items-center gap-3 text-white/90">
                <div className="w-6 h-6 rounded-full bg-success-500/20 flex items-center justify-center flex-shrink-0">
                  <HiShieldCheck className="h-4 w-4 text-success-400" />
                </div>
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-10">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <HiSparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold font-display text-white">HotelBook</span>
            </Link>
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl shadow-soft-2xl p-8 sm:p-10">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-secondary-900 mb-2">
                Welcome Back
              </h2>
              <p className="text-secondary-500">
                Sign in to continue to HotelBook
              </p>
            </div>

            <div className="space-y-6">
              {/* Google Sign In Button */}
              <button
                onClick={login}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-secondary-200 rounded-2xl shadow-soft hover:shadow-soft-lg hover:border-secondary-300 transition-all duration-200 group"
              >
                <FcGoogle className="h-6 w-6" />
                <span className="text-secondary-700 font-semibold group-hover:text-secondary-900 transition-colors">
                  Continue with Google
                </span>
              </button>

              {/* Divider */}
              <div className="divider text-secondary-400">
                Secure authentication
              </div>

              {/* Security Note */}
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-secondary-50 border border-secondary-100">
                <div className="w-10 h-10 rounded-xl bg-success-100 flex items-center justify-center flex-shrink-0">
                  <HiLockClosed className="h-5 w-5 text-success-600" />
                </div>
                <p className="text-sm text-secondary-600">
                  Your data is encrypted and secure. We never share your personal information.
                </p>
              </div>

              {/* Terms */}
              <p className="text-center text-sm text-secondary-500">
                By signing in, you agree to our{' '}
                <a href="#" className="text-primary-600 hover:text-primary-700 font-medium hover:underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-primary-600 hover:text-primary-700 font-medium hover:underline">
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <Link
              to="/"
              className="text-sm text-white/80 hover:text-white transition-colors"
            >
              &larr; Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
