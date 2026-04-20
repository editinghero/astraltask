import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles, Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import ThemePicker from '@/components/ThemePicker';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);
  
  // Check if this is a password update (has token in URL)
  const token = searchParams.get('token');
  const isUpdateMode = !!token;

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.requestPasswordReset(email);
      toast.success('Check your email', { 
        description: 'We sent you a password reset link.' 
      });
      setEmail('');
    } catch (err: any) {
      toast.error(err.message ?? 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setBusy(true);
    try {
      await api.updatePassword(token!, password);
      toast.success('Password updated successfully');
      navigate('/auth');
    } catch (err: any) {
      toast.error(err.message ?? 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Subtle floating blobs */}
      <div className="absolute -top-32 -left-20 w-80 h-80 rounded-full bg-foreground/5 blur-3xl animate-blob" />
      <div className="absolute top-40 -right-20 w-96 h-96 rounded-full bg-foreground/[0.03] blur-3xl animate-blob" style={{ animationDelay: '4s' }} />

      {/* Floating theme picker */}
      <div className="fixed top-4 right-4 z-20 safe-top">
        <ThemePicker variant="icon" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl glass glow-border-strong mb-4">
            <Sparkles className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-display gradient-text mb-1">
            {isUpdateMode ? 'Set New Password' : 'Reset Password'}
          </h1>
          <p className="text-muted-foreground text-sm">
            {isUpdateMode 
              ? 'Enter your new password below.' 
              : 'Enter your email to receive a reset link.'}
          </p>
        </div>

        <div className="glass-strong glow-border rounded-3xl p-7">
          {isUpdateMode ? (
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="password">New Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  required 
                  minLength={6}
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  placeholder="At least 6 characters" 
                  className="glass btn-bordered h-12 rounded-2xl" 
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input 
                  id="confirmPassword" 
                  type="password" 
                  required 
                  minLength={6}
                  value={confirmPassword} 
                  onChange={e => setConfirmPassword(e.target.value)} 
                  placeholder="Re-enter password" 
                  className="glass btn-bordered h-12 rounded-2xl" 
                />
              </div>
              <Button 
                type="submit" 
                disabled={busy} 
                className="w-full h-12 rounded-2xl btn-bordered bg-primary text-primary-foreground hover:bg-primary/90 font-semibold pressable"
              >
                {busy ? <Loader2 className="animate-spin" /> : 'Update Password'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleRequestReset} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  required 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  placeholder="you@example.com" 
                  className="glass btn-bordered h-12 rounded-2xl" 
                />
              </div>
              <Button 
                type="submit" 
                disabled={busy} 
                className="w-full h-12 rounded-2xl btn-bordered bg-primary text-primary-foreground hover:bg-primary/90 font-semibold pressable"
              >
                {busy ? <Loader2 className="animate-spin" /> : 'Send Reset Link'}
              </Button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link 
              to="/auth" 
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to sign in
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Your data syncs securely across all your devices.
        </p>
      </div>
    </div>
  );
}
