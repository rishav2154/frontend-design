import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Lock, Eye, EyeOff, Loader2, Shield, CheckCircle } from 'lucide-react';
import { apiFetch, endpoints } from '@/lib/api';

const AdminResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [params] = useSearchParams();

  // token sent in email like: /admin/reset-password?token=XXXX
  const token = params.get('token');

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast({
        title: 'Invalid Link',
        description: 'Reset token missing.',
        variant: 'destructive',
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'Please make sure both passwords are the same.',
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: 'Password too short',
        description: 'Password must be at least 6 characters.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);

      await apiFetch(endpoints.admin.resetPassword, {
        method: 'POST',
        body: JSON.stringify({ token, password }),
      });

      setSuccess(true);
      toast({
        title: 'Password Updated',
        description: 'Your password has been successfully reset.',
      });

      setTimeout(() => navigate('/admin/login'), 2000);
    } catch (err: unknown) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Unable to reset the password.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4 py-6 sm:px-6 sm:py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="glass-card p-5 sm:p-8">
          <div className="mb-6 text-center sm:mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              {success ? (
                <CheckCircle className="w-8 h-8 text-green-500" />
              ) : (
                <Shield className="w-8 h-8 text-primary" />
              )}
            </div>
            <h1 className="text-2xl font-bold">
              {success ? 'Password Reset!' : 'Set New Password'}
            </h1>
            <p className="text-muted-foreground mt-2">
              {success ? 'Redirecting you to login...' : 'Enter your new password below'}
            </p>
          </div>

          {success ? (
            <div className="text-center">
              <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <Label htmlFor="password">New Password</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-12"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 h-12"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-12 btn-luxury" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : 'Update Password'}
              </Button>

              <button
                type="button"
                onClick={() => navigate('/admin/login')}
                className="w-full text-center text-sm text-muted-foreground"
              >
                ← Back to Login
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AdminResetPassword;
