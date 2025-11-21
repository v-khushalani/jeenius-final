import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Phone, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MobileVerificationModalProps {
  isOpen: boolean;
  userId: string;
  onVerificationComplete: () => void;
}

const MobileVerificationModal: React.FC<MobileVerificationModalProps> = ({ 
  isOpen, 
  userId,
  onVerificationComplete 
}) => {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [loading, setLoading] = useState(false);

  // Simple OTP generation (6 digits)
  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleSendOTP = async () => {
    // Validate phone number (Indian format)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phoneNumber)) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    try {
      // Generate OTP
      const otp = generateOTP();
      setGeneratedOtp(otp);

      // In production, integrate with SMS service (Twilio, MSG91, etc.)
      // For now, show OTP in console (REMOVE IN PRODUCTION)
      console.log('OTP for testing:', otp);
      
      // Update phone in database
      const { error } = await supabase
        .from('profiles')
        .update({ phone: `+91${phoneNumber}` })
        .eq('id', userId);

      if (error) throw error;

      toast.success(`OTP sent to +91${phoneNumber}`);
      setStep('otp');
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast.error('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp !== generatedOtp) {
      toast.error('Invalid OTP. Please try again.');
      return;
    }

    setLoading(true);
    try {
      // Mark mobile as verified
      const { error } = await supabase
        .from('profiles')
        .update({ 
          mobile_verified: true,
          mobile_verified_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      toast.success('Mobile number verified successfully!');
      onVerificationComplete();
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast.error('Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600">
            <Phone className="h-6 w-6 text-white" />
          </div>
          <DialogTitle className="text-center text-xl">
            Verify Your Mobile Number
          </DialogTitle>
          <DialogDescription className="text-center">
            {step === 'phone' 
              ? 'Enter your mobile number to receive an OTP'
              : 'Enter the 6-digit OTP sent to your mobile'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {step === 'phone' ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="phone">Mobile Number</Label>
                <div className="flex gap-2">
                  <div className="flex h-10 items-center rounded-md border border-input bg-background px-3 text-sm">
                    +91
                  </div>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="9876543210"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    maxLength={10}
                    className="flex-1"
                  />
                </div>
              </div>

              <Button 
                onClick={handleSendOTP}
                disabled={loading || phoneNumber.length !== 10}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="otp">Enter OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  className="text-center text-lg tracking-widest"
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={() => {
                    setStep('phone');
                    setOtp('');
                  }}
                  disabled={loading}
                  className="flex-1"
                >
                  Change Number
                </Button>
                <Button 
                  onClick={handleVerifyOTP}
                  disabled={loading || otp.length !== 6}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  {loading ? 'Verifying...' : 'Verify'}
                </Button>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Shield className="h-3 w-3" />
                <span>Your number is secure and will not be shared</span>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MobileVerificationModal;
