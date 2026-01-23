// src/hooks/useAuth.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

export default function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('bs_token');
    const role = localStorage.getItem('bs_role');
    
    if (!token || !role) {
      setLoading(false);
      return;
    }

    // Validasi token dengan endpoint profile
    const checkAuth = async () => {
      try {
        const data = await apiFetch('/api/users/profile/');
        setUser({ ...data, role }); // Gabungkan data profile dengan role dari localStorage
      } catch (err) {
        console.error('Token invalid atau expired:', err);
        logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (nickname, pin) => {
    try {
      const data = await apiFetch('/api/auth/', {
        method: 'POST',
        body: JSON.stringify({ nickname, pin }),
      });

      const { token, role, must_change_pin } = data;

      if (!token) {
        throw new Error('Token tidak ditemukan');
      }

      // Simpan token & role di localStorage
      localStorage.setItem('bs_token', token);
      localStorage.setItem('bs_role', role);
      
      setUser({ ...data, role });

      // Handle force change PIN
      if (must_change_pin) {
        router.push('/profile?change-pin=true');
        return { success: true, mustChangePin: true };
      }

      // Redirect berdasarkan role
      if (role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else if (role === 'PETUGAS') {
        router.push('/petugas/dashboard');
      } else if (role === 'NASABAH') {
        router.push('/nasabah/dashboard');
      } else {
        router.push('/');
      }

      return { success: true, mustChangePin: false };
    } catch (err) {
      return { 
        success: false, 
        error: err.message || 'Login gagal' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('bs_token');
    localStorage.removeItem('bs_role');
    setUser(null);
    router.push('/login');
  };

  const changePin = async (oldPin, newPin) => {
    try {
      await apiFetch('/api/auth/change-pin/', {
        method: 'POST',
        body: JSON.stringify({ old_pin: oldPin, new_pin: newPin }),
      });
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err.message || 'Gagal ganti PIN' 
      };
    }
  };

  return { 
    user, 
    loading, 
    login, 
    logout,
    changePin 
  };
}