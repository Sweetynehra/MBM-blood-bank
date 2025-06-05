
import { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Droplet, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from '@/hooks/useNotifications';
import { useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";

interface Donor {
  id: string;
  blood_type: BloodType;
  contact_number: string;
  location: string;
  last_donation_date: string | null;
}

type BloodType = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
const BLOOD_TYPES: BloodType[] = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
type BloodTypeFilter = BloodType | "all";

const DonorsPage = () => {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [bloodTypeFilter, setBloodTypeFilter] = useState<BloodTypeFilter>("all");
  const [locationFilter, setLocationFilter] = useState('');
  const { toast } = useToast();
  const location = useLocation();
  const { notifications } = useNotifications();

  useEffect(() => {
    if (location.state) {
      const { bloodType, location: searchLocation } = location.state as { bloodType: string; location: string };
      if (bloodType) {
        // Ensure bloodType is a valid filter value
        if (bloodType === "all" || BLOOD_TYPES.includes(bloodType as BloodType)) {
          setBloodTypeFilter(bloodType as BloodTypeFilter);
        }
      }
      if (searchLocation) setLocationFilter(searchLocation);
    }
  }, [location]);

  useEffect(() => {
    const fetchDonors = async () => {
      try {
        setLoading(true);
        let query = supabase
          .from('donors')
          .select('*')
          .eq('is_available', true);

        if (bloodTypeFilter !== "all") {
          query = query.eq('blood_type', bloodTypeFilter);
        }

        if (locationFilter) {
          query = query.ilike('location', `%${locationFilter}%`);
        }

        const { data, error } = await query;

        if (error) {
          toast({
            title: "Error",
            description: "Failed to fetch donors. Please try again.",
            variant: "destructive"
          });
          throw error;
        }
        
        setDonors(data || []);

        if (data && data.length > 0 && (bloodTypeFilter !== "all" || locationFilter)) {
          toast({
            title: "Donors Found",
            description: `Found ${data.length} donor${data.length === 1 ? '' : 's'} matching your criteria.`,
          });
        } else if (data && data.length === 0) {
          toast({
            title: "No Donors Found",
            description: "No donors match your search criteria. Try adjusting your filters.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error fetching donors:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDonors();
  }, [bloodTypeFilter, locationFilter, toast]);

  const handleReset = () => {
    setBloodTypeFilter("all");
    setLocationFilter('');
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <span className="inline-block p-3 rounded-full bg-blood/10 text-blood mb-4">
          <Droplet className="h-6 w-6" />
        </span>
        <h1 className="text-3xl font-bold mb-2">Available Blood Donors</h1>
        <p className="text-muted-foreground">
          Find available donors in your area
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>Donor List</CardTitle>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select
                  value={bloodTypeFilter}
                  onValueChange={(value) => setBloodTypeFilter(value as BloodTypeFilter)}
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="Blood Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {BLOOD_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Filter by location..."
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="max-w-[200px]"
                />
                <Button variant="outline" onClick={handleReset}>
                  Reset
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blood"></div>
            </div>
          ) : donors.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No available donors found matching your criteria.</p>
              <Button variant="link" onClick={handleReset} className="mt-2">
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Blood Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Last Donation</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {donors.map((donor) => (
                    <TableRow key={donor.id}>
                      <TableCell>
                        <Badge variant="outline" className="font-semibold">
                          {donor.blood_type}
                        </Badge>
                      </TableCell>
                      <TableCell>{donor.location}</TableCell>
                      <TableCell>{donor.contact_number}</TableCell>
                      <TableCell>
                        {donor.last_donation_date 
                          ? new Date(donor.last_donation_date).toLocaleDateString() 
                          : 'Not available'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DonorsPage;
