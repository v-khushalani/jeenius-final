import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import FloatingAIButton from '@/components/FloatingAIButton';
import SubscriptionPlans from '@/pages/SubscriptionPlans';


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
import FeaturesPage from "./pages/FeaturesPage";
import LessonBuilderPage from "./pages/LessonBuilderPage";
import WhyUsPage from "./pages/WhyUsPage";
import GoalSelectionPage from '@/pages/GoalSelectionPage';
import PeerBattleSystem from './pages/PeerBattleSystem';
import AIStudyPlannerPage from './pages/AIStudyPlannerPage';

// Enhanced Dashboard
import EnhancedDashboard from "./pages/EnhancedDashboard";
import AnalyticsPage from "@/pages/AnalyticsPage";

// Components
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminRoute from "@/components/AdminRoute";
import AdminDashboard from "@/pages/AdminDashboard";

// Mobile pages
import MobileDashboard from "./pages/mobile/MobileDashboard";
import MobileLearning from "./pages/mobile/MobileLearning";
import MobileStudyPlanner from "./pages/mobile/MobileStudyPlanner";

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
            <Route path="/features" element={<FeaturesPage />} />
            
            {/* Authentication Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Navigate to="/login" replace />} /> {/* Redirect signup to login since we only use Google */}
            <Route path="/auth/callback" element={<AuthCallback />} />
            
            {/* Public Battle */}
            <Route path="/battle" element={<PeerBattleSystem />} />
            
            {/* Goal Selection (might be needed after signup) */}
            <Route path="/goal-selection" element={<GoalSelectionPage />} />
            
            {/* Test Routes - Some public, some protected */}
            <Route path="/test-attempt/:testId" element={<TestAttemptPage />} />
            <Route path="/test-attempt" element={<TestAttemptPage />} />
            <Route path="/test-results" element={<TestResultsPage />} />

            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/subscription-plans" element={<SubscriptionPlans />} />
            
            {/* Protected Routes - Main Dashboard */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <EnhancedDashboard />
                </ProtectedRoute>
              } 
            />

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
            
            {/* Lesson Builder */}
            <Route
              path="/lesson-builder"
              element={
                <ProtectedRoute>
                  <LessonBuilderPage />
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
            
            {/* Mobile Routes */}
            <Route
              path="/mobile/dashboard"
              element={
                <ProtectedRoute>
                  <MobileDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mobile/learning"
              element={
                <ProtectedRoute>
                  <MobileLearning />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mobile/planner"
              element={
                <ProtectedRoute>
                  <MobileStudyPlanner />
                </ProtectedRoute>
              }
            />
            
            {/* Lesson Detail Route - Placeholder for future implementation */}
            <Route 
              path="/lesson/:id" 
              element={
                <div className="min-h-screen bg-gray-50 pt-24">
                  <div className="container mx-auto px-4 text-center">
                    <h1 className="text-2xl font-bold">Lesson Detail - Coming Soon</h1>
                    <p className="text-gray-600 mt-4">This lesson detail page will be implemented soon.</p>
                  </div>
                </div>
              } 
            />
            
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
