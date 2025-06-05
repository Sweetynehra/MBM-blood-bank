
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  MapPin, 
  Calendar, 
  Clock, 
  Phone, 
  Check, 
  X, 
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Droplets,
  MessageSquare,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Mock request data
const bloodRequest = {
  id: 'RQ-573829',
  patientName: 'Rahul Sharma',
  bloodType: 'B+',
  units: 2,
  hospital: 'MBM University Hospital',
  location: 'Jodhpur, Rajasthan',
  requiredDate: new Date('2023-08-15T10:00:00'),
  createdAt: new Date('2023-08-13T14:30:00'),
  urgencyLevel: 'urgent',
  contactName: 'Amit Sharma',
  contactPhone: '+91 9876543210',
  additionalInfo: 'Patient is undergoing surgery. Blood needed for operation.',
  status: 'active',
};

// Mock donor data (current user)
const donor = {
  id: 'D-123456',
  name: 'Priya Patel',
  bloodType: 'B+',
  lastDonation: new Date('2023-06-10'),
  eligibleToday: true,
  donationsCount: 5,
};

const DonorResponse = () => {
  const [showDetails, setShowDetails] = useState(false);
  const [isAcceptDialogOpen, setIsAcceptDialogOpen] = useState(false);
  const [isDeclineDialogOpen, setIsDeclineDialogOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [additionalMessage, setAdditionalMessage] = useState('');
  const [donorAvailabilityTime, setDonorAvailabilityTime] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Format date to readable string
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Format time to readable string
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get time difference in hours
  const getTimeDifference = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHrs < 1) {
      return 'Just now';
    } else if (diffHrs === 1) {
      return '1 hour ago';
    } else if (diffHrs < 24) {
      return `${diffHrs} hours ago`;
    } else {
      const days = Math.floor(diffHrs / 24);
      return days === 1 ? '1 day ago' : `${days} days ago`;
    }
  };
  
  // Handle accept request
  const handleAccept = () => {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Request accepted:', {
        requestId: bloodRequest.id,
        donorId: donor.id,
        availabilityTime: donorAvailabilityTime,
        message: additionalMessage
      });
      
      // Show success toast
      toast({
        title: "Thank you for your response!",
        description: "The recipient has been notified of your availability.",
      });
      
      setIsSubmitting(false);
      setIsAcceptDialogOpen(false);
      
      // Navigate to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    }, 1500);
  };
  
  // Handle decline request
  const handleDecline = () => {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Request declined:', {
        requestId: bloodRequest.id,
        donorId: donor.id,
        reason: declineReason
      });
      
      // Show info toast
      toast({
        title: "Response recorded",
        description: "Thank you for letting us know.",
      });
      
      setIsSubmitting(false);
      setIsDeclineDialogOpen(false);
      
      // Navigate to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    }, 1500);
  };
  
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-center mb-8">
          <div className="bg-red-50 rounded-full p-4">
            <Droplets className="h-8 w-8 text-blood" />
          </div>
        </div>
        
        <Card className="mb-8 shadow-elevated overflow-hidden">
          <div className="h-2 bg-amber-400"></div>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <div>
                <Badge variant="outline" className="mb-2">
                  {bloodRequest.id}
                </Badge>
                <h1 className="text-2xl font-bold mb-1">Blood Donation Request</h1>
                <p className="text-muted-foreground">
                  {getTimeDifference(bloodRequest.createdAt)}
                </p>
              </div>
              
              <div className="mt-4 md:mt-0">
                <Badge variant={
                  bloodRequest.urgencyLevel === 'critical' 
                    ? 'destructive' 
                    : bloodRequest.urgencyLevel === 'urgent'
                      ? 'default'
                      : 'secondary'
                }>
                  {bloodRequest.urgencyLevel === 'critical' 
                    ? 'Critical' 
                    : bloodRequest.urgencyLevel === 'urgent'
                      ? 'Urgent'
                      : 'Normal'} Request
                </Badge>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <div className="flex items-center mb-4">
                  <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
                    <Droplets className="h-5 w-5 text-blood" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Blood Type</div>
                    <div className="font-semibold text-xl">{bloodRequest.bloodType}</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-start">
                    <User className="h-4 w-4 text-muted-foreground mt-1 mr-2" />
                    <div>
                      <div className="text-sm text-muted-foreground">Patient</div>
                      <div>{bloodRequest.patientName}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-1 mr-2" />
                    <div>
                      <div className="text-sm text-muted-foreground">Hospital</div>
                      <div>{bloodRequest.hospital}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="flex items-start mb-4">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-1 mr-2" />
                  <div>
                    <div className="text-sm text-muted-foreground">Required Date</div>
                    <div className="font-medium">{formatDate(bloodRequest.requiredDate)}</div>
                  </div>
                </div>
                
                <div className="flex items-start mb-4">
                  <Clock className="h-4 w-4 text-muted-foreground mt-1 mr-2" />
                  <div>
                    <div className="text-sm text-muted-foreground">Required Time</div>
                    <div className="font-medium">{formatTime(bloodRequest.requiredDate)}</div>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <AlertCircle className="h-4 w-4 text-muted-foreground mt-1 mr-2" />
                  <div>
                    <div className="text-sm text-muted-foreground">Units Required</div>
                    <div className="font-medium">{bloodRequest.units} unit(s)</div>
                  </div>
                </div>
              </div>
            </div>
            
            <Button 
              variant="link" 
              onClick={() => setShowDetails(!showDetails)}
              className="p-0 h-auto text-muted-foreground font-normal flex items-center"
            >
              {showDetails ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Hide details
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  Show more details
                </>
              )}
            </Button>
            
            {showDetails && (
              <div className="mt-4 pt-4 border-t">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Contact Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <User className="h-4 w-4 text-muted-foreground mt-1 mr-2" />
                        <div>
                          <div className="text-sm text-muted-foreground">Contact Person</div>
                          <div>{bloodRequest.contactName}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <Phone className="h-4 w-4 text-muted-foreground mt-1 mr-2" />
                        <div>
                          <div className="text-sm text-muted-foreground">Phone</div>
                          <div>{bloodRequest.contactPhone}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-3">Additional Information</h3>
                    <p className="text-sm">
                      {bloodRequest.additionalInfo || "No additional information provided."}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Donor Information */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">Your Donor Information</h2>
            
            <div className="flex items-center mb-6">
              <Avatar className="h-12 w-12 mr-4">
                <AvatarFallback className="bg-secondary">
                  {donor.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <div className="font-medium">{donor.name}</div>
                <div className="text-sm text-muted-foreground">
                  Blood Type: <span className="font-medium">{donor.bloodType}</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="bg-secondary/50 rounded-lg p-3 text-center">
                <div className="text-sm text-muted-foreground">Last Donation</div>
                <div className="font-medium">
                  {formatDate(donor.lastDonation)}
                </div>
              </div>
              
              <div className="bg-secondary/50 rounded-lg p-3 text-center">
                <div className="text-sm text-muted-foreground">Donations</div>
                <div className="font-medium">{donor.donationsCount}</div>
              </div>
              
              <div className={`rounded-lg p-3 text-center ${
                donor.eligibleToday 
                  ? 'bg-green-50 text-green-800' 
                  : 'bg-red-50 text-red-800'
              }`}>
                <div className="text-sm opacity-80">Eligibility</div>
                <div className="font-medium">
                  {donor.eligibleToday ? 'Eligible to Donate' : 'Not Eligible Today'}
                </div>
              </div>
            </div>
            
            {!donor.eligibleToday && (
              <div className="flex items-center bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-800 text-sm">
                <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
                <p>
                  You may not be eligible to donate at this time. Please review the donation 
                  criteria before proceeding.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* FAQs */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">Frequently Asked Questions</h2>
            
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-sm font-medium">
                  What happens after I accept a blood donation request?
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  After accepting a request, the recipient and hospital will be notified. You'll receive 
                  contact information and directions to the donation center. You can coordinate timing 
                  with the recipient directly.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2">
                <AccordionTrigger className="text-sm font-medium">
                  Can I change my mind after accepting?
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  Yes, but please inform the recipient as soon as possible. You can cancel your commitment 
                  through your dashboard or by contacting our helpline.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3">
                <AccordionTrigger className="text-sm font-medium">
                  What should I do to prepare for blood donation?
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  Eat a healthy meal, stay hydrated, avoid fatty foods, get adequate rest, 
                  and bring valid ID. Wear comfortable clothing with sleeves that can be rolled up.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
        
        {/* Response Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            variant="outline" 
            className="flex-1 border-destructive text-destructive hover:bg-destructive/10"
            onClick={() => setIsDeclineDialogOpen(true)}
          >
            <X className="h-4 w-4 mr-2" />
            Decline Request
          </Button>
          
          <Button 
            className="flex-1 btn-blood"
            onClick={() => setIsAcceptDialogOpen(true)}
          >
            <Check className="h-4 w-4 mr-2" />
            Accept Request
          </Button>
        </div>
        
        {/* Accept Dialog */}
        <Dialog open={isAcceptDialogOpen} onOpenChange={setIsAcceptDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Accept Blood Donation Request</DialogTitle>
              <DialogDescription>
                Thank you for your willingness to donate! Please provide some additional information.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  When can you come to donate?
                </label>
                <Input 
                  type="text" 
                  placeholder="e.g., Tomorrow at 10 AM" 
                  value={donorAvailabilityTime}
                  onChange={(e) => setDonorAvailabilityTime(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Additional Message (Optional)
                </label>
                <Textarea 
                  placeholder="Any message to the recipient or hospital" 
                  className="resize-none h-20"
                  value={additionalMessage}
                  onChange={(e) => setAdditionalMessage(e.target.value)}
                />
              </div>
              
              <div className="flex items-start bg-blue-50 border border-blue-100 rounded-lg p-3 text-blue-800 text-sm">
                <MessageSquare className="h-5 w-5 mr-2 flex-shrink-0" />
                <p>
                  The recipient will receive your contact information. The donation center 
                  will contact you to confirm your appointment.
                </p>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsAcceptDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                className="btn-blood" 
                onClick={handleAccept}
                disabled={isSubmitting || !donorAvailabilityTime}
              >
                {isSubmitting ? 'Submitting...' : 'Confirm Donation'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Decline Dialog */}
        <Dialog open={isDeclineDialogOpen} onOpenChange={setIsDeclineDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Decline Blood Donation Request</DialogTitle>
              <DialogDescription>
                We understand that you may not be able to donate at this time. Please let us know why.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Reason for declining (Optional)
                </label>
                <Textarea 
                  placeholder="Please share why you're unable to donate at this time" 
                  className="resize-none h-24"
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  This information helps us improve our matching system and is kept confidential.
                </p>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsDeclineDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDecline}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Decline Request'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default DonorResponse;
