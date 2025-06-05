
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bell, 
  Droplets, 
  AlertCircle, 
  User, 
  Check, 
  X,
  Clock,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNotifications } from '@/hooks/useNotifications';

const Notifications = () => {
  const { notifications, loading, markAsRead, markAllAsRead } = useNotifications();
  const [filter, setFilter] = useState<string>("all");
  
  // Apply filter
  const filteredNotifications = filter === "all" 
    ? notifications
    : notifications.filter(notif => notif.type === filter);
  
  // Format time relative to now
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffSecs < 60) {
      return 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    }
  };
  
  // Get notification icon
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'request':
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      case 'match':
        return <Droplets className="h-5 w-5 text-blood" />;
      case 'update':
        return <Clock className="h-5 w-5 text-amber-500" />;
      case 'system':
        return <User className="h-5 w-5 text-blue-500" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <span className="inline-block p-3 rounded-full bg-blood/10 text-blood mb-4">
          <Bell className="h-6 w-6" />
        </span>
        <h1 className="text-3xl font-bold mb-2">Notifications</h1>
        <p className="text-muted-foreground">
          Stay updated on blood donation requests and matches
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Your Notifications</CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select
                  value={filter}
                  onValueChange={setFilter}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="request">Requests</SelectItem>
                    <SelectItem value="match">Matches</SelectItem>
                    <SelectItem value="update">Updates</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {notifications.some(n => !n.read) && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={markAllAsRead}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Mark all as read
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blood"></div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground/20" />
              <p className="text-muted-foreground">No notifications to display</p>
              {filter !== "all" && (
                <Button variant="link" onClick={() => setFilter("all")}>
                  Clear filter
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y">
              {filteredNotifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={`py-4 ${notification.read ? '' : 'bg-muted/30'}`}
                >
                  <div className="flex">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mr-4 flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="font-medium mb-1 pr-4">
                          {notification.title}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatTime(notification.created_at)}
                          </span>
                          
                          {!notification.read && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6"
                              onClick={() => markAsRead(notification.id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        {notification.message}
                      </p>
                      
                      {notification.metadata?.bloodType && (
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {notification.metadata.bloodType}
                          </Badge>
                          
                          {notification.metadata.hospital && (
                            <Badge variant="secondary" className="text-xs">
                              {notification.metadata.hospital}
                            </Badge>
                          )}
                          
                          {notification.metadata.urgent && (
                            <Badge variant="destructive" className="text-xs">
                              Urgent
                            </Badge>
                          )}
                        </div>
                      )}
                      
                      {notification.metadata?.requestId && (
                        <div className="mt-2">
                          <Button 
                            variant="link" 
                            size="sm" 
                            className="h-auto p-0 text-blood"
                            asChild
                          >
                            <Link to={`/donor-response?request=${notification.metadata.requestId}`}>
                              View Request
                            </Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {notifications.length > 0 && (
            <div className="mt-4 pt-4 border-t text-center">
              <p className="text-sm text-muted-foreground">
                You've reached the end of your notifications
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Notifications;
