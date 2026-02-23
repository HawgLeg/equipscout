import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Results from "./pages/Results";
import ListingDetail from "./pages/ListingDetail";
import NotFound from "./pages/NotFound";

// Legal pages
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Disclaimer from "./pages/Disclaimer";

// Admin pages
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminVendors from "./pages/admin/Vendors";
import AdminBilling from "./pages/admin/Billing";
import AdminReports from "./pages/admin/Reports";
import { AdminProtectedRoute } from "./components/admin/AdminProtectedRoute";

// Vendor pages
import VendorLogin from "./pages/vendor/Login";
import VendorJoin from "./pages/VendorJoin";
import VendorDashboard from "./pages/vendor/Dashboard";
import VendorEquipment from "./pages/vendor/Equipment";
import VendorProfile from "./pages/vendor/Profile";
import { VendorLayout } from "./components/vendor/VendorLayout";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/results" element={<Results />} />
          <Route path="/listing/:id" element={<ListingDetail />} />

          {/* Admin routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <AdminProtectedRoute>
                <AdminDashboard />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/vendors"
            element={
              <AdminProtectedRoute>
                <AdminVendors />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/billing"
            element={
              <AdminProtectedRoute>
                <AdminBilling />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <AdminProtectedRoute>
                <AdminReports />
              </AdminProtectedRoute>
            }
          />

          {/* Vendor routes */}
          <Route path="/vendor/login" element={<VendorLogin />} />
          <Route path="/vendors/join" element={<VendorJoin />} />
          <Route
            path="/vendor"
            element={
              <ProtectedRoute>
                <VendorLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<VendorDashboard />} />
            <Route path="equipment" element={<VendorEquipment />} />
            <Route path="profile" element={<VendorProfile />} />
          </Route>

          {/* Legal pages */}
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/disclaimer" element={<Disclaimer />} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
