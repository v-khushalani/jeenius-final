import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Crown, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SubscriptionPaywallProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature?: string;
}

export function SubscriptionPaywall({ open, onOpenChange, feature = 'this feature' }: SubscriptionPaywallProps) {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    navigate('/subscription-plans');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-primary to-primary/80 p-3 rounded-full">
              <Crown className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">Upgrade to Pro</DialogTitle>
          <DialogDescription className="pt-4 space-y-4 text-center">
            <p className="text-base">
              Unlock {feature} and get unlimited access to all premium features!
            </p>
            <div className="bg-muted rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>Unlimited questions & tests</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>AI-powered study planner</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>Advanced analytics & insights</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>Priority support</span>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2 justify-center mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Maybe Later
          </Button>
          <Button onClick={handleUpgrade} className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
            <Crown className="w-4 h-4 mr-2" />
            Upgrade Now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
