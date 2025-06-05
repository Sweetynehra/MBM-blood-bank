
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/hooks/useNotifications';

const NotificationBadge = () => {
  const { notifications, fetchNotifications } = useNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;
  const [isAnimating, setIsAnimating] = useState(false);

  // Add animation when new notifications arrive
  useEffect(() => {
    if (unreadCount > 0) {
      setIsAnimating(true);
      const timeout = setTimeout(() => setIsAnimating(false), 1000);
      return () => clearTimeout(timeout);
    }
  }, [unreadCount]);

  // Refresh notifications every minute to ensure they're up to date
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Auto-refreshing notifications');
      fetchNotifications();
    }, 60000); // every minute

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  return (
    <>
      {/* Desktop: Just the icon with badge */}
      <div className="hidden md:block">
        <Link to="/notifications">
          <Button 
            variant="outline" 
            size="icon" 
            className={`rounded-full relative ${isAnimating ? 'animate-ping-once' : ''}`}
          >
            <Bell className={`h-4 w-4 ${unreadCount > 0 ? 'text-blood' : ''}`} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center bg-blood rounded-full border-2 border-background text-white text-xs font-bold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>
        </Link>
      </div>
      
      {/* Mobile: Just the icon with badge */}
      <div className="md:hidden">
        <Link to="/notifications">
          <Button 
            variant="outline" 
            size="icon" 
            className={`rounded-full relative ${isAnimating ? 'animate-ping-once' : ''}`}
          >
            <Bell className={`h-4 w-4 ${unreadCount > 0 ? 'text-blood' : ''}`} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center bg-blood rounded-full border-2 border-background text-white text-xs font-bold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>
        </Link>
      </div>
    </>
  );
};

export default NotificationBadge;
