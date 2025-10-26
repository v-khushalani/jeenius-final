import React, { useState, useEffect } from 'react';
import { Menu, X, Globe, Smartphone, Download, LogOut, ChevronDown, BookOpen, Target, MessageCircle, Trophy, BarChart3, PlusCircle, Brain, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePremium } from '@/hooks/usePremium';
import { supabase } from '@/integrations/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [language, setLanguage] = useState('EN');
  const [showAppBanner, setShowAppBanner] = useState(() => {
    const dismissed = localStorage.getItem('appBannerDismissed');
    return dismissed !== 'true';
  });
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, signOut } = useAuth();
  const { isPremium } = usePremium();
  const publicNavItems = [
    { name: 'Home', href: '/', path: '/', icon: null, highlight: false },
    { name: 'Why Us', href: '/why-us', path: '/why-us', icon: null, highlight: false },
  ];

  const protectedNavItems = [
    { name: 'Dashboard', href: '/dashboard', path: '/dashboard', icon: BarChart3 },
    { name: 'Study Now', href: '/study-now', path: '/study-now', icon: BookOpen, highlight: false },
    { name: 'AI Study Planner', href: '/ai-planner', path: '/ai-planner', icon: Brain, highlight: false },
    { name: 'Tests', href: '/tests', path: '/tests', icon: Target },
  ];

  const navItems = isAuthenticated ? protectedNavItems : publicNavItems;

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  // Simplified and more reliable logout function
  const handleLogout = async () => {
    try {
      console.log('🚪 Logging out...');
      
      // Close mobile menu first
      setIsMenuOpen(false);
      
      // Clear localStorage immediately
      localStorage.clear();
      console.log('🧹 Cleared localStorage');
      
      // Call Supabase signOut
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ Supabase signOut error:', error);
      } else {
        console.log('✅ Supabase signOut successful');
      }
      
      // Call AuthContext signOut if available
      if (signOut && typeof signOut === 'function') {
        try {
          await signOut();
          console.log('✅ AuthContext signOut successful');
        } catch (authError) {
          console.error('AuthContext signOut error:', authError);
        }
      }
      
      // Redirect to home page with replace to prevent back navigation
      window.location.replace('/');
      
    } catch (error) {
      console.error('❌ Logout error:', error);
      
      // Fallback: Force logout anyway
      localStorage.clear();
      setIsMenuOpen(false);
      window.location.replace('/');
    }
  };

  const handleDownloadApp = () => {
    window.open('https://play.google.com/store/apps/details?id=com.jeenius.app', '_blank');
  };

  const dismissAppBanner = () => {
    setShowAppBanner(false);
    localStorage.setItem('appBannerDismissed', 'true');
  };

  // Add/remove class to body for dynamic spacing
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
          {/* Logo */}
          <div 
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => navigate(isAuthenticated ? '/dashboard' : '/')}
          >
          <img 
            src="logo.png" 
            alt="JEEnius Logo" 
            className="w-10 h-10 object-contain rounded-lg"
          />
            <div>
              <span className="text-xl font-bold text-primary">JEEnius</span>
              <div className="text-xs text-gray-500">AI Learning Platform</div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavigation(item.path)}
                className={`transition-colors duration-200 font-medium px-3 py-2 rounded-lg flex items-center space-x-2 ${
                  location.pathname === item.path
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

          {/* Language Toggle & Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
                        
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

// IMPORTANT: Make sure to export as default
export default Header;
