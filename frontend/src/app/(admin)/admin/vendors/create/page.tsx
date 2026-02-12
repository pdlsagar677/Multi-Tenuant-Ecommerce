'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useVendorStore } from '../../../../../store/vendorStore';
import { Button } from '../../../../../components/ui/Button';
import { Input } from '../../../../../components/ui/Input';
import { Card } from '../../../../../components/ui/Card';
import { ICreateVendorRequest } from '../../../../../types/vendor';
import { FiSave, FiEye, FiCopy, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function CreateVendorPage() {
  const router = useRouter();
  const { createVendor, templates, fetchTemplates, isLoading } = useVendorStore();
  const [previewUrl, setPreviewUrl] = useState('');
  const [copied, setCopied] = useState(false);
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<ICreateVendorRequest>({
    defaultValues: {
      template: 'modern-blue',
      theme: {
        primaryColor: '#4F46E5',
        secondaryColor: '#10B981',
        accentColor: '#F59E0B',
        fontFamily: 'Inter',
        bannerText: ''
      }
    }
  });

  const vendorName = watch('vendorName');
  const subdomain = watch('subdomain');
  const primaryColor = watch('theme.primaryColor');
  const bannerText = watch('theme.bannerText');
  const selectedTemplate = watch('template');

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  useEffect(() => {
    if (vendorName) {
      const generated = vendorName
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
      setValue('subdomain', generated);
      setValue('theme.bannerText', `Welcome to ${vendorName}!`);
    }
  }, [vendorName, setValue]);

  useEffect(() => {
    if (subdomain) {
      setPreviewUrl(`http://${subdomain}.${process.env.NEXT_PUBLIC_BASE_DOMAIN}`);
    }
  }, [subdomain]);

  const onSubmit = async (data: ICreateVendorRequest) => {
    try {
      const vendor = await createVendor(data);
      
      // Store vendor credentials in localStorage to show on vendors page
      const vendorData = {
        ...vendor,
        password: data.password // Original password
      };
      localStorage.setItem('lastCreatedVendor', JSON.stringify(vendorData));
      
      toast.success('Vendor created successfully!');
      router.push('/admin/vendors');
    } catch (error) {
      // Error handled in store
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Copied to clipboard!');
  };

  const templates = [
    { id: 'modern-blue', name: 'Modern Blue', color: '#4F46E5', bg: 'bg-blue-50' },
    { id: 'dark-tech', name: 'Dark Tech', color: '#1F2937', bg: 'bg-gray-900' },
    { id: 'minimal-white', name: 'Minimal White', color: '#FFFFFF', bg: 'bg-white' },
    { id: 'emerald-green', name: 'Emerald Green', color: '#10B981', bg: 'bg-green-50' },
    { id: 'sunset-orange', name: 'Sunset Orange', color: '#F59E0B', bg: 'bg-orange-50' },
    { id: 'royal-purple', name: 'Royal Purple', color: '#8B5CF6', bg: 'bg-purple-50' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Vendor</h1>
          <p className="text-gray-600 mt-1">
            Set up a new vendor store with custom subdomain and theme
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push('/admin/vendors')}
        >
          Cancel
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Column */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Vendor Information */}
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Vendor Information
              </h2>
              
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Vendor Name *"
                  placeholder="e.g., Fashion Store"
                  error={errors.vendorName?.message}
                  {...register('vendorName', {
                    required: 'Vendor name is required'
                  })}
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subdomain *
                  </label>
                  <div className="flex items-center">
                    <Input
                      placeholder="fashion-store"
                      error={errors.subdomain?.message}
                      className="rounded-r-none"
                      {...register('subdomain', {
                        required: 'Subdomain is required',
                        pattern: {
                          value: /^[a-z0-9-]+$/,
                          message: 'Only lowercase letters, numbers, and hyphens'
                        }
                      })}
                    />
                    <span className="px-3 py-2 bg-gray-50 border border-l-0 rounded-r-lg text-sm text-gray-500">
                      .localhost:3000
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    URL: {previewUrl || 'http://{subdomain}.localhost:3000'}
                  </p>
                </div>
              </div>
            </Card>

            {/* Admin Account */}
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Admin Account
              </h2>
              
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Owner Name *"
                  placeholder="John Doe"
                  error={errors.ownerName?.message}
                  {...register('ownerName', {
                    required: 'Owner name is required'
                  })}
                />
                
                <Input
                  label="Owner Email *"
                  type="email"
                  placeholder="owner@store.com"
                  error={errors.ownerEmail?.message}
                  {...register('ownerEmail', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                />
                
                <Input
                  label="Password *"
                  type="password"
                  placeholder="••••••••"
                  error={errors.password?.message}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                />
                
                <div className="flex items-end">
                  <button
                    type="button"
                    className="text-sm text-blue-600 hover:text-blue-700"
                    onClick={() => {
                      const generated = Math.random().toString(36).slice(-8);
                      setValue('password', generated);
                      toast.success('Password generated!');
                    }}
                  >
                    Generate Password
                  </button>
                </div>
              </div>
            </Card>

            {/* Template Selection */}
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Store Template
              </h2>
              
              <div className="grid grid-cols-3 gap-4">
                {templates.map((temp) => (
                  <label
                    key={temp.id}
                    className={`relative border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedTemplate === temp.id
                        ? 'border-blue-500 ring-2 ring-blue-200 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      value={temp.id}
                      {...register('template')}
                      className="sr-only"
                    />
                    <div className="flex flex-col items-center">
                      <div
                        className="w-12 h-12 rounded-lg mb-2"
                        style={{ backgroundColor: temp.color }}
                      />
                      <span className="text-sm font-medium">{temp.name}</span>
                    </div>
                  </label>
                ))}
              </div>
            </Card>

            {/* Theme Customization */}
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Theme Customization
              </h2>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Primary Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      className="w-10 h-10 border rounded"
                      {...register('theme.primaryColor')}
                    />
                    <Input
                      {...register('theme.primaryColor')}
                      className="flex-1"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Secondary Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      className="w-10 h-10 border rounded"
                      {...register('theme.secondaryColor')}
                    />
                    <Input
                      {...register('theme.secondaryColor')}
                      className="flex-1"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Accent Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      className="w-10 h-10 border rounded"
                      {...register('theme.accentColor')}
                    />
                    <Input
                      {...register('theme.accentColor')}
                      className="flex-1"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Font Family
                  </label>
                  <select
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    {...register('theme.fontFamily')}
                  >
                    <option value="Inter">Inter</option>
                    <option value="Poppins">Poppins</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Open Sans">Open Sans</option>
                  </select>
                </div>
                
                <div className="col-span-2">
                  <Input
                    label="Banner Text"
                    placeholder="Welcome message for store"
                    {...register('theme.bannerText')}
                  />
                </div>
              </div>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/admin/vendors')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={isLoading}
                icon={<FiSave />}
              >
                Create Vendor
              </Button>
            </div>
          </form>
        </div>

        {/* Preview Column */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Store Preview</h2>
              <button
                onClick={() => copyToClipboard(previewUrl)}
                className="text-gray-500 hover:text-gray-700"
              >
                {copied ? <FiCheck className="text-green-600" /> : <FiCopy />}
              </button>
            </div>
            
            {/* Mini Store Preview */}
            <div 
              className="rounded-lg overflow-hidden border"
              style={{ 
                backgroundColor: primaryColor + '10',
                borderColor: primaryColor + '30'
              }}
            >
              {/* Header */}
              <div 
                className="p-4"
                style={{ backgroundColor: primaryColor }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                      <span className="text-lg">🛍️</span>
                    </div>
                    <span className="font-semibold text-white">
                      {vendorName || 'Your Store'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-6 h-6 bg-white/20 rounded"></div>
                    <div className="w-6 h-6 bg-white/20 rounded"></div>
                  </div>
                </div>
              </div>
              
              {/* Banner */}
              <div className="p-4 bg-white">
                <p className="text-sm text-gray-600">
                  {bannerText || 'Welcome to our store!'}
                </p>
              </div>
              
              {/* Product Grid */}
              <div className="p-4 bg-gray-50">
                <div className="grid grid-cols-2 gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white p-2 rounded border">
                      <div className="aspect-square bg-gray-100 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4 mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">📋 After creation:</span>
                <br />
                • Store URL and admin credentials will be shown
                <br />
                • Vendor can login and start adding products
                <br />
                • Customer can visit store immediately
              </p>
            </div>

            {previewUrl && (
              <div className="mt-4">
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <FiEye />
                  Preview store in new tab
                </a>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}