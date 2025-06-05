import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PageLayout from "./components/layout/PageLayout";
import Home from "./pages/Home";
import About from "./pages/About";
import RequestBlood from "./pages/RequestBlood";
import DonorResponse from "./pages/DonorResponse";
import NotFound from "./pages/NotFound";
import AuthForm from "./components/auth/AuthForm";
import DonationForm from "./pages/Donate";
import DonorsPage from "./pages/Donors";
import AdminPanel from "./pages/AdminPanel";
import Notifications from "./pages/Notifications";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Profile from "./pages/Profile";
import UserDashboard from "./pages/UserDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<PageLayout><Home /></PageLayout>} />
            <Route path="/about" element={<PageLayout><About /></PageLayout>} />
            <Route path="/donors" element={<PageLayout><DonorsPage /></PageLayout>} />
            {/* Add dashboard route */}
            <Route path="/dashboard" element={<PageLayout><UserDashboard /></PageLayout>} />

            {/* Auth routes */}
            <Route path="/login" element={<PageLayout><div className="container mx-auto px-4 py-12"><AuthForm type="login" /></div></PageLayout>} />
            <Route path="/register" element={<PageLayout><div className="container mx-auto px-4 py-12"><AuthForm type="register" /></div></PageLayout>} />
            <Route path="/register-donor" element={<PageLayout><div className="container mx-auto px-4 py-12"><AuthForm type="registerDonor" /></div></PageLayout>} />
            
            {/* Protected routes - require authentication */}
            <Route element={<ProtectedRoute />}>
              <Route path="/request" element={<PageLayout><RequestBlood /></PageLayout>} />
              <Route path="/donor-response" element={<PageLayout><DonorResponse /></PageLayout>} />
              <Route path="/donate" element={<PageLayout><DonationForm /></PageLayout>} />
              <Route path="/notifications" element={<PageLayout><Notifications /></PageLayout>} />
              <Route path="/profile" element={<PageLayout><Profile /></PageLayout>} />
            </Route>
            
            {/* Admin routes */}
            <Route 
              path="/admin/*" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminPanel />
                </ProtectedRoute>
              } 
            />
            
            {/* Not found route */}
            <Route path="*" element={<PageLayout><NotFound /></PageLayout>} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
