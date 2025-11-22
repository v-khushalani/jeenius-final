import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const AppDownloadBanner = () => {
  const [showBanner, setShowBanner] = useState(() => {
    const dismissed = localStorage.getItem('appBannerDismissed');
    return dismissed !== 'true';
  });

  const handleDownloadApp = () => {
    window.open('https://play.google.com/store/apps/details?id=com.jeenius.app', '_blank');
  };

  const dismissBanner = () => {
    setShowBanner(false);
    localStorage.setItem('appBannerDismissed', 'true');
  };

  useEffect(() => {
    if (showBanner) {
      document.body.classList.add('has-app-banner');
    } else {
      document.body.classList.remove('has-app-banner');
    }
    
    return () => {
      document.body.classList.remove('has-app-banner');
    };
  }, [showBanner]);

  if (!showBanner) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-primary to-blue-600 text-white py-3 px-4 z-50 shadow-lg">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 hidden sm:block" />
          <p className="text-sm sm:text-base font-medium">
            📱 Get the JEEnius App - Study Anytime, Anywhere!
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={handleDownloadApp}
            className="text-xs sm:text-sm bg-white text-primary hover:bg-white/90"
          >
            <Download className="w-3 h-3 mr-1" />
            Download
          </Button>
          <button
            onClick={dismissBanner}
            className="text-white/80 hover:text-white p-1"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
