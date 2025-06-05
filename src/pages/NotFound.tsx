
import { Link } from "react-router-dom";
import { Droplets, Home, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <div className="min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center px-4 text-center">
      <div className="bg-red-50 rounded-full p-6 mb-6">
        <AlertCircle className="h-12 w-12 text-blood" />
      </div>
      
      <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
      
      <p className="text-xl text-muted-foreground mb-8 max-w-md">
        The page you're looking for doesn't exist or has been moved.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Button variant="outline" asChild>
          <Link to="/request">
            <Droplets className="mr-2 h-4 w-4" />
            Request Blood
          </Link>
        </Button>
        
        <Button className="btn-blood" asChild>
          <Link to="/">
            <Home className="mr-2 h-4 w-4" />
            Return Home
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
