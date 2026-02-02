import { Link } from 'react-router-dom';
import { HiHome } from 'react-icons/hi';

function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <h1 className="text-9xl font-bold text-primary-600">404</h1>
      <h2 className="text-2xl font-semibold text-gray-900 mt-4">Page Not Found</h2>
      <p className="text-gray-600 mt-2 text-center max-w-md">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="mt-8 btn btn-primary flex items-center">
        <HiHome className="h-5 w-5 mr-2" />
        Back to Home
      </Link>
    </div>
  );
}

export default NotFound;
