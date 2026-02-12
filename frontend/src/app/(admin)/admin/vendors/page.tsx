'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useVendorStore } from '../../../../store/vendorStore';
import { Button } from '../../../../components/ui/Button';
import { Card } from '../../../../components/ui/Card';
import { Input } from '../../../../components/ui/Input';
import { 
  FiPlus, 
  FiSearch, 
  FiEdit2, 
  FiTrash2, 
  FiExternalLink,
  FiCopy,
  FiCheck,
  FiFilter
} from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function VendorsPage() {
  const router = useRouter();
  const { vendors, fetchVendors, deleteVendor, isLoading } = useVendorStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showCredentials, setShowCredentials] = useState<any>(null);

  useEffect(() => {
    fetchVendors();
    
    // Check for newly created vendor
    const lastVendor = localStorage.getItem('lastCreatedVendor');
    if (lastVendor) {
      setShowCredentials(JSON.parse(lastVendor));
      localStorage.removeItem('lastCreatedVendor');
    }
  }, [fetchVendors]);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to deactivate this vendor?')) {
      await deleteVendor(id);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success('Copied to clipboard!');
  };

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = 
      vendor.name.toLowerCase().includes(search.toLowerCase()) ||
      vendor.subdomain.toLowerCase().includes(search.toLowerCase()) ||
      vendor.owner?.email?.toLowerCase().includes(search.toLowerCase());
    
    const matchesFilter = 
      filter === 'all' ? true :
      filter === 'active' ? vendor.isActive :
      filter === 'inactive' ? !vendor.isActive : true;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vendors</h1>
          <p className="text-gray-600 mt-1">
            Manage all vendor stores on the platform
          </p>
        </div>
        <Link href="/admin/vendors/create">
          <Button icon={<FiPlus />}>
            Create New Vendor
          </Button>
        </Link>
      </div>

      {/* Success Modal for New Vendor */}
      {showCredentials && (
        <Card className="bg-green-50 border-green-200">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">✅</span>
                <h3 className="font-semibold text-green-800">
                  Vendor Created Successfully!
                </h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Store URL:</p>
                  <div className="flex items-center gap-2">
                    <a
                      href={showCredentials.storeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {showCredentials.subdomain}.localhost:3000
                    </a>
                    <button
                      onClick={() => copyToClipboard(showCredentials.storeUrl, 'url')}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      {copiedId === 'url' ? <FiCheck className="text-green-600" /> : <FiCopy />}
                    </button>
                  </div>
                </div>
                
                <div>
                  <p className="text-gray-600">Admin Email:</p>
                  <p className="font-medium">{showCredentials.admin?.email}</p>
                </div>
                
                <div>
                  <p className="text-gray-600">Admin Password:</p>
                  <div className="flex items-center gap-2">
                    <code className="px-2 py-1 bg-gray-100 rounded text-sm">
                      {showCredentials.password}
                    </code>
                    <button
                      onClick={() => copyToClipboard(showCredentials.password, 'pwd')}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      {copiedId === 'pwd' ? <FiCheck className="text-green-600" /> : <FiCopy />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setShowCredentials(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
        </Card>
      )}

      {/* Search & Filter */}
      <Card>
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search vendors by name, subdomain or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<FiSearch className="text-gray-400" />}
            />
          </div>
          <select
            className="px-4 py-2 border rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-blue-500"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Vendors</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </Card>

      {/* Vendors Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVendors.map((vendor) => (
            <Card key={vendor._id} className="hover:shadow-lg transition-shadow">
              {/* Store Header with Theme Color */}
              <div 
                className="h-24 -m-6 mb-4 rounded-t-xl p-4 relative"
                style={{ 
                  backgroundColor: vendor.theme?.primaryColor || '#4F46E5',
                  backgroundImage: `linear-gradient(135deg, ${vendor.theme?.primaryColor} 0%, ${vendor.theme?.secondaryColor} 100%)`
                }}
              >
                {vendor.theme?.logo ? (
                  <img 
                    src={vendor.theme.logo} 
                    alt={vendor.name}
                    className="h-8 object-contain"
                  />
                ) : (
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <span className="text-white text-lg">🛍️</span>
                  </div>
                )}
                
                <span className={`absolute top-4 right-4 text-xs px-2 py-1 rounded-full ${
                  vendor.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {vendor.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Vendor Info */}
              <div className="mb-4">
                <h3 className="font-semibold text-lg text-gray-900 mb-1">
                  {vendor.name}
                </h3>
                
                <div className="flex items-center gap-2 mb-2">
                  <a
                    href={vendor.storeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    {vendor.subdomain}.localhost:3000
                    <FiExternalLink className="h-3 w-3" />
                  </a>
                  <button
                    onClick={() => copyToClipboard(vendor.storeUrl, vendor._id)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {copiedId === vendor._id ? (
                      <FiCheck className="h-3 w-3 text-green-600" />
                    ) : (
                      <FiCopy className="h-3 w-3" />
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                    {vendor.template}
                  </span>
                  <span>•</span>
                  <span>
                    Created {new Date(vendor.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Owner Info */}
              <div className="border-t pt-4 mb-4">
                <p className="text-xs text-gray-500 mb-1">Store Owner</p>
                <p className="font-medium text-gray-900">{vendor.owner?.name}</p>
                <p className="text-sm text-gray-600">{vendor.owner?.email}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/admin/vendors/${vendor._id}/edit`)}
                    className="p-2 text-gray-600 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                    title="Edit Vendor"
                  >
                    <FiEdit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(vendor._id)}
                    className="p-2 text-gray-600 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    title="Deactivate Vendor"
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </div>
                
                <Link
                  href={`/admin/vendors/${vendor._id}`}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View Details →
                </Link>
              </div>
            </Card>
          ))}

          {filteredVendors.length === 0 && (
            <div className="col-span-full text-center py-12">
              <div className="text-6xl mb-4">🏪</div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                No vendors found
              </h3>
              <p className="text-gray-600 mb-6">
                {search || filter !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Get started by creating your first vendor store'}
              </p>
              {!search && filter === 'all' && (
                <Link href="/admin/vendors/create">
                  <Button icon={<FiPlus />}>
                    Create Your First Vendor
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}