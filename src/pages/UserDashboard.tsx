
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Activity, List, Bell, Droplet, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNotifications } from "@/hooks/useNotifications";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

// Statistics and types
interface BloodRequest {
  id: string;
  blood_type: string;
  hospital: string;
  status: string;
  created_at: string;
  units: number;
  location: string | null;
}

interface Donation {
  id: string;
  blood_type: string;
  location: string;
  last_donation_date: string;
  hospital: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export default function UserDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { fetchNotifications } = useNotifications();
  const [donationCount, setDonationCount] = useState<number>(0);
  const [receivedCount, setReceivedCount] = useState<number>(0);
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [eligibleRequests, setEligibleRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create a reusable fetchStats function
  const fetchStats = useCallback(async () => {
    if (!user) return;
    
    console.log("Fetching dashboard stats for user:", user.id);
    setLoading(true);
    setError(null); // Reset error state

    try {
      // Fetch stats for donations made (as donor)
      const { data: donor, error: donorError } = await supabase
        .from("donors")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (donorError) {
        console.error("Error fetching donor data:", donorError);
        if (donorError.code !== "PGRST116") { // Not found error is ok
          toast({
            title: "Error fetching donor data",
            description: donorError.message,
            variant: "destructive",
          });
        }
      }
      
      setDonationCount(donor?.last_donation_date ? 1 : 0);

      // Fetch donations received (as receiver)
      const { data: userRequests, error: requestsError } = await supabase
        .from("blood_requests")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      if (requestsError) {
        console.error("Error fetching user requests:", requestsError);
        toast({
          title: "Error fetching blood requests",
          description: requestsError.message,
          variant: "destructive",
        });
        setRequests([]);
      } else {
        console.log("User requests fetched:", userRequests);
        setRequests(userRequests || []);
        setReceivedCount(userRequests?.length || 0);
      }

      // Fetch donation history (donor)
      if (donor) {
        const { data: donationsData, error: donationsError } = await supabase
          .from("blood_requests")
          .select("*")
          .eq("blood_type", donor.blood_type)
          .eq("status", "completed")
          .order("created_at", { ascending: false });
        
        if (donationsError) {
          console.error("Error fetching donation history:", donationsError);
          setDonations([]);
        } else {
          console.log("Donation history fetched:", donationsData);
          setDonations(
            (donationsData || []).map((req) => ({
              id: req.id,
              blood_type: req.blood_type,
              location: req.location || "Unknown",
              last_donation_date: donor.last_donation_date,
              hospital: req.hospital,
            }))
          );
        }
      } else {
        setDonations([]);
      }

      // Fetch notifications
      const { data: notificationsData, error: notificationsError } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);
      
      if (notificationsError) {
        console.error("Error fetching notifications:", notificationsError);
        setNotifications([]);
      } else {
        console.log("Notifications fetched:", notificationsData);
        setNotifications(notificationsData || []);
      }

      // Fetch eligible requests (they could donate to)
      if (donor) {
        try {
          // Blood type compatibility logic
          const bloodTypeMap: Record<string, string[]> = {
            "O-": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
            "O+": ["O+", "A+", "B+", "AB+"],
            "A-": ["A-", "A+", "AB-", "AB+"],
            "A+": ["A+", "AB+"],
            "B-": ["B-", "B+", "AB-", "AB+"],
            "B+": ["B+", "AB+"],
            "AB-": ["AB-", "AB+"],
            "AB+": ["AB+"],
          };
          
          const { data: bloodRequests, error: eligibleError } = await supabase
            .from("blood_requests")
            .select("*")
            .eq("status", "pending");
          
          if (eligibleError) {
            console.error("Error fetching eligible requests:", eligibleError);
            setEligibleRequests([]);
          } else {
            console.log("Eligible requests fetched:", bloodRequests);
            const eligibleBloodRequests =
              (bloodRequests || []).filter((req) =>
                bloodTypeMap[donor.blood_type]?.includes(req.blood_type)
              ) || [];
            setEligibleRequests(eligibleBloodRequests);
          }
        } catch (err) {
          console.error("Error processing eligible requests:", err);
          setEligibleRequests([]);
        }
      } else {
        setEligibleRequests([]);
      }
    } catch (err: any) {
      console.error("Error loading dashboard:", err);
      setError(err.message || "Failed to load dashboard data");
      toast({
        title: "Error loading dashboard",
        description: err.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [user, toast]);

  // Initial data fetch
  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user, fetchStats]);

  // Set up real-time listeners for database changes
  useEffect(() => {
    if (!user) return;

    console.log("Setting up real-time channels for dashboard");
    
    // Channel for blood_requests table - watch for ANY changes to this table
    const requestsChannel = supabase
      .channel('dashboard-blood-requests')
      .on(
        'postgres_changes',
        { 
          event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'blood_requests'
        },
        (payload) => {
          console.log('Blood request changed:', payload);
          toast({
            title: "Blood request updated",
            description: "Refreshing dashboard with latest data...",
          });
          fetchStats(); // Refresh all data when any blood request changes
        }
      )
      .subscribe((status) => {
        console.log('Blood requests channel status:', status);
      });

    // Channel for notifications table
    const notificationsChannel = supabase
      .channel('dashboard-notifications')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Notification changed:', payload);
          fetchStats(); // Refresh data when notifications change
          fetchNotifications(); // Also refresh notifications using the hook
        }
      )
      .subscribe((status) => {
        console.log('Notifications channel status:', status);
      });

    // Channel for donors table
    const donorsChannel = supabase
      .channel('dashboard-donors')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public',
          table: 'donors',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Donor data changed:', payload);
          toast({
            title: "Donor profile updated",
            description: "Refreshing dashboard with latest data...",
          });
          fetchStats(); // Refresh data when donor info changes
        }
      )
      .subscribe((status) => {
        console.log('Donors channel status:', status);
      });

    // Cleanup function to remove channels on unmount
    return () => {
      console.log('Cleaning up dashboard real-time subscriptions');
      supabase.removeChannel(requestsChannel);
      supabase.removeChannel(notificationsChannel);
      supabase.removeChannel(donorsChannel);
    };
  }, [user, fetchStats, fetchNotifications]);

  // Manual refresh function
  const handleRefresh = () => {
    setIsRefreshing(true);
    toast({
      title: "Refreshing dashboard",
      description: "Getting your latest data...",
    });
    fetchStats();
  };

  if (loading && !requests.length && !notifications.length) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blood"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Dashboard</h1>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh} 
          disabled={isRefreshing}
          className="flex items-center gap-2"
        >
          {isRefreshing ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Refresh
        </Button>
      </div>
      
      {error && (
        <Card className="mb-8 border-red-500">
          <CardContent className="pt-6">
            <p className="text-red-500">Error: {error}</p>
            <p className="text-sm text-muted-foreground mt-2">
              There was a problem loading your dashboard data. You can try refreshing the page or clicking the refresh button above.
            </p>
          </CardContent>
        </Card>
      )}
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="text-blood" />
            Personal Statistics
          </CardTitle>
          <CardDescription>
            Overview of your blood donations and requests.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-8">
          <div className="text-center">
            <div className="text-lg font-semibold text-blood">{donationCount}</div>
            <div className="text-xs text-muted-foreground">Donations Made</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-blood">{receivedCount}</div>
            <div className="text-xs text-muted-foreground">Requests Made</div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="requests" className="w-full">
        <TabsList className="mb-4 w-full flex flex-wrap gap-2">
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <List className="mr-1" /> Blood Requests History
          </TabsTrigger>
          <TabsTrigger value="donations" className="flex items-center gap-2">
            <List className="mr-1" /> Donation History
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="mr-1" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="eligible" className="flex items-center gap-2">
            <Droplet className="mr-1" /> Eligible Requests
          </TabsTrigger>
        </TabsList>

        {/* Blood Requests History */}
        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle>
                <List className="inline size-6 mr-2" />
                Your Blood Requests
              </CardTitle>
              <CardDescription>
                Track your submitted blood requests.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {requests.length === 0 ? (
                <p className="text-muted-foreground">No blood requests found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Units</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Hospital</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {requests.map((req) => (
                        <TableRow key={req.id}>
                          <TableCell>{new Date(req.created_at).toLocaleString()}</TableCell>
                          <TableCell>{req.blood_type}</TableCell>
                          <TableCell>{req.units}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded text-xs ${
                              req.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                              req.status === 'completed' ? 'bg-green-100 text-green-800' : 
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {req.status}
                            </span>
                          </TableCell>
                          <TableCell>{req.hospital}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Donation History */}
        <TabsContent value="donations">
          <Card>
            <CardHeader>
              <CardTitle>
                <List className="inline size-6 mr-2" />
                Donation History
              </CardTitle>
              <CardDescription>
                Your record of blood donations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {donations.length === 0 ? (
                <p className="text-muted-foreground">No donation history.</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Hospital</TableHead>
                        <TableHead>Location</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {donations.map((don) => (
                        <TableRow key={don.id}>
                          <TableCell>{don.last_donation_date ? new Date(don.last_donation_date).toLocaleString() : "--"}</TableCell>
                          <TableCell>{don.blood_type}</TableCell>
                          <TableCell>{don.hospital}</TableCell>
                          <TableCell>{don.location}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>
                <Bell className="inline size-6 mr-2" />
                Your Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <p className="text-muted-foreground">No notifications yet.</p>
              ) : (
                <ul className="divide-y">
                  {notifications.map((notif) => (
                    <li key={notif.id} className="py-3 px-2 hover:bg-slate-50 rounded-lg transition-colors">
                      <div className="flex items-center gap-2">
                        <span className={notif.read ? "text-gray-600" : "font-semibold"}>
                          {notif.title}
                        </span>
                        {!notif.read && (
                          <span className="ml-2 bg-blood text-white rounded px-2 text-xs">New</span>
                        )}
                      </div>
                      <div className="text-sm mt-1">{notif.message}</div>
                      <div className="text-xs text-muted-foreground mt-1">{new Date(notif.created_at).toLocaleString()}</div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Currently eligible blood requests */}
        <TabsContent value="eligible">
          <Card>
            <CardHeader>
              <CardTitle>
                <Droplet className="inline size-6 mr-2" />
                Requests You Can Help With
              </CardTitle>
              <CardDescription>
                Blood requests that match your blood type and availability.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {eligibleRequests.length === 0 ? (
                <p className="text-muted-foreground">
                  No current matching requests.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Blood Type</TableHead>
                        <TableHead>Units Needed</TableHead>
                        <TableHead>Hospital</TableHead>
                        <TableHead>Location</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {eligibleRequests.map((req) => (
                        <TableRow key={req.id}>
                          <TableCell>{new Date(req.created_at).toLocaleString()}</TableCell>
                          <TableCell>
                            <span className="font-medium text-blood">{req.blood_type}</span>
                          </TableCell>
                          <TableCell>{req.units}</TableCell>
                          <TableCell>{req.hospital}</TableCell>
                          <TableCell>{req.location || "Not specified"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
