import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import FloatingAIButton from '@/components/FloatingAIButton';
import SubscriptionPlans from '@/pages/SubscriptionPlans';
import PricingPage from '@/components/Pricing';

// Main pages
import Index from "./pages/Index";
import StudyNowPage from "./pages/StudyNowPage";
import TestPage from "./pages/TestPage";
import TestAttemptPage from "./pages/TestAttemptPage";
import TestResultsPage from "./pages/TestResultsPage";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

// Auth pages - Only Login needed for Google auth
import Login from "./pages/Login";
import AuthCallback from '@/pages/AuthCallback';

// Feature pages
import WhyUsPage from "./pages/WhyUsPage";
import GoalSelectionPage from '@/pages/GoalSelectionPage';
import AIStudyPlannerPage from './pages/AIStudyPlannerPage';

// Enhanced Dashboard
import EnhancedDashboard from "./pages/EnhancedDashboard";
import AnalyticsPage from "@/pages/AnalyticsPage";

// Components
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminRoute from "@/components/AdminRoute";
import AdminDashboard from "@/pages/AdminDashboard";
import LoadingScreen from "@/components/ui/LoadingScreen";

// Create QueryClient with optimized settings for better performance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Dashboard Router Component - Must be inside Router context
const DashboardRouter = () => {
  const { userRole, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && userRole === 'admin') {
      navigate('/admin', { replace: true });
    }
  }, [userRole, isLoading, navigate]);

  if (isLoading) {
    return <LoadingScreen message="Loading dashboard..." />;
  }

  return userRole === 'admin' ? null : <EnhancedDashboard />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/why-us" element={<WhyUsPage />} />
            
            {/* Authentication Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Navigate to="/login" replace />} /> {/* Redirect signup to login since we only use Google */}
            <Route path="/auth/callback" element={<AuthCallback />} />
            
            {/* Goal Selection (might be needed after signup) */}
            <Route path="/goal-selection" element={<GoalSelectionPage />} />
            
            {/* Dashboard with Admin Redirect */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardRouter />
                </ProtectedRoute>
              }
            />
            
            {/* Test Routes - Some public, some protected */}
            <Route path="/test-attempt/:testId" element={<TestAttemptPage />} />
            <Route path="/test-attempt" element={<TestAttemptPage />} />
            <Route path="/test-results" element={<TestResultsPage />} />

            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/subscription-plans" element={<SubscriptionPlans />} />
          
            {/* AI Study Planner */}
            <Route
              path="/ai-planner"
              element={
                <ProtectedRoute>
                  <AIStudyPlannerPage />
                </ProtectedRoute>
              }
            />
            
            {/* Study Routes */}
            <Route
              path="/study-now"
              element={
                <ProtectedRoute>
                  <StudyNowPage />
                </ProtectedRoute>
              }
            />
            
            {/* Test Management */}
            <Route
              path="/tests"
              element={
                <ProtectedRoute>
                  <TestPage />
                </ProtectedRoute>
              }
            />
            
            {/* Settings */}
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            
            {/* Profile */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            
            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/analytics"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/content"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            
            <Route path="/pricing" element={<PricingPage />} />

            {/* Catch-all route - 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <FloatingAIButton />
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
