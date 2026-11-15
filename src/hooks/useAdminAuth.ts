import { useState, useEffect } from 'react';
import { apiFetch, endpoints } from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

export const useAdminAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await apiFetch<User>(endpoints.auth.me);

        setUser(data);
        setIsAdmin(data.role === 'admin');
      } catch (err) {
        setUser(null);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  return { user, isAdmin, loading };
};
