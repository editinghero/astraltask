import { useState } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import ThemePicker from '@/components/ThemePicker';

export default function Auth() {
  const { user, loading, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (user) return <Navigate to="/" replace />;

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === 'signup') {
        await signUp(email, password, name || email.split('@')[0]);
        toast.success('Account created!', { description: 'Welcome to AstralTask.' });
      } else {
        await signIn(email, password);
        toast.success('Welcome back!');
      }
      navigate('/');
    } catch (err: any) {
      toast.error(err.message ?? 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Subtle floating blobs (no accent) */}
      <div className="absolute -top-32 -left-20 w-80 h-80 rounded-full bg-foreground/5 blur-3xl animate-blob" />
      <div className="absolute top-40 -right-20 w-96 h-96 rounded-full bg-foreground/[0.03] blur-3xl animate-blob" style={{ animationDelay: '4s' }} />

      {/* Floating theme picker — top right, perfectly circular */}
      <div className="fixed top-4 right-4 z-20 safe-top">
        <ThemePicker variant="icon" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl glass glow-border-strong mb-4">
            <Sparkles className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-display gradient-text mb-1">AstralTask</h1>
          <p className="text-muted-foreground text-sm">Plan your week beautifully.</p>
        </div>

        <div className="glass-strong glow-border rounded-3xl p-7">
          <div className="flex gap-1 p-1 rounded-full bg-muted/40 border border-foreground/10 mb-6">
            {(['login', 'signup'] as const).map(m => (
              <button key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-all pressable ${
                  mode === m
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground'
                }`}>
                {m === 'login' ? 'Sign in' : 'Sign up'}
              </button>
            ))}
          </div>

          <form onSubmit={handle} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Alex" className="glass btn-bordered h-12 rounded-2xl" />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="glass btn-bordered h-12 rounded-2xl" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" className="glass btn-bordered h-12 rounded-2xl" />
              {mode === 'login' && (
                <div className="flex justify-end">
                  <Link to="/reset-password" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                    Forgot password?
                  </Link>
                </div>
              )}
            </div>
            <Button type="submit" disabled={busy} className="w-full h-12 rounded-2xl btn-bordered bg-primary text-primary-foreground hover:bg-primary/90 font-semibold pressable">
              {busy ? <Loader2 className="animate-spin" /> : mode === 'login' ? 'Sign in' : 'Create account'}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Your data syncs securely across all your devices.
        </p>
      </div>
    </div>
  );
}
