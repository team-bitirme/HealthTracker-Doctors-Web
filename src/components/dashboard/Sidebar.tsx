'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { ActivePage } from './Dashboard';
import {
  HomeIcon,
  UsersIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface SidebarProps {
  activePage: ActivePage;
  onPageChange: (page: ActivePage) => void;
  userName: string;
}

const navigation = [
  { name: 'Dashboard', key: 'dashboard' as ActivePage, icon: HomeIcon },
  { name: 'Hastalar', key: 'patients' as ActivePage, icon: UsersIcon },
  { name: 'Mesajlar', key: 'messages' as ActivePage, icon: ChatBubbleLeftRightIcon },
  { name: 'Profil', key: 'profile' as ActivePage, icon: UserIcon },
];

export function Sidebar({ activePage, onPageChange, userName }: SidebarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { signOut } = useAuthStore();

  const handleSignOut = async () => {
    if (confirm('Çıkış yapmak istediğinize emin misiniz?')) {
      await signOut();
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo ve başlık */}
      <div className="flex items-center justify-center px-6 py-8">
        <div className="flex items-center">
          <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-xl">🩺</span>
          </div>
          <div className="ml-3">
            <h1 className="text-lg font-semibold text-gray-900">HealthTracker</h1>
            <p className="text-sm text-gray-500">Doktor Paneli</p>
          </div>
        </div>
      </div>

      {/* Kullanıcı bilgisi */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
            <UserIcon className="h-5 w-5 text-gray-600" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">{userName}</p>
            <p className="text-xs text-gray-500">Doktor</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-6 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = activePage === item.key;
          return (
            <button
              key={item.name}
              onClick={() => {
                onPageChange(item.key);
                setMobileMenuOpen(false);
              }}
              className={`
                w-full group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                ${isActive
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
            >
              <item.icon
                className={`
                  mr-3 h-5 w-5 flex-shrink-0
                  ${isActive ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-500'}
                `}
              />
              {item.name}
            </button>
          );
        })}
      </nav>

      {/* Çıkış butonu */}
      <div className="px-6 py-4 border-t border-gray-200">
        <button
          onClick={handleSignOut}
          className="w-full group flex items-center px-3 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 transition-colors"
        >
          <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 flex-shrink-0" />
          Çıkış Yap
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden">
        <button
          type="button"
          className="fixed top-4 left-4 z-50 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <Bars3Icon className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 overflow-y-auto">
          <SidebarContent />
        </div>
      </div>

      {/* Mobile sidebar */}
      <div className={`lg:hidden fixed inset-0 z-40 ${mobileMenuOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setMobileMenuOpen(false)} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <SidebarContent />
        </div>
      </div>
    </>
  );
}