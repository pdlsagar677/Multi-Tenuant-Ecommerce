import { create } from 'zustand';
import { IVendor, ICreateVendorRequest, ITemplate } from '../types/vendor';
import api from '../lib/axios';
import toast from 'react-hot-toast';

interface VendorState {
  vendors: IVendor[];
  selectedVendor: IVendor | null;
  templates: ITemplate[];
  isLoading: boolean;
  totalVendors: number;
  
  // Actions
  fetchVendors: () => Promise<void>;
  fetchTemplates: () => Promise<void>;
  createVendor: (data: ICreateVendorRequest) => Promise<IVendor>;
  updateVendor: (id: string, data: Partial<IVendor>) => Promise<void>;
  deleteVendor: (id: string) => Promise<void>;
  setSelectedVendor: (vendor: IVendor | null) => void;
}

export const useVendorStore = create<VendorState>((set, get) => ({
  vendors: [],
  selectedVendor: null,
  templates: [],
  isLoading: false,
  totalVendors: 0,

  fetchVendors: async () => {
    try {
      set({ isLoading: true });
      const response = await api.get('/admin/vendors');
      set({ 
        vendors: response.data.data, 
        totalVendors: response.data.count,
        isLoading: false 
      });
    } catch (error: any) {
      set({ isLoading: false });
      toast.error('Failed to fetch vendors');
      console.error(error);
    }
  },

  fetchTemplates: async () => {
    try {
      const response = await api.get('/admin/templates');
      set({ templates: response.data.data });
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    }
  },

  createVendor: async (data: ICreateVendorRequest) => {
    try {
      set({ isLoading: true });
      const response = await api.post('/admin/create-vendor', data);
      const newVendor = response.data.data.vendor;
      
      // Update vendors list
      set((state) => ({ 
        vendors: [newVendor, ...state.vendors],
        isLoading: false 
      }));
      
      toast.success('Vendor created successfully!');
      return newVendor;
    } catch (error: any) {
      set({ isLoading: false });
      toast.error(error.response?.data?.message || 'Failed to create vendor');
      throw error;
    }
  },

  updateVendor: async (id: string, data: Partial<IVendor>) => {
    try {
      set({ isLoading: true });
      const response = await api.put(`/admin/vendors/${id}`, data);
      
      // Update vendors list
      set((state) => ({
        vendors: state.vendors.map(v => 
          v._id === id ? { ...v, ...response.data.data } : v
        ),
        isLoading: false
      }));
      
      toast.success('Vendor updated successfully!');
    } catch (error: any) {
      set({ isLoading: false });
      toast.error(error.response?.data?.message || 'Failed to update vendor');
      throw error;
    }
  },

  deleteVendor: async (id: string) => {
    try {
      set({ isLoading: true });
      await api.delete(`/admin/vendors/${id}`);
      
      // Remove from vendors list
      set((state) => ({
        vendors: state.vendors.filter(v => v._id !== id),
        isLoading: false
      }));
      
      toast.success('Vendor deactivated successfully!');
    } catch (error: any) {
      set({ isLoading: false });
      toast.error(error.response?.data?.message || 'Failed to delete vendor');
      throw error;
    }
  },

  setSelectedVendor: (vendor: IVendor | null) => {
    set({ selectedVendor: vendor });
  },
}));