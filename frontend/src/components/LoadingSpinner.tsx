interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'white' | 'green' | 'blue';
  className?: string;
}

export default function LoadingSpinner({ 
  size = 'md', 
  color = 'white', 
  className = '' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const colorClasses = {
    white: 'border-white/30 border-t-white',
    green: 'border-green-400/30 border-t-green-400',
    blue: 'border-blue-400/30 border-t-blue-400'
  };

  return (
    <div 
      className={`${sizeClasses[size]} border-2 ${colorClasses[color]} rounded-full animate-spin ${className}`}
    />
  );
}