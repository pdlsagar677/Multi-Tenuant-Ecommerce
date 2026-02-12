import { create } from 'zustand';
import { IProduct, ICreateProductRequest } from '../types/product';
import api from '../lib/axios';
import toast from 'react-hot-toast';

interface ProductState {
  products: IProduct[];
  selectedProduct: IProduct | null;
  isLoading: boolean;
  totalProducts: number;
  
  // Actions
  fetchProducts: (vendorId?: string) => Promise<void>;
  createProduct: (data: ICreateProductRequest) => Promise<void>;
  updateProduct: (id: string, data: Partial<IProduct>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  setSelectedProduct: (product: IProduct | null) => void;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  selectedProduct: null,
  isLoading: false,
  totalProducts: 0,

  fetchProducts: async (vendorId?: string) => {
    try {
      set({ isLoading: true });
      const params = vendorId ? { vendorId } : {};
      const response = await api.get('/vendor/products', { params });
      set({ 
        products: response.data.data, 
        totalProducts: response.data.total,
        isLoading: false 
      });
    } catch (error) {
      set({ isLoading: false });
      console.error('Failed to fetch products:', error);
    }
  },

  createProduct: async (data: ICreateProductRequest) => {
    try {
      set({ isLoading: true });
      const response = await api.post('/vendor/products', data);
      
      set((state) => ({
        products: [response.data.data, ...state.products],
        isLoading: false
      }));
      
      toast.success('Product created successfully!');
    } catch (error: any) {
      set({ isLoading: false });
      toast.error(error.response?.data?.message || 'Failed to create product');
      throw error;
    }
  },

  updateProduct: async (id: string, data: Partial<IProduct>) => {
    try {
      set({ isLoading: true });
      const response = await api.put(`/vendor/products/${id}`, data);
      
      set((state) => ({
        products: state.products.map(p => 
          p._id === id ? { ...p, ...response.data.data } : p
        ),
        isLoading: false
      }));
      
      toast.success('Product updated successfully!');
    } catch (error: any) {
      set({ isLoading: false });
      toast.error(error.response?.data?.message || 'Failed to update product');
      throw error;
    }
  },

  deleteProduct: async (id: string) => {
    try {
      set({ isLoading: true });
      await api.delete(`/vendor/products/${id}`);
      
      set((state) => ({
        products: state.products.filter(p => p._id !== id),
        isLoading: false
      }));
      
      toast.success('Product deleted successfully!');
    } catch (error: any) {
      set({ isLoading: false });
      toast.error(error.response?.data?.message || 'Failed to delete product');
      throw error;
    }
  },

  setSelectedProduct: (product: IProduct | null) => {
    set({ selectedProduct: product });
  },
}));