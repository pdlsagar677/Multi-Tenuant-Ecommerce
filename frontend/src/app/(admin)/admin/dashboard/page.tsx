'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../../../store/authStore';
import { useVendorStore } from '../../../../store/vendorStore';
import { Button } from '../../../../components/ui/Button';
import { Card } from '../../../../components/ui/Card';
import { FiPlus, FiUsers, FiShoppingBag, FiDollarSign, FiTrendingUp } from 'react-icons/fi';
import Link from 'next/link';

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { vendors, fetchVendors, isLoading } = useVendorStore();
  const [stats, setStats] = useState({
    totalVendors: 0,
    activeVendors: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    // Check if user is super admin
    if (user && user.role !== 'SUPER_ADMIN') {
      router.push('/');
    }
    
    fetchVendors();
  }, [user, router, fetchVendors]);

  useEffect(() => {
    if (vendors.length > 0) {
      setStats({
        totalVendors: vendors.length,
        activeVendors: vendors.filter(v => v.isActive).length,
        totalProducts: 1250, // This would come from API
        totalOrders: 342,     // This would come from API
        totalRevenue: 45780   // This would come from API
      });
    }
  }, [vendors]);

  const StatCard = ({ title, value, icon, trend }: any) => (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
          {trend && (
            <p className="text-xs text-green-600 mt-1">
              <FiTrendingUp className="inline mr-1" />
              {trend} from last month
            </p>
          )}
        </div>
        <div className="p-3 bg-blue-50 rounded-lg">
          {icon}
        </div>
      </div>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {user?.name}! Here's your platform overview.
          </p>
        </div>
        <Link href="/admin/vendors/create">
          <Button icon={<FiPlus />}>
            Create New Vendor
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Vendors"
          value={stats.totalVendors}
          icon={<FiUsers className="h-6 w-6 text-blue-600" />}
          trend="+2"
        />
        <StatCard
          title="Active Vendors"
          value={stats.activeVendors}
          icon={<FiShoppingBag className="h-6 w-6 text-green-600" />}
        />
        <StatCard
          title="Total Products"
          value={stats.totalProducts.toLocaleString()}
          icon={<FiShoppingBag className="h-6 w-6 text-purple-600" />}
          trend="+45"
        />
        <StatCard
          title="Total Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          icon={<FiDollarSign className="h-6 w-6 text-yellow-600" />}
          trend="+12.5%"
        />
      </div>

      {/* Recent Vendors */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Vendors</h2>
          <Link href="/admin/vendors" className="text-sm text-blue-600 hover:text-blue-700">
            View All →
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Store Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subdomain
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {vendors.slice(0, 5).map((vendor) => (
                <tr key={vendor._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{vendor.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <a
                      href={vendor.storeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      {vendor.subdomain}.localhost:3000
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{vendor.owner?.name}</div>
                    <div className="text-xs text-gray-500">{vendor.owner?.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      vendor.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {vendor.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(vendor.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/admin/vendors/${vendor._id}`}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => {/* Handle delete */}}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <FiUsers className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Vendor Management</h3>
              <p className="text-sm text-gray-600 mt-1">
                Create, edit, or deactivate vendor stores
              </p>
              <Link
                href="/admin/vendors"
                className="text-sm text-blue-600 hover:text-blue-700 mt-2 inline-block"
              >
                Manage Vendors →
              </Link>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-50 rounded-lg">
              <FiShoppingBag className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Product Templates</h3>
              <p className="text-sm text-gray-600 mt-1">
                Manage store templates and themes
              </p>
              <Link
                href="/admin/templates"
                className="text-sm text-blue-600 hover:text-blue-700 mt-2 inline-block"
              >
                Manage Templates →
              </Link>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <FiDollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Reports</h3>
              <p className="text-sm text-gray-600 mt-1">
                View platform analytics and reports
              </p>
              <Link
                href="/admin/reports"
                className="text-sm text-blue-600 hover:text-blue-700 mt-2 inline-block"
              >
                View Reports →
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}