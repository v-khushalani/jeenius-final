import React, { useState, useEffect } from 'react';
import { Menu, X, Globe, Smartphone, Download, LogOut, ChevronDown, BookOpen, Target, MessageCircle, Trophy, BarChart3, PlusCircle, Brain, Award, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { supabase } from '@/integrations/supabase/client';
import PointsDisplay from '@/components/PointsDisplay';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar } from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [language, setLanguage] = useState('EN');
  const [showAppBanner, setShowAppBanner] = useState(() => {
    const dismissed = localStorage.getItem('appBannerDismissed');
    return dismissed !== 'true';
  });
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, signOut, isPremium } = useAuth();
  const { isAdmin } = useAdminAuth();

  const handleNavigation = (path: string) => {
    setIsMenuOpen(false);
    navigate(path);
  };

  const publicNavItems = [
    { name: 'Home', href: '/', path: '/', icon: null, highlight: false },
    { name: 'Why Us', href: '/why-us', path: '/why-us', icon: null, highlight: false },
  ];
  
  // Recommended Fix:
  const featureDropdownItems = [
    { name: 'Dashboard', path: '/dashboard', icon: BarChart3, description: 'Your analytics hub' },
    { name: 'Study Planner', path: '/ai-planner', icon: Calendar, description: 'AI-powered planning' },
  ];

  const navItems = isAuthenticated ? (
  isAdmin ? [
    { name: 'Dashboard', href: '/admin', path: '/admin', icon: BarChart3 },
    { name: 'Analytics', href: '/admin/analytics', path: '/admin/analytics', icon: Target },
    { name: 'Users', href: '/admin/users', path: '/admin/users', icon: BookOpen },
    { name: 'Content', href: '/admin/content', path: '/admin/content', icon: Brain },
  ] : [
    { name: 'Dashboard', href: '/dashboard', path: '/dashboard', icon: BarChart3 },
    { name: 'Study Now', href: '/study-now', path: '/study-now', icon: BookOpen, highlight: false },
    ...(isPremium ? [{ name: 'AI Study Planner', href: '/ai-planner', path: '/ai-planner', icon: Brain, highlight: false }] : []),
    { name: 'Tests', href: '/tests', path: '/tests', icon: Target },
  ]
) : publicNavItems;

  const handleLogout = async () => {
    try {
      setIsMenuOpen(false);
      localStorage.clear();
      await supabase.auth.signOut();
      if (signOut) await signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.clear();
      window.location.href = '/';
    }
  };

  const handleDownloadApp = () => {
    window.open('https://play.google.com/store/apps/details?id=com.jeenius.app', '_blank');
  };

  const dismissAppBanner = () => {
    setShowAppBanner(false);
    localStorage.setItem('appBannerDismissed', 'true');
  };

  React.useEffect(() => {
    if (showAppBanner) {
      document.body.classList.add('has-app-banner');
    } else {
      document.body.classList.remove('has-app-banner');
    }
    
    return () => {
      document.body.classList.remove('has-app-banner');
    };
  }, [showAppBanner]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200">
      {/* Mobile App Promotion Bar */}
      {showAppBanner && (
        <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white text-center py-2 text-sm relative">
          <div className="flex items-center justify-center space-x-2">
            <Smartphone className="w-4 h-4" />
            <span>📱 Get the full JEEnius experience - Download our Android App now!</span>
            <Button 
              size="sm" 
              variant="secondary" 
              className="ml-2 bg-white text-green-600 text-xs py-1 px-2 h-6"
              onClick={handleDownloadApp}
            >
              <Download className="w-3 h-3 mr-1" />
              Download
            </Button>
          </div>
          <button 
            onClick={dismissAppBanner}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-white hover:text-gray-200 p-1"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Enhanced for visibility */}
          <div 
            className="flex items-center space-x-2 sm:space-x-3 cursor-pointer group"
            onClick={() => navigate(isAuthenticated ? '/dashboard' : '/')}
          >
            <div className="bg-gradient-to-br from-green-500 to-blue-600 p-1.5 sm:p-2 rounded-lg shadow-lg group-hover:shadow-2xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
              <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="font-bold text-lg sm:text-xl bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent drop-shadow-sm">
              JEEnius
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  console.log('Navigating to:', item.href || item.path);
                  handleNavigation(item.href || item.path);
                }}
                className={`transition-colors duration-200 font-medium px-3 py-2 rounded-lg flex items-center space-x-2 ${
                  location.pathname === (item.href || item.path)
                    ? 'text-white bg-primary'
                    : item.highlight 
                    ? 'text-primary bg-primary/10 hover:bg-primary hover:text-white'
                    : 'text-gray-700 hover:text-primary hover:bg-gray-100'
                }`}
              >
                {item.icon && <item.icon className="w-4 h-4" />}
                <span>{item.name}</span>
              </button>
            ))}
          </nav>

          {/* Right Side: Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Points display removed - already shown on dashboard */}
            
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">
                      U
                    </div>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-white border border-gray-200 shadow-lg">
                  <DropdownMenuItem onClick={() => handleNavigation('/profile')}>
                    <div className="flex items-center space-x-2 w-full">
                      <div className="w-4 h-4 rounded-full bg-primary"></div>
                      <span>Profile</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleNavigation('/settings')}>
                    <div className="flex items-center space-x-2 w-full">
                      <span>⚙️</span>
                      <span>Settings</span>
                    </div>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem onClick={() => handleNavigation('/admin')}>
                      <div className="flex items-center space-x-2 w-full">
                        <Shield className="w-4 h-4 text-purple-600" />
                        <span className="text-purple-600 font-semibold">Admin Panel</span>
                      </div>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="text-red-600 focus:text-red-600"
                  >
                    <div className="flex items-center space-x-2 w-full">
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                className="bg-primary hover:bg-primary/90 text-white px-6"
                onClick={() => navigate('/login')}
              >
                Sign In / Get Started
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-gray-600" />
            ) : (
              <Menu className="w-6 h-6 text-gray-600" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            {/* 🚀 NEW: Points Display for Mobile - Top of menu */}
            {isAuthenticated && (
              <div className="mb-4 flex justify-center">
                {/* <PointsDisplay /> */}
              </div>
            )}

            <nav className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.path)}
                  className={`text-left font-medium transition-colors flex items-center space-x-3 p-3 rounded-lg ${
                    location.pathname === item.path
                      ? 'text-white bg-primary'
                      : item.highlight
                      ? 'text-primary bg-primary/10'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {item.icon && <item.icon className="w-5 h-5" />}
                  <span>{item.name}</span>
                </button>
              ))}
              
              <div className="pt-3 space-y-2 border-t mt-3">
                {isAuthenticated ? (
                  <>
                    <Button 
                      variant="outline"
                      className="w-full justify-start text-left h-12 flex items-center space-x-3 px-3"
                      onClick={() => handleNavigation('/profile')}
                    >
                      <div className="w-5 h-5 rounded-full bg-primary"></div>
                      <span>Profile</span>
                    </Button>
                    <Button 
                      variant="outline"
                      className="w-full justify-start text-left h-12 flex items-center space-x-3 px-3"
                      onClick={() => handleNavigation('/settings')}
                    >
                      <span className="text-lg">⚙️</span>
                      <span>Settings</span>
                    </Button>
                    {isAdmin && (
                      <Button 
                        variant="outline"
                        className="w-full justify-start text-left h-12 flex items-center space-x-3 px-3 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-300"
                        onClick={() => handleNavigation('/admin')}
                      >
                        <Shield className="w-5 h-5" />
                        <span className="font-semibold">Admin Panel</span>
                      </Button>
                    )}
                    <Button 
                      variant="outline"
                      onClick={handleLogout}
                      className="w-full justify-start text-left h-12 flex items-center space-x-3 px-3 hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Logout</span>
                    </Button>
                  </>
                ) : (
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90 text-white h-12"
                    onClick={() => handleNavigation('/login')}
                  >
                    Sign In / Get Started
                  </Button>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
