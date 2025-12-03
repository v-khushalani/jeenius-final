import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Zap, Crown } from "lucide-react";
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
      <DialogContent className="bg-background max-w-sm">
        <DialogHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <Crown className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-lg">Go Unlimited!</DialogTitle>
          <DialogDescription className="pt-2 space-y-3">
            <p className="text-sm">
              You've used <span className="font-semibold">{currentUsage}/{maxUsage}</span> {limitType}.
            </p>
            <div className="bg-primary/5 rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground">Pro at just</p>
              <p className="text-xl font-bold text-primary">₹1.37/day</p>
              <p className="text-xs text-muted-foreground">Unlimited everything!</p>
            </div>
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2 mt-2">
          <Button onClick={handleUpgrade}>
            <Zap className="w-4 h-4 mr-2" />
            Upgrade to Pro
          </Button>
          <button 
            onClick={() => onOpenChange(false)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Maybe later
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
