import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  AlertCircle, 
  CalendarIcon, 
  Clock, 
  Droplets, 
  Info, 
  MapPin, 
  Phone,
  User, 
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from "@/integrations/supabase/client";

const requestFormSchema = z.object({
  patientName: z.string().min(2, 'Name must be at least 2 characters'),
  bloodType: z.string().min(1, 'Please select a blood type'),
  units: z.coerce.number().min(1, 'Minimum 1 unit').max(10, 'Maximum 10 units'),
  hospital: z.string().min(2, 'Hospital name is required'),
  location: z.string().min(2, 'Location is required'),
  requiredDate: z.date({
    required_error: 'Required date is required',
  }),
  contactName: z.string().min(2, 'Contact name is required'),
  contactPhone: z.string().min(10, 'Valid phone number is required').max(15),
  urgencyLevel: z.string().min(1, 'Please select urgency level'),
  additionalInfo: z.string().optional(),
});

type RequestFormValues = z.infer<typeof requestFormSchema>;

const bloodTypeCompatibility = {
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'A-': ['A-', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'B-': ['B-', 'O-'],
  'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  'AB-': ['A-', 'B-', 'AB-', 'O-'],
  'O+': ['O+', 'O-'],
  'O-': ['O-'],
};

const RequestBlood = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const form = useForm<RequestFormValues>({
    resolver: zodResolver(requestFormSchema),
    defaultValues: {
      patientName: '',
      bloodType: '',
      units: 1,
      hospital: '',
      location: '',
      requiredDate: new Date(),
      contactName: '',
      contactPhone: '',
      urgencyLevel: 'normal',
      additionalInfo: '',
    },
  });

  const selectedBloodType = form.watch('bloodType') as keyof typeof bloodTypeCompatibility;

  const compatibleDonors = selectedBloodType 
    ? bloodTypeCompatibility[selectedBloodType] || []
    : [];

  const onSubmit = async (data: RequestFormValues) => {
    setIsSubmitting(true);
    setErrorMsg(null);

    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) {
      setIsSubmitting(false);
      setErrorMsg("You must be logged in to submit a blood request.");
      toast({
        title: "Login Required",
        description: "Please log in to submit a blood request.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from("blood_requests")
      .insert([
        {
          user_id: user.id,
          patient_name: data.patientName,
          blood_type: data.bloodType,
          units: data.units,
          hospital: data.hospital,
          location: data.location,
          required_date: data.requiredDate?.toISOString().substring(0, 10),
          contact_name: data.contactName,
          contact_phone: data.contactPhone,
          urgency_level: data.urgencyLevel,
          additional_info: data.additionalInfo || null,
        },
      ]);

    if (error) {
      setIsSubmitting(false);
      setErrorMsg("There was a problem submitting your request. Please try again.");
      toast({
        title: "Submission Failed",
        description: error.message || "An error occurred.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Blood request submitted",
      description: "Matching donors will be notified shortly.",
    });

    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-md mx-auto text-center">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Request Submitted Successfully!</h1>
          <p className="text-muted-foreground mb-6">
            Your blood request has been submitted. We've already started notifying matching donors in your area.
          </p>
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="font-medium">Request ID</div>
                <div className="text-sm bg-secondary px-3 py-1 rounded-full">RQ-{Math.floor(100000 + Math.random() * 900000)}</div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Blood Type</div>
                  <div className="font-medium">{selectedBloodType}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Units</div>
                  <div className="font-medium">{form.getValues('units')}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Hospital</div>
                  <div className="font-medium">{form.getValues('hospital')}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Required Date</div>
                  <div className="font-medium">{format(form.getValues('requiredDate'), 'PPP')}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" asChild>
              <Link to="/dashboard">View Dashboard</Link>
            </Button>
            <Button className="btn-blood" asChild>
              <Link to="/">Return to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Request Blood</h1>
          <p className="text-muted-foreground">
            Fill out the form below to request blood for a patient
          </p>
        </div>
        {errorMsg && (
          <div className="mb-4 text-center text-red-600 bg-red-50 px-3 py-2 rounded">
            {errorMsg}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 order-2 md:order-1">
            <Card>
              <CardContent className="p-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold">Patient Information</h2>
                      
                      <FormField
                        control={form.control}
                        name="patientName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Patient Name</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter patient's full name" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="bloodType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Blood Type</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select blood type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="A+">A+</SelectItem>
                                  <SelectItem value="A-">A-</SelectItem>
                                  <SelectItem value="B+">B+</SelectItem>
                                  <SelectItem value="B-">B-</SelectItem>
                                  <SelectItem value="AB+">AB+</SelectItem>
                                  <SelectItem value="AB-">AB-</SelectItem>
                                  <SelectItem value="O+">O+</SelectItem>
                                  <SelectItem value="O-">O-</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="units"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Units Required</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number"
                                  min={1}
                                  max={10}
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                1-10 units
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4 pt-4 border-t">
                      <h2 className="text-xl font-semibold">Location Details</h2>
                      
                      <FormField
                        control={form.control}
                        name="hospital"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hospital/Clinic</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter hospital or clinic name" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="City, Area or Full Address" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="requiredDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Required Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) => date < new Date()}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="space-y-4 pt-4 border-t">
                      <h2 className="text-xl font-semibold">Contact Information</h2>
                      
                      <FormField
                        control={form.control}
                        name="contactName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Person</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Name of contact person" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="contactPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Phone</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Contact phone number" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="urgencyLevel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Urgency Level</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select urgency level" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="critical">Critical (Immediate)</SelectItem>
                                <SelectItem value="urgent">Urgent (Within 24 hours)</SelectItem>
                                <SelectItem value="normal">Normal (1-3 days)</SelectItem>
                                <SelectItem value="scheduled">Scheduled (Future date)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="additionalInfo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Additional Information</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Any additional details about the request" 
                                className="resize-none h-24"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="!mt-8">
                      <Button 
                        type="submit" 
                        className="w-full btn-blood" 
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit Blood Request'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
          
          <div className="order-1 md:order-2">
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex items-center mb-4">
                  <Droplets className="h-5 w-5 text-blood mr-2" />
                  <h3 className="font-medium">Compatible Donors</h3>
                </div>
                
                {selectedBloodType ? (
                  <div>
                    <div className="flex items-center mb-3">
                      <div className="text-lg font-bold px-3 py-1 rounded bg-red-100 text-blood mr-2">
                        {selectedBloodType}
                      </div>
                      <span>can receive from:</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-2">
                      {compatibleDonors.map((donor) => (
                        <div 
                          key={donor}
                          className="bg-secondary text-sm px-3 py-1 rounded-full"
                        >
                          {donor}
                        </div>
                      ))}
                    </div>
                    
                    <p className="text-xs text-muted-foreground mt-3">
                      <Info className="h-3 w-3 inline mr-1" />
                      We'll notify all compatible donors in your area.
                    </p>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    Select a blood type to see compatible donors
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex items-center mb-4">
                  <AlertCircle className="h-5 w-5 text-blood mr-2" />
                  <h3 className="font-medium">Important Information</h3>
                </div>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start">
                    <Clock className="h-4 w-4 text-muted-foreground mr-2 mt-0.5 shrink-0" />
                    <span>Urgent requests are processed with higher priority</span>
                  </li>
                  <li className="flex items-start">
                    <User className="h-4 w-4 text-muted-foreground mr-2 mt-0.5 shrink-0" />
                    <span>Ensure patient and contact details are accurate</span>
                  </li>
                  <li className="flex items-start">
                    <MapPin className="h-4 w-4 text-muted-foreground mr-2 mt-0.5 shrink-0" />
                    <span>Specific location helps us find nearby donors</span>
                  </li>
                  <li className="flex items-start">
                    <Phone className="h-4 w-4 text-muted-foreground mr-2 mt-0.5 shrink-0" />
                    <span>Keep your phone accessible for verification</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="bg-blood text-blood-foreground">
              <CardContent className="p-4">
                <div className="text-center py-2">
                  <h3 className="font-medium mb-2">24/7 Emergency Helpline</h3>
                  <p className="text-xl font-bold">1800-BLOOD-HELP</p>
                  <p className="text-sm mt-2 text-white/80">
                    Call for immediate assistance with critical cases
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestBlood;
