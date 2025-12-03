
import React from 'react';
import MobileNavigation from './MobileNavigation';
import MobileHeader from './MobileHeader';

interface MobileLayoutProps {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
  showHeader?: boolean;
}

const MobileLayout = ({ children, title, showBack = false, showHeader = true }: MobileLayoutProps) => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {showHeader && <MobileHeader title={title} showBack={showBack} />}
      <main className="flex-1 pb-20">
        {children}
      </main>
      <MobileNavigation />
    </div>
  );
};

export default MobileLayout;
