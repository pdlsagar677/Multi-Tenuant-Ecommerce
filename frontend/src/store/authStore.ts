import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { IUser } from '../types/user';
import api from '../lib/axios';
import toast from 'react-hot-toast';

interface AuthState {
  user: IUser | null;
  token: string | null;
  isLoading: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role?: string) => Promise<void>;
  logout: () => void;
  setUser: (user: IUser) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true });
          const response = await api.post('/auth/login', { email, password });
          const { token, user } = response.data;
          
          localStorage.setItem('token', token);
          set({ user, token, isLoading: false });
          
          toast.success('Login successful!');
        } catch (error: any) {
          set({ isLoading: false });
          toast.error(error.response?.data?.message || 'Login failed');
          throw error;
        }
      },

      signup: async (name: string, email: string, password: string, role = 'CUSTOMER') => {
        try {
          set({ isLoading: true });
          const response = await api.post('/auth/signup', { name, email, password, role });
          const { token, user } = response.data;
          
          localStorage.setItem('token', token);
          set({ user, token, isLoading: false });
          
          toast.success('Account created successfully!');
        } catch (error: any) {
          set({ isLoading: false });
          toast.error(error.response?.data?.message || 'Signup failed');
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ user: null, token: null });
        toast.success('Logged out successfully');
        window.location.href = '/login';
      },

      setUser: (user: IUser) => {
        set({ user });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);