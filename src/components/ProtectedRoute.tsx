// src/components/ProtectedRoute.tsx

import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoadingScreen from '@/components/ui/LoadingScreen';
import MobileVerificationModal from '@/components/MobileVerificationModal';
import { supabase } from '@/integrations/supabase/client';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireMobileVerification?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireMobileVerification = true 
}) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const [showMobileVerification, setShowMobileVerification] = useState(false);
  const [checkingVerification, setCheckingVerification] = useState(true);

  useEffect(() => {
    const checkMobileVerification = async () => {
      if (!user || !requireMobileVerification) {
        setCheckingVerification(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('mobile_verified')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        // Show modal if mobile is not verified
        if (!data?.mobile_verified) {
          setShowMobileVerification(true);
        }
      } catch (error) {
        console.error('Error checking mobile verification:', error);
      } finally {
        setCheckingVerification(false);
      }
    };

    checkMobileVerification();
  }, [user, requireMobileVerification]);

  // Show loading screen while checking auth status or verification
  if (isLoading || checkingVerification) {
    return <LoadingScreen message="Loading your dashboard..." />;
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <>
      {showMobileVerification && user && (
        <MobileVerificationModal
          isOpen={showMobileVerification}
          userId={user.id}
          onVerificationComplete={() => setShowMobileVerification(false)}
        />
      )}
      {children}
    </>
  );
};

export default ProtectedRoute;
