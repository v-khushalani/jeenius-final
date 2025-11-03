import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface UsageLimitBannerProps {
  current?: number;
  used?: number;
  max?: number;
  limit?: number;
  type: string;
  onUpgrade?: () => void;
}

export function UsageLimitBanner({ current, used, max, limit, type, onUpgrade }: UsageLimitBannerProps) {
  const navigate = useNavigate();
  const actualCurrent = current ?? used ?? 0;
  const actualMax = max ?? limit ?? 100;
  const percentage = (actualCurrent / actualMax) * 100;
  
  if (percentage < 80) return null;

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      navigate('/subscription-plans');
    }
  };

  return (
    <div className="bg-warning/10 border border-warning rounded-lg p-4 mb-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-foreground mb-1">
            {percentage >= 100 ? 'Usage Limit Reached' : 'Approaching Usage Limit'}
          </h3>
          <p className="text-sm text-muted-foreground mb-2">
            You've used {actualCurrent} of {actualMax} {type} available on the free plan.
          </p>
          <Button 
            size="sm" 
            onClick={handleUpgrade}
            className="bg-primary hover:bg-primary/90"
          >
            Upgrade to Pro
          </Button>
        </div>
      </div>
    </div>
  );
}
