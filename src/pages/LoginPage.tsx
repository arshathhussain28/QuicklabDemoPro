import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Activity, Shield, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    await new Promise(r => setTimeout(r, 500));

    const success = await login(email, password);
    if (success) {
      // Role-based routing handled by App
      navigate('/');
    } else {
      setError('Invalid email or password');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 gradient-primary items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        </div>
        <div className="relative z-10 text-center max-w-md">
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Activity className="w-10 h-10 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-primary-foreground mb-4">QuickLab Demo Pro</h1>
          <p className="text-primary-foreground/80 text-lg mb-8">
            Enterprise Demo Request Management for Medical Instruments
          </p>
          <div className="grid grid-cols-2 gap-4 mt-10">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-left">
              <Shield className="w-6 h-6 text-primary-foreground/90 mb-2" />
              <p className="text-primary-foreground/90 text-sm font-medium">Role-Based Access</p>
              <p className="text-primary-foreground/60 text-xs mt-1">Admin & Sales panels</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-left">
              <TrendingUp className="w-6 h-6 text-primary-foreground/90 mb-2" />
              <p className="text-primary-foreground/90 text-sm font-medium">Zero Data Loss</p>
              <p className="text-primary-foreground/60 text-xs mt-1">Structured workflows</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md animate-fade-in">
          <div className="lg:hidden flex justify-center mb-8">
            <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center">
              <Activity className="w-7 h-7 text-primary-foreground" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-1">Welcome back</h2>
          <p className="text-muted-foreground mb-8">Sign in to your account to continue</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@quicklab.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="h-11"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">{error}</p>
            )}

            <Button type="submit" className="w-full h-11 btn-glow gradient-primary text-primary-foreground" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>


        </div>
      </div>
    </div>
  );
};

export default LoginPage;
