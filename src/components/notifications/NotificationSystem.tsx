
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '@/hooks/useNotifications';
import { useBloodRequestNotifications } from '@/hooks/useBloodRequestNotifications';
import NotificationBadge from './NotificationBadge';
import { useToast } from '@/hooks/use-toast';

const NotificationSystem = () => {
  const navigate = useNavigate();
  const { fetchNotifications } = useNotifications();
  const { toast } = useToast();
  
  // Set up real-time notification listener
  useBloodRequestNotifications({
    onNewRequest: (request) => {
      console.log('Real-time notification received for blood request:', request);
      
      // Always refresh the notification list when a new request comes in
      fetchNotifications().catch(err => {
        // Don't show toast for infinite recursion errors
        if (err.code !== '42P17') {
          console.error('Error refreshing notifications:', err);
        }
      });
      
      // For urgent requests, show an additional toast with longer duration
      if (request.urgency_level === 'urgent') {
        console.log('Urgent blood request notification detected!');
        toast({
          title: "URGENT BLOOD REQUEST",
          description: `Your blood type matches an urgent request for ${request.blood_type} at ${request.hospital}.`,
          variant: "destructive",
          duration: 10000, // Show for longer (10 seconds)
        });
      } else {
        console.log('Regular blood request notification');
        toast({
          title: "Blood Request Match",
          description: `Your blood type matches a request for ${request.blood_type} at ${request.hospital}.`,
          duration: 5000,
        });
      }
    }
  });

  // Use effect to do initial fetch when component mounts
  useEffect(() => {
    console.log('NotificationSystem mounted, fetching initial notifications');
    // Initial fetch of notifications
    fetchNotifications().catch(err => {
      // Don't show error for infinite recursion issues
      if (err.code !== '42P17') {
        console.error('Error fetching initial notifications:', err);
      }
    });
    
    // Set up polling every 30 seconds as a backup in case realtime fails
    const intervalId = setInterval(() => {
      console.log('Polling for notifications');
      fetchNotifications().catch(err => {
        // Don't show error for infinite recursion issues
        if (err.code !== '42P17') {
          console.error('Error polling for notifications:', err);
        }
      });
    }, 30000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [fetchNotifications]);

  return <NotificationBadge />;
};

export default NotificationSystem;
