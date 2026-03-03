import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import Index from "./pages/Index";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminSettings from "./pages/AdminSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SignedIn>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </SignedIn>
        <SignedOut>
          <Routes>
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="*" element={
              <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <RedirectToSignIn />
              </div>
            } />
          </Routes>
        </SignedOut>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
