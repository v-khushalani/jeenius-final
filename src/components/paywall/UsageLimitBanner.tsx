import React from 'react';
import { Zap } from 'lucide-react';
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
  
  // Show at 60% (12-15 questions) for soft nudge
  if (percentage < 60) return null;

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      navigate('/subscription-plans');
    }
  };

  const isLimitReached = percentage >= 100;
  const isNearLimit = percentage >= 80;

  return (
    <div className={`rounded-lg p-3 mb-4 ${
      isLimitReached 
        ? 'bg-destructive/10 border border-destructive/30' 
        : 'bg-primary/5 border border-primary/20'
    }`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-foreground">
            {isLimitReached ? (
              <span className="font-medium">Limit reached! </span>
            ) : isNearLimit ? (
              <span>{actualCurrent}/{actualMax} {type} used. </span>
            ) : (
              <span>Keep going! </span>
            )}
            <span className="text-muted-foreground">
              Go unlimited at ₹1.37/day
            </span>
          </p>
        </div>
        <Button 
          size="sm" 
          onClick={handleUpgrade}
          variant={isLimitReached ? "default" : "outline"}
          className="h-7 text-xs shrink-0"
        >
          <Zap className="w-3 h-3 mr-1" />
          Upgrade
        </Button>
      </div>
    </div>
  );
}
