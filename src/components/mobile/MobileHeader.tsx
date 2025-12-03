
import React from 'react';
import { ArrowLeft, Bell, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface MobileHeaderProps {
  title?: string;
  showBack?: boolean;
}

const MobileHeader = ({ title, showBack }: MobileHeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-[#e9e9e9] px-4 py-3 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center space-x-3">
        {showBack && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="h-8 w-8 text-[#013062]"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        )}
        <h1 className="text-lg font-semibold text-[#013062]">{title || 'JEEnius'}</h1>
      </div>
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon" className="h-8 w-8 text-[#013062]">
          <Bell className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-[#013062]">
          <User className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
};

export default MobileHeader;
