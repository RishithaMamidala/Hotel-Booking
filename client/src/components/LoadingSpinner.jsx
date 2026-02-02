function LoadingSpinner({ size = 'medium', className = '', text = '' }) {
  const sizeClasses = {
    small: 'h-5 w-5 border-2',
    medium: 'h-10 w-10 border-3',
    large: 'h-14 w-14 border-4',
  };

  const textSizes = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base',
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div className="relative">
        {/* Outer ring */}
        <div
          className={`${sizeClasses[size]} rounded-full border-secondary-200`}
        />
        {/* Spinning ring */}
        <div
          className={`absolute inset-0 ${sizeClasses[size]} rounded-full border-transparent border-t-primary-500 border-r-primary-500 animate-spin`}
        />
      </div>
      {text && (
        <p className={`${textSizes[size]} text-secondary-500 font-medium animate-pulse`}>
          {text}
        </p>
      )}
    </div>
  );
}

// Full page loading state
export function PageLoader({ text = 'Loading...' }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <LoadingSpinner size="large" text={text} />
    </div>
  );
}

// Skeleton loaders
export function HotelCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="aspect-hotel skeleton" />
      <div className="p-5 space-y-3">
        <div className="h-4 w-2/3 skeleton" />
        <div className="h-6 w-full skeleton" />
        <div className="h-4 w-full skeleton" />
        <div className="h-4 w-3/4 skeleton" />
        <div className="flex gap-2 pt-2">
          <div className="h-6 w-16 skeleton rounded-full" />
          <div className="h-6 w-16 skeleton rounded-full" />
          <div className="h-6 w-16 skeleton rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function BookingCardSkeleton() {
  return (
    <div className="card p-4 flex flex-col md:flex-row gap-4">
      <div className="w-full md:w-32 h-24 skeleton rounded-xl" />
      <div className="flex-1 space-y-3">
        <div className="h-5 w-1/3 skeleton" />
        <div className="h-4 w-1/2 skeleton" />
        <div className="h-4 w-2/3 skeleton" />
        <div className="flex justify-between items-center pt-2">
          <div className="h-4 w-24 skeleton" />
          <div className="h-6 w-20 skeleton" />
        </div>
      </div>
    </div>
  );
}

export default LoadingSpinner;
