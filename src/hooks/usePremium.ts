import { useAuth } from '@/contexts/AuthContext';

export const useRealPremium = () => {
  const { isPremium, isLoading, refreshPremium } = useAuth();
  
  return { isPremium, isLoading, refreshPremium };
};
