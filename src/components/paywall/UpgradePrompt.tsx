import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UpgradePromptProps {
  questionsCompleted: number;
  onDismiss: () => void;
}

const UpgradePrompt: React.FC<UpgradePromptProps> = ({ questionsCompleted, onDismiss }) => {
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-card border border-border rounded-xl shadow-lg p-4 z-50 animate-in slide-in-from-bottom-4">
      <button 
        onClick={onDismiss}
        className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
      >
        <X className="w-4 h-4" />
      </button>
      
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Zap className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground mb-1">
            Great progress! 🎉
          </p>
          <p className="text-xs text-muted-foreground mb-3">
            You've solved {questionsCompleted} questions. Go unlimited with Pro at just ₹1.37/day!
          </p>
          <Button 
            size="sm" 
            onClick={() => navigate('/subscription-plans')}
            className="w-full h-8 text-xs"
          >
            Upgrade to Pro
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UpgradePrompt;
