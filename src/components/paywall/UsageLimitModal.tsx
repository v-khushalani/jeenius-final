import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UsageLimitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  limitType: string;
  currentUsage: number;
  maxUsage: number;
}

export function UsageLimitModal({ open, onOpenChange, limitType, currentUsage, maxUsage }: UsageLimitModalProps) {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    navigate('/subscription-plans');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background">
        <DialogHeader>
          <div className="flex items-center gap-2 text-warning">
            <AlertCircle className="w-6 h-6" />
            <DialogTitle>Usage Limit Reached</DialogTitle>
          </div>
          <DialogDescription className="pt-4 space-y-2">
            <p>
              You've reached your daily limit for <strong>{limitType}</strong>.
            </p>
            <p className="text-sm text-muted-foreground">
              Current usage: {currentUsage} / {maxUsage}
            </p>
            <p className="pt-2">
              Upgrade to Pro to get unlimited access to all features!
            </p>
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2 justify-end mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Maybe Later
          </Button>
          <Button onClick={handleUpgrade} className="bg-primary hover:bg-primary/90">
            Upgrade to Pro
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
