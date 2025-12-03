import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Trophy, Zap, Brain, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useRateLimit } from '@/hooks/use-rate-limit';
import { securityLogger } from '@/lib/security-logger';
import { supabase } from '@/integrations/supabase/client';

const Login = () => {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  
  const navigate = useNavigate();
  const { signInWithGoogle, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const { isRateLimited, checkRateLimit, recordAttempt, remainingAttempts } = useRateLimit({
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000,
    message: "Too many login attempts. Please wait 15 minutes before trying again."
  });

  useEffect(() => {
    const clearStaleAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        localStorage.removeItem('sb-zbclponzlwulmltwkjga-auth-token');
      }
    };
    
    clearStaleAuth();
    
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleGoogleLogin = async () => {
    if (checkRateLimit()) {
      securityLogger.log('rate_limit_exceeded', { 
        action: 'google_login',
        remainingAttempts 
      });
      return;
    }

    setIsGoogleLoading(true);
    recordAttempt();
    
    securityLogger.log('google_login_attempt', { 
      timestamp: Date.now() 
    });
    
    const result = await signInWithGoogle();
    
    if (result.error) {
      securityLogger.log('google_login_failure', { 
        error: result.error,
        timestamp: Date.now()
      });
      
      toast({
        title: "Login Failed",
        description: result.error,
        variant: "destructive"
      });
      
      setIsGoogleLoading(false);
    } else {
      securityLogger.log('google_login_success', { 
        timestamp: Date.now()
      });
    }
  };
  
  const features = [
    { icon: Trophy, value: '50K+', label: 'Students', color: '#013062' },
    { icon: Zap, value: '40K+', label: 'Questions', color: '#013062' },
    { icon: Brain, value: '98%', label: 'Success Rate', color: '#013062' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#e6eeff] rounded-full -translate-y-1/2 translate-x-1/3 opacity-50" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#e6eeff] rounded-full translate-y-1/2 -translate-x-1/3 opacity-30" />
      </div>
      
      <div className="min-h-screen flex items-center justify-center pt-16 pb-8 px-4">
        <div className="w-full max-w-5xl mx-auto relative z-10">
          
          {/* Mobile Layout */}
          <div className="lg:hidden flex flex-col items-center">
            <div className="max-w-sm w-full">
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-[#013062] mb-2">
                  Welcome to JEEnius
                </h1>
                <p className="text-sm text-[#013062]/60">AI-powered learning for JEE & NEET</p>
              </div>

              <Card className="border border-[#e9e9e9] shadow-lg bg-white">
                <CardHeader className="text-center pb-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <img src="/logo.png" alt="JEEnius Logo" className="w-14 h-14" />
                  </div>
                  <CardTitle className="text-lg font-bold text-[#013062]">
                    Sign In to Continue
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4 pb-6">
                  <Button
                    type="button"
                    className="w-full h-12 bg-white border-2 border-[#e9e9e9] hover:bg-[#e6eeff] hover:border-[#013062]/20 text-[#013062] font-semibold text-sm rounded-xl"
                    onClick={handleGoogleLogin}
                    disabled={isGoogleLoading || isRateLimited}
                  >
                    {isGoogleLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#013062] border-t-transparent"></div>
                        <span>Signing in...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        <span>Continue with Google</span>
                      </div>
                    )}
                  </Button>

                  {isRateLimited && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                      <div className="flex items-center space-x-2 text-red-800 text-xs">
                        <AlertCircle className="w-3 h-3" />
                        <span>Too many attempts. Please wait.</span>
                      </div>
                    </div>
                  )}

                  <div className="text-center text-xs text-[#013062]/50 mt-4">
                    By continuing, you agree to our Terms & Privacy Policy
                  </div>
                </CardContent>
              </Card>

              {/* Mobile Stats */}
              <div className="grid grid-cols-3 gap-2 mt-6">
                {features.map((stat, index) => (
                  <div key={index} className="bg-[#e6eeff] rounded-xl p-3 text-center">
                    <stat.icon className="w-5 h-5 mx-auto mb-1 text-[#013062]" />
                    <div className="text-lg font-bold text-[#013062]">{stat.value}</div>
                    <div className="text-[10px] text-[#013062]/60">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Features */}
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl xl:text-5xl font-bold text-[#013062] leading-tight mb-4">
                  Where AI
                  <span className="block text-[#013062]/70">adapts you</span>
                </h1>
                <p className="text-lg text-[#013062]/60">
                  The smartest way to prepare for JEE & NEET
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {features.map((stat, index) => (
                  <div key={index} className="bg-white border border-[#e9e9e9] rounded-2xl p-4 text-center hover:border-[#013062]/20 hover:shadow-lg transition-all">
                    <div className="w-10 h-10 rounded-xl bg-[#e6eeff] flex items-center justify-center mx-auto mb-2">
                      <stat.icon className="w-5 h-5 text-[#013062]" />
                    </div>
                    <div className="text-2xl font-bold text-[#013062]">{stat.value}</div>
                    <div className="text-xs text-[#013062]/50">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - Login Card */}
            <div className="flex justify-center">
              <Card className="w-full max-w-md border border-[#e9e9e9] shadow-xl bg-white">
                <CardHeader className="text-center pb-6">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <img src="/logo.png" alt="JEEnius Logo" className="w-16 h-16" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-[#013062]">
                    Welcome Back!
                  </CardTitle>
                  <p className="text-[#013062]/60">Sign in to continue your journey</p>
                </CardHeader>

                <CardContent className="space-y-6">
                  <Button
                    type="button"
                    className="w-full h-14 bg-white border-2 border-[#e9e9e9] hover:bg-[#e6eeff] hover:border-[#013062]/20 text-[#013062] font-semibold rounded-xl transition-all"
                    onClick={handleGoogleLogin}
                    disabled={isGoogleLoading || isRateLimited}
                  >
                    {isGoogleLoading ? (
                      <div className="flex items-center space-x-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#013062] border-t-transparent"></div>
                        <span>Signing in with Google...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-3">
                        <svg className="w-6 h-6" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        <span>Continue with Google</span>
                      </div>
                    )}
                  </Button>

                  {isRateLimited && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                      <div className="flex items-center space-x-2 text-red-800 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        <span>Too many attempts. Please wait 15 minutes.</span>
                      </div>
                    </div>
                  )}

                  <div className="bg-[#e6eeff] rounded-xl p-4">
                    <h3 className="font-semibold text-[#013062] mb-2 flex items-center text-sm">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Why JEEnius?
                    </h3>
                    <div className="space-y-1.5 text-xs text-[#013062]/70">
                      <div className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-[#013062] rounded-full"></div>
                        <span>AI-powered adaptive learning</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-[#013062] rounded-full"></div>
                        <span>40,000+ curated questions</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-[#013062] rounded-full"></div>
                        <span>Real-time progress tracking</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-center text-xs text-[#013062]/50">
                    By continuing, you agree to our Terms & Privacy Policy
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
