'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FiHome, 
  FiUsers, 
  FiShoppingBag, 
  FiSettings, 
  FiBarChart2,
  FiFileText,
  FiCreditCard
} from 'react-icons/fi';

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: FiHome },
  { name: 'Vendors', href: '/admin/vendors', icon: FiUsers },
  { name: 'Templates', href: '/admin/templates', icon: FiFileText },
  { name: 'Products', href: '/admin/products', icon: FiShoppingBag },
  { name: 'Orders', href: '/admin/orders', icon: FiCreditCard },
  { name: 'Analytics', href: '/admin/analytics', icon: FiBarChart2 },
  { name: 'Settings', href: '/admin/settings', icon: FiSettings },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <nav className="p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}