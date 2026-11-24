import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ProfileEditor } from '@/components/account/ProfileEditor';
import { AddressManager } from '@/components/account/AddressManager';
import {
  User, Package, Heart, LogOut, ChevronRight,
  Mail, Phone, Shield, Loader2, ShoppingBag, Pencil
} from 'lucide-react';
import { apiFetch, endpoints } from '@/lib/api';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  role?: string;
}

const Account = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchUserProfile = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const profile = await apiFetch(endpoints.auth.me);
      setUser(profile);
    } catch (err: any) {
      console.error('Fetch profile error:', err);
      if (err?.message && err.message.includes('401')) {
        localStorage.removeItem('token');
      }
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast({ title: 'Signed out successfully' });
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex min-h-dvh min-h-dvh items-center justify-center bg-background px-4">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-dvh min-h-dvh overflow-x-clip bg-background">
        <Navbar />
        <CartDrawer />
        <main className="pb-24 pt-20 sm:pb-32 sm:pt-24">
          <div className="container mx-auto max-w-md px-3 text-center min-[360px]:px-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center mb-6">
              <User className="w-10 h-10 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Welcome</h1>
            <p className="text-muted-foreground mb-8">
              Sign in to access your account.
            </p>
            <Button onClick={() => navigate('/auth')} className="w-full h-12 btn-luxury">
              Sign In
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const displayName = user.name || user.email.split('@')[0];
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="min-h-dvh min-h-dvh overflow-x-clip bg-background">
      <Navbar />
      <CartDrawer />

      <main className="pb-24 pt-20 sm:pb-32 sm:pt-24">
        <div className="container mx-auto max-w-lg px-3 min-[360px]:px-4">

          {/* Profile Section */}
          {editingProfile ? (
            <ProfileEditor
              onClose={() => setEditingProfile(false)}
              onUpdated={fetchUserProfile}
            />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card mb-6 rounded-2xl p-4 min-[360px]:p-5 sm:p-6"
            >
              <div className="flex min-w-0 items-start gap-3 min-[360px]:items-center min-[360px]:gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-accent/20 min-[360px]:h-16 min-[360px]:w-16">
                  <span className="text-xl font-bold text-accent">
                    {initials}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <h1 className="break-words text-lg font-bold min-[360px]:text-xl">{displayName}</h1>
                  <div className="mt-1 flex min-w-0 items-start gap-2 text-sm text-muted-foreground">
                    <Mail className="mt-0.5 h-4 w-4 shrink-0" />
                    <span className="min-w-0 break-all">{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex min-w-0 items-start gap-2 text-sm text-muted-foreground">
                      <Phone className="mt-0.5 h-4 w-4 shrink-0" />
                      <span className="min-w-0 break-all">{user.phone}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setEditingProfile(true)}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted hover:bg-muted/70"
                  aria-label="Edit profile"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Address Manager — FIXED (NO userId prop) */}
          <AddressManager />

          {/* Menu */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card rounded-2xl overflow-hidden mb-6"
          >
            <Link to="/orders" className="flex min-h-12 items-center p-4 border-b">
              <Package className="w-5 h-5 mr-3 text-accent" />
              My Orders
              <ChevronRight className="ml-auto w-4 h-4" />
            </Link>

            <Link to="/wishlist" className="flex min-h-12 items-center p-4 border-b">
              <Heart className="w-5 h-5 mr-3 text-accent" />
              Wishlist
              <ChevronRight className="ml-auto w-4 h-4" />
            </Link>

            <Link to="/cart" className="flex min-h-12 items-center p-4">
              <ShoppingBag className="w-5 h-5 mr-3 text-accent" />
              Cart
              <ChevronRight className="ml-auto w-4 h-4" />
            </Link>
          </motion.div>

          <Button
            variant="outline"
            onClick={handleLogout}
            className="min-h-11 w-full text-destructive"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Account;
