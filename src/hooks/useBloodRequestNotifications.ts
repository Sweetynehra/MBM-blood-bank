
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

interface BloodRequestNotificationOptions {
  enabled?: boolean;
  onNewRequest?: (request: any) => void;
}

export const useBloodRequestNotifications = (options: BloodRequestNotificationOptions = {}) => {
  const { enabled = true, onNewRequest } = options;
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Function to determine if a donor is eligible for a specific blood request
  const isDonorEligibleForRequest = (donorBloodType: string, requestBloodType: string) => {
    // Blood type compatibility map
    const compatibility: Record<string, string[]> = {
      'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
      'O+': ['O+', 'A+', 'B+', 'AB+'],
      'A-': ['A-', 'A+', 'AB-', 'AB+'],
      'A+': ['A+', 'AB+'],
      'B-': ['B-', 'B+', 'AB-', 'AB+'],
      'B+': ['B+', 'AB+'],
      'AB-': ['AB-', 'AB+'],
      'AB+': ['AB+'],
    };

    // Check if donor's blood type can be given to the requested blood type
    return compatibility[donorBloodType]?.includes(requestBloodType) || false;
  };

  // Function to create a notification for eligible donors
  const createNotification = async (bloodRequest: any, donorId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: donorId,
          title: `${bloodRequest.urgency_level === 'urgent' ? 'URGENT: ' : ''}Blood Request Match`,
          message: `Your blood type matches a request for ${bloodRequest.blood_type} at ${bloodRequest.hospital}.`,
          type: 'request',
          read: false,
          metadata: {
            requestId: bloodRequest.id,
            bloodType: bloodRequest.blood_type,
            hospital: bloodRequest.hospital,
            urgent: bloodRequest.urgency_level === 'urgent',
            patientName: bloodRequest.patient_name
          }
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  // Subscribe to new blood requests
  useEffect(() => {
    if (!enabled || !user) return;

    // Function to check donor eligibility and create notifications
    const handleNewBloodRequest = async (newRequest: any) => {
      try {
        console.log('New blood request received:', newRequest);
        
        // Get current user's donor profile if they're a donor
        const { data: donorData, error: donorError } = await supabase
          .from('donors')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (donorError && donorError.code !== 'PGRST116') {
          throw donorError;
        }

        // If user is a donor and they're eligible to donate for this request
        if (donorData && donorData.is_available) {
          const isEligible = isDonorEligibleForRequest(donorData.blood_type, newRequest.blood_type);
          
          if (isEligible) {
            console.log('User is eligible for this blood request');
            
            // Create a notification for this donor
            await createNotification(newRequest, user.id);
            
            // Display a toast notification with higher priority for urgent requests
            const isUrgent = newRequest.urgency_level === 'urgent';
            
            toast({
              title: `${isUrgent ? 'URGENT: ' : ''}Blood Request Match`,
              description: `Your blood type matches a request for ${newRequest.blood_type} at ${newRequest.hospital}.`,
              variant: isUrgent ? 'destructive' : 'default',
              duration: isUrgent ? 10000 : 5000, // Longer duration for urgent notifications
            });

            // Call the onNewRequest callback if provided
            if (onNewRequest) {
              onNewRequest(newRequest);
            }
          }
        }
      } catch (error) {
        console.error('Error processing new blood request:', error);
      }
    };

    console.log('Setting up real-time subscription for blood requests');
    
    // Set up a subscription to listen for new blood requests
    const channel = supabase
      .channel('public:blood_requests')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'blood_requests'
        },
        (payload) => {
          console.log('Real-time blood request received:', payload.new);
          handleNewBloodRequest(payload.new);
        }
      )
      .subscribe((status) => {
        console.log('Supabase channel status:', status);
      });

    setLoading(false);

    return () => {
      console.log('Cleaning up blood requests subscription');
      supabase.removeChannel(channel);
    };
  }, [user, enabled, toast, onNewRequest]);

  // Function to notify eligible donors for a specific blood request
  const notifyEligibleDonors = async (bloodRequestId: string) => {
    try {
      setLoading(true);
      
      // First, get the blood request details
      const { data: requestData, error: requestError } = await supabase
        .from('blood_requests')
        .select('*')
        .eq('id', bloodRequestId)
        .single();

      if (requestError) throw requestError;
      
      // Then, find all eligible donors
      const { data: donors, error: donorsError } = await supabase
        .from('donors')
        .select('*')
        .eq('is_available', true);

      if (donorsError) throw donorsError;
      
      // Filter eligible donors based on blood type compatibility
      const eligibleDonors = donors.filter(donor => 
        isDonorEligibleForRequest(donor.blood_type, requestData.blood_type)
      );
      
      // Create notifications for each eligible donor
      const notificationPromises = eligibleDonors.map(donor => 
        createNotification(requestData, donor.user_id)
      );
      
      await Promise.all(notificationPromises);
      
      toast({
        title: "Notifications Sent",
        description: `${eligibleDonors.length} eligible donors have been notified.`,
      });
      
      return eligibleDonors.length;
    } catch (error) {
      console.error('Error notifying eligible donors:', error);
      toast({
        title: "Error",
        description: "Failed to notify donors. Please try again.",
        variant: "destructive",
      });
      return 0;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    notifyEligibleDonors,
    isDonorEligibleForRequest
  };
};
