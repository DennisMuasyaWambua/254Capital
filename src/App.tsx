
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Public pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Services from "./pages/Services";
import AboutUs from "./pages/AboutUs";
import InvestorRelations from "./pages/InvestorRelations";
import FAQs from "./pages/FAQs";
import Contacts from "./pages/Contacts";

// Auth pages
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// Protected pages
import Dashboard from "./pages/Dashboard";
import Applications from "./pages/dashboard/Applications";
import ApplicationDetails from "./pages/dashboard/ApplicationDetails";
import EditApplication from "./pages/dashboard/EditApplication";
import NewApplication from "./pages/dashboard/NewApplication";
import Team from "./pages/dashboard/Team";
import Settings from "./pages/dashboard/Settings";

// No placeholder components needed

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/services" element={<Services />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/investor-relations" element={<InvestorRelations />} />
            <Route path="/faqs" element={<FAQs />} />
            <Route path="/contacts" element={<Contacts />} />
            
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/applications" element={<Applications />} />
              <Route path="/dashboard/applications/new" element={<NewApplication />} />
              <Route path="/dashboard/applications/:id" element={<ApplicationDetails />} />
              <Route path="/dashboard/applications/edit/:id" element={<EditApplication />} />
              <Route path="/dashboard/team" element={<Team />} />
              <Route path="/dashboard/settings" element={<Settings />} />
              {/* Add more protected routes here */}
            </Route>
            
            {/* Catch-all Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
