
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Droplets, 
  Heart, 
  Users, 
  Clock, 
  AlertCircle, 
  ArrowRight, 
  Search,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const bloodTypes = [
  { type: 'A+', donors: 87, receivers: 152, status: 'normal' },
  { type: 'B+', donors: 63, receivers: 108, status: 'normal' },
  { type: 'AB+', donors: 31, receivers: 47, status: 'low' },
  { type: 'O+', donors: 94, receivers: 178, status: 'normal' },
  { type: 'A-', donors: 18, receivers: 42, status: 'critical' },
  { type: 'B-', donors: 15, receivers: 38, status: 'critical' },
  { type: 'AB-', donors: 4, receivers: 12, status: 'critical' },
  { type: 'O-', donors: 22, receivers: 71, status: 'low' },
];

const testimonials = [
  {
    id: 1,
    name: 'Rahul Sharma',
    role: 'Engineering Student',
    content: "The blood donation process was smooth and the staff were incredibly helpful. I'm proud to have potentially saved lives.",
    bloodType: 'O+',
  },
  {
    id: 2,
    name: 'Priya Patel',
    role: 'Computer Science Student',
    content: "When my father needed blood urgently, MBM Blood Bank connected us with donors within minutes. Forever grateful!",
    bloodType: 'B+',
  },
  {
    id: 3,
    name: 'Amit Singh',
    role: 'Medical Student',
    content: "As a medical student, I know how critical blood donations are. This platform makes the process efficient and accessible.",
    bloodType: 'A+',
  },
];

const emergencyRequests = [
  { id: 1, bloodType: 'A-', location: 'MBM Hospital', timeAgo: '10 minutes ago', status: 'urgent' },
  { id: 2, bloodType: 'O+', location: 'City Hospital', timeAgo: '1 hour ago', status: 'fulfilled' },
  { id: 3, bloodType: 'B+', location: 'MBM Medical Center', timeAgo: '3 hours ago', status: 'pending' },
];

const Home = () => {
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
  const [searchBloodType, setSearchBloodType] = useState('all');
  const [searchLocation, setSearchLocation] = useState('');
  const [animateHero, setAnimateHero] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonialIndex(prev => 
        prev === testimonials.length - 1 ? 0 : prev + 1
      );
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setAnimateHero(true);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/donors', { 
      state: { 
        bloodType: searchBloodType === 'all' ? '' : searchBloodType, 
        location: searchLocation 
      } 
    });
  };

  return (
    <div className="w-full">
      <section className="relative bg-gradient-to-br from-blood-light/60 via-background to-background py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blood/5 rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className={`max-w-xl transition-all duration-1000 ${animateHero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <span className="chip bg-blood/10 text-blood mb-3 animate-fade-in">
                MBM University Blood Bank
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
                Donate Blood, <span className="text-blood">Save Lives</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 animation-delay-200 animate-fade-in">
                Join MBM University's blood donation network connecting donors with those in need. 
                Every donation can save up to three lives.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 animation-delay-300 animate-fade-in">
                <Button size="lg" className="btn-blood" asChild>
                  <Link to="/donate">
                    Become a Donor
                    <Heart className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/request">
                    Request Blood
                    <Droplets className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
            
            <div className={`grid grid-cols-2 gap-4 transition-all duration-1000 delay-300 ${animateHero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <Card className="glass animate-slide-up">
                <CardContent className="p-6">
                  <div className="rounded-full bg-blood/10 w-12 h-12 flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-blood" />
                  </div>
                  <h3 className="text-3xl font-bold mb-2">2,540+</h3>
                  <p className="text-muted-foreground">Registered Donors</p>
                </CardContent>
              </Card>
              
              <Card className="glass animation-delay-100 animate-slide-up">
                <CardContent className="p-6">
                  <div className="rounded-full bg-blood/10 w-12 h-12 flex items-center justify-center mb-4">
                    <Droplets className="h-6 w-6 text-blood" />
                  </div>
                  <h3 className="text-3xl font-bold mb-2">1,873+</h3>
                  <p className="text-muted-foreground">Lives Saved</p>
                </CardContent>
              </Card>
              
              <Card className="glass animation-delay-200 animate-slide-up">
                <CardContent className="p-6">
                  <div className="rounded-full bg-blood/10 w-12 h-12 flex items-center justify-center mb-4">
                    <Clock className="h-6 w-6 text-blood" />
                  </div>
                  <h3 className="text-3xl font-bold mb-2">24/7</h3>
                  <p className="text-muted-foreground">Emergency Support</p>
                </CardContent>
              </Card>
              
              <Card className="glass animation-delay-300 animate-slide-up">
                <CardContent className="p-6">
                  <div className="rounded-full bg-blood/10 w-12 h-12 flex items-center justify-center mb-4">
                    <AlertCircle className="h-6 w-6 text-blood" />
                  </div>
                  <h3 className="text-3xl font-bold mb-2">15 min</h3>
                  <p className="text-muted-foreground">Avg. Response Time</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Find Blood Donors</h2>
              <p className="text-muted-foreground">
                Search for compatible blood donors based on blood type and location
              </p>
            </div>
            
            <Card className="shadow-elevated">
              <CardContent className="p-6">
                <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">
                      Blood Type
                    </label>
                    <Select value={searchBloodType} onValueChange={setSearchBloodType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select blood type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
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
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">
                      Location
                    </label>
                    <Input 
                      type="text" 
                      placeholder="Enter city or area" 
                      value={searchLocation}
                      onChange={(e) => setSearchLocation(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex items-end">
                    <Button type="submit" className="w-full btn-blood">
                      <Search className="h-4 w-4 mr-2" />
                      Find Donors
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Current Blood Inventory</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              Check the current status of blood types available. Critical levels indicate urgent need for donations.
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-4">
            {bloodTypes.map((blood) => (
              <div 
                key={blood.type}
                className="bg-white rounded-lg shadow-subtle p-4 text-center animate-fade-in"
              >
                <div className={`text-2xl font-bold mb-2 ${
                  blood.status === 'critical' 
                    ? 'text-destructive' 
                    : blood.status === 'low' 
                      ? 'text-amber-500' 
                      : 'text-emerald-600'
                }`}>
                  {blood.type}
                </div>
                <div className={`inline-block chip text-xs ${
                  blood.status === 'critical' 
                    ? 'bg-destructive/10 text-destructive' 
                    : blood.status === 'low' 
                      ? 'bg-amber-100 text-amber-800' 
                      : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {blood.status === 'critical' 
                    ? 'Critical' 
                    : blood.status === 'low' 
                      ? 'Low' 
                      : 'Normal'}
                </div>
                <div className="mt-3 text-sm text-muted-foreground">
                  <div>{blood.donors} donors</div>
                  <div>{blood.receivers} receivers</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Recent Emergency Requests</h2>
              <p className="text-muted-foreground">
                Help save lives by responding to emergency blood requests
              </p>
            </div>
            <Button variant="link" asChild className="mt-2 md:mt-0">
              <Link to="/requests" className="flex items-center">
                View all requests
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {emergencyRequests.map((request) => (
              <Card key={request.id} className="overflow-hidden">
                <div 
                  className={`h-2 ${
                    request.status === 'urgent' 
                      ? 'bg-destructive' 
                      : request.status === 'fulfilled' 
                        ? 'bg-emerald-500' 
                        : 'bg-amber-400'
                  }`}
                ></div>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      <div className={`text-lg font-bold px-3 py-1 rounded ${
                        request.bloodType.includes('-') 
                          ? 'bg-red-100 text-blood' 
                          : 'bg-red-50 text-blood'
                      }`}>
                        {request.bloodType}
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium">{request.location}</p>
                        <p className="text-xs text-muted-foreground">{request.timeAgo}</p>
                      </div>
                    </div>
                    {request.status === 'fulfilled' && (
                      <div className="flex items-center text-emerald-600 text-sm">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        <span>Fulfilled</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4">
                    {request.status === 'urgent' ? (
                      <Button className="w-full btn-blood">Respond Now</Button>
                    ) : request.status === 'pending' ? (
                      <Button variant="outline" className="w-full">Respond</Button>
                    ) : (
                      <Button variant="ghost" className="w-full" disabled>Request Fulfilled</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      <section className="py-16 bg-blood/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Success Stories</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Hear from donors and recipients who have been part of our blood donation community
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="relative bg-white rounded-xl p-8 shadow-elevated">
              <div className="absolute -top-5 left-10">
                <div className="bg-blood text-white text-sm px-3 py-1 rounded-full">
                  {testimonials[currentTestimonialIndex].bloodType}
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-lg italic">"{testimonials[currentTestimonialIndex].content}"</p>
              </div>
              
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center">
                  <span className="text-lg font-bold">
                    {testimonials[currentTestimonialIndex].name.charAt(0)}
                  </span>
                </div>
                <div className="ml-4">
                  <p className="font-semibold">{testimonials[currentTestimonialIndex].name}</p>
                  <p className="text-sm text-muted-foreground">
                    {testimonials[currentTestimonialIndex].role}
                  </p>
                </div>
              </div>
              
              <div className="flex justify-center mt-6">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    className={`h-2 w-10 mx-1 rounded-full transition-all ${
                      index === currentTestimonialIndex ? 'bg-blood' : 'bg-secondary'
                    }`}
                    onClick={() => setCurrentTestimonialIndex(index)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section className="py-20 bg-gradient-to-br from-blood to-blood-dark text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Make a Difference?</h2>
            <p className="text-lg opacity-90 mb-8">
              Your donation matters. Join our community of blood donors and help save lives.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
                <Link to="/learn">Learn About Donation</Link>
              </Button>
              <Button size="lg" className="bg-white text-blood hover:bg-white/90" asChild>
                <Link to="/register">Register as Donor</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
