import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Donor {
  id: string;
  blood_type: string;
  contact_number: string;
  location: string;
  last_donation_date: string | null;
  is_available: boolean | null;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  user_id: string;
  created_at: string;
  type: string;
  read: boolean;
  metadata?: any;
}

export default function AdminPanel() {
  const location = useLocation();
  const navigate = useNavigate();
  const [donors, setDonors] = useState<Donor[]>([]);
  const [donorsLoading, setDonorsLoading] = useState(false);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  // Decide which section to show based on route
  let section: "dashboard" | "donors" | "notifications" = "dashboard";
  if (location.pathname === "/admin/donors") section = "donors";
  if (location.pathname === "/admin/notifications") section = "notifications";

  useEffect(() => {
    if (section === "donors") {
      setDonorsLoading(true);
      supabase
        .from("donors")
        .select("*")
        .order("created_at", { ascending: false })
        .then(({ data, error }) => {
          if (!error && data) setDonors(data as Donor[]);
          setDonorsLoading(false);
        });
    }
    if (section === "notifications") {
      setNotificationsLoading(true);
      supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .then(({ data, error }) => {
          if (!error && data) setNotifications(data as Notification[]);
          setNotificationsLoading(false);
        });
    }
  }, [section]);

  // Redirect /admin root to /admin/donors for now
  useEffect(() => {
    if (location.pathname === "/admin") {
      navigate("/admin/donors", { replace: true });
    }
  }, [location, navigate]);

  return (
    <div className="min-h-screen flex bg-muted">
      <AdminSidebar />
      <main className="flex-1 p-6">
        {/* You can add a note for reassurance */}
        <div className="mb-4">
          <span className="text-xs bg-green-50 text-green-800 px-2 py-1 rounded">
            <b>Admin Access:</b> You are viewing as admin.
          </span>
        </div>
        {section === "donors" && (
          <Card>
            <CardHeader>
              <CardTitle>Manage Donors</CardTitle>
            </CardHeader>
            <CardContent>
              {donorsLoading ? (
                <p className="py-4">Loading donors...</p>
              ) : donors.length === 0 ? (
                <p className="py-4">No donors found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Blood Type</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Availability</TableHead>
                        <TableHead>Last Donation</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {donors.map((donor) => (
                        <TableRow key={donor.id}>
                          <TableCell>
                            <Badge variant="outline">{donor.blood_type}</Badge>
                          </TableCell>
                          <TableCell>{donor.location}</TableCell>
                          <TableCell>{donor.contact_number}</TableCell>
                          <TableCell>
                            {donor.is_available ? (
                              <Badge variant="secondary">Available</Badge>
                            ) : (
                              <Badge variant="destructive">Unavailable</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {donor.last_donation_date
                              ? new Date(donor.last_donation_date).toLocaleDateString()
                              : "Not available"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
        {section === "notifications" && (
          <Card>
            <CardHeader>
              <CardTitle>Manage Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              {notificationsLoading ? (
                <p className="py-4">Loading notifications...</p>
              ) : notifications.length === 0 ? (
                <p className="py-4">No notifications found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead>User ID</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Read</TableHead>
                        <TableHead>Created At</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {notifications.map((notif) => (
                        <TableRow key={notif.id}>
                          <TableCell>{notif.title}</TableCell>
                          <TableCell>{notif.message}</TableCell>
                          <TableCell>
                            <span className="text-xs">{notif.user_id}</span>
                          </TableCell>
                          <TableCell>{notif.type}</TableCell>
                          <TableCell>
                            {notif.read ? (
                              <Badge variant="secondary">Read</Badge>
                            ) : (
                              <Badge variant="outline">Unread</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {notif.created_at
                              ? new Date(notif.created_at).toLocaleString()
                              : ""}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
