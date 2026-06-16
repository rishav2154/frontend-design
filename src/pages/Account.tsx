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

  const API_BASE = import.meta.env.VITE_API_URL || 'https://api.thedesignhive.tech';

  const fetchUserProfile = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
        }
        setUser(null);
        return;
      }

      const profile = await response.json();
      setUser(profile);
    } catch (err) {
      console.error('Fetch profile error:', err);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [API_BASE]);

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <CartDrawer />
        <main className="pt-24 pb-32">
          <div className="container mx-auto px-4 max-w-md text-center">
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
    <div className="min-h-screen bg-background">
      <Navbar />
      <CartDrawer />

      <main className="pt-24 pb-32">
        <div className="container mx-auto px-4 max-w-lg">

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
              className="glass-card rounded-2xl p-6 mb-6"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center">
                  <span className="text-xl font-bold text-accent">
                    {initials}
                  </span>
                </div>

                <div className="flex-1">
                  <h1 className="text-xl font-bold">{displayName}</h1>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Mail className="w-4 h-4" />
                    {user.email}
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      {user.phone}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setEditingProfile(true)}
                  className="p-2 rounded-xl bg-muted hover:bg-muted/70"
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
            <Link to="/orders" className="flex items-center p-4 border-b">
              <Package className="w-5 h-5 mr-3 text-accent" />
              My Orders
              <ChevronRight className="ml-auto w-4 h-4" />
            </Link>

            <Link to="/wishlist" className="flex items-center p-4 border-b">
              <Heart className="w-5 h-5 mr-3 text-accent" />
              Wishlist
              <ChevronRight className="ml-auto w-4 h-4" />
            </Link>

            <Link to="/cart" className="flex items-center p-4">
              <ShoppingBag className="w-5 h-5 mr-3 text-accent" />
              Cart
              <ChevronRight className="ml-auto w-4 h-4" />
            </Link>
          </motion.div>

          <Button
            variant="outline"
            onClick={handleLogout}
            className="w-full text-destructive"
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
