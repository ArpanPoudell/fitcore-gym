import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider, useAuth } from "@/lib/auth";
import DashboardLayout from "@/components/DashboardLayout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminPlans from "./pages/admin/AdminPlans";
import AdminMembers from "./pages/admin/AdminMembers";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminAttendance from "./pages/admin/AdminAttendance";
import AdminExpiring from "./pages/admin/AdminExpiring";
import MemberDashboard from "./pages/member/MemberDashboard";
import MemberPlans from "./pages/member/MemberPlans";
import MemberPayments from "./pages/member/MemberPayments";
import MemberAttendance from "./pages/member/MemberAttendance";
import MemberNotifications from "./pages/member/MemberNotifications";
import MemberProfile from "./pages/member/MemberProfile";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Refund from "./pages/Refund";
import { ReactNode } from "react";

const queryClient = new QueryClient();

function ProtectedRoute({ children, requiredRole }: { children: ReactNode; requiredRole?: "admin" | "member" }) {
  const { user, role, loading } = useAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  if (!user) return <Navigate to="/auth" />;
  if (requiredRole && role !== requiredRole) return <Navigate to={role === "admin" ? "/admin" : "/member"} />;
  return <>{children}</>;
}

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/refund" element={<Refund />} />
              {/* Admin routes */}
              <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><DashboardLayout><AdminDashboard /></DashboardLayout></ProtectedRoute>} />
              <Route path="/admin/plans" element={<ProtectedRoute requiredRole="admin"><DashboardLayout><AdminPlans /></DashboardLayout></ProtectedRoute>} />
              <Route path="/admin/members" element={<ProtectedRoute requiredRole="admin"><DashboardLayout><AdminMembers /></DashboardLayout></ProtectedRoute>} />
              <Route path="/admin/payments" element={<ProtectedRoute requiredRole="admin"><DashboardLayout><AdminPayments /></DashboardLayout></ProtectedRoute>} />
              <Route path="/admin/attendance" element={<ProtectedRoute requiredRole="admin"><DashboardLayout><AdminAttendance /></DashboardLayout></ProtectedRoute>} />
              <Route path="/admin/expiring" element={<ProtectedRoute requiredRole="admin"><DashboardLayout><AdminExpiring /></DashboardLayout></ProtectedRoute>} />
              {/* Member routes */}
              <Route path="/member" element={<ProtectedRoute requiredRole="member"><DashboardLayout><MemberDashboard /></DashboardLayout></ProtectedRoute>} />
              <Route path="/member/plans" element={<ProtectedRoute requiredRole="member"><DashboardLayout><MemberPlans /></DashboardLayout></ProtectedRoute>} />
              <Route path="/member/payments" element={<ProtectedRoute requiredRole="member"><DashboardLayout><MemberPayments /></DashboardLayout></ProtectedRoute>} />
              <Route path="/member/attendance" element={<ProtectedRoute requiredRole="member"><DashboardLayout><MemberAttendance /></DashboardLayout></ProtectedRoute>} />
              <Route path="/member/notifications" element={<ProtectedRoute requiredRole="member"><DashboardLayout><MemberNotifications /></DashboardLayout></ProtectedRoute>} />
              <Route path="/member/profile" element={<ProtectedRoute requiredRole="member"><DashboardLayout><MemberProfile /></DashboardLayout></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
