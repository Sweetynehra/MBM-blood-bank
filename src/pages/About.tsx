
import { Book, Heart, Users, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const About = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl font-bold mb-6">About MBM Blood Bank</h1>
        <p className="text-lg text-muted-foreground">
          Connecting our university community through life-saving blood donations.
        </p>
      </div>

      {/* Mission Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-16">
        <Card>
          <CardContent className="p-6">
            <div className="rounded-full bg-blood/10 w-12 h-12 flex items-center justify-center mb-4">
              <Heart className="h-6 w-6 text-blood" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Our Mission</h3>
            <p className="text-muted-foreground">
              To ensure every student and staff member at MBM University has access to safe and timely blood donations when needed.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="rounded-full bg-blood/10 w-12 h-12 flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-blood" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Community Impact</h3>
            <p className="text-muted-foreground">
              Building a strong network of donors within our university community to support emergency medical needs.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="rounded-full bg-blood/10 w-12 h-12 flex items-center justify-center mb-4">
              <Book className="h-6 w-6 text-blood" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Education</h3>
            <p className="text-muted-foreground">
              Promoting awareness about blood donation and its importance in saving lives through campus initiatives.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Content Sections */}
      <div className="max-w-3xl mx-auto space-y-12">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Who We Are</h2>
          <p className="text-muted-foreground mb-4">
            MBM Blood Bank is a student-led initiative at MBM University, dedicated to managing and facilitating blood donations within our campus community. We work closely with local hospitals and medical facilities to ensure a steady supply of blood for those in need.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
          <div className="space-y-4 text-muted-foreground">
            <p>1. Register as a donor through our platform</p>
            <p>2. Receive notifications when your blood type is needed</p>
            <p>3. Respond to requests and coordinate donation timing</p>
            <p>4. Complete your donation at our partner medical facilities</p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-muted-foreground mb-4">
                <Mail className="h-5 w-5 text-blood" />
                <span>Have questions? We're here to help!</span>
              </div>
              <Button className="btn-blood w-full sm:w-auto">
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default About;
