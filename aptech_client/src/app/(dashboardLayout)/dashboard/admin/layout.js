'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AdminSidebar from '@/components/Admin/AdminSidebar';
import ProtectedRoute from '@/app/providers/protectedRoutes';
import NotificationBell from '@/components/Shared/NotificationBell';
import {
  FiUser, FiSettings, FiLogOut, FiChevronDown,
  FiBell, FiExternalLink,
} from 'react-icons/fi';

const AdminLayout = ({ children }) => {
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const pathname = usePathname();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try { setUser(JSON.parse(storedUser)); } catch (e) { }
    }
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => { setDropdownOpen(false); }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  // Readable page title + breadcrumb from the URL
  const TITLES = {
    admin: 'Dashboard', payments: 'Payment History', analytics: 'Income Analytics', course: 'Courses',
    category: 'Categories', batch: 'Batches', mentor: 'Mentors', blog: 'Blog', books: 'Books',
    certification: 'Certifications', 'notice-board': 'Notice Board', 'site-content': 'Site Content',
    images: 'Site Photos', contact: 'Contact Page', user: 'Users', create: 'Create', orders: 'Orders', classes: 'Classes & Materials', attendance: 'Attendance', enrollments: 'Enrollments',
  };
  const nice = (seg) => TITLES[seg] || (/^[a-f0-9]{24}$/i.test(seg) ? 'Details' : seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' '));
  const segs = pathname.split('/').filter(Boolean).slice(2); // after /dashboard/admin
  const pageTitle = segs.length ? nice(segs[segs.length - 1]) : 'Dashboard';
  const crumbs = segs.map((seg, i) => ({ label: nice(seg), href: '/dashboard/admin/' + segs.slice(0, i + 1).join('/') }));

  const userName = user?.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : user?.name || 'Admin';
  const userInitial = userName.charAt(0).toUpperCase();
  const userRole = user?.role === 'superAdmin' ? 'Super Admin' : user?.role === 'trainingManager' ? 'Training Manager' : 'Admin';

  return (
    <ProtectedRoute allowedRoles={["superAdmin", "admin", "trainingManager"]}>
      <div className="min-h-screen bg-[#f5f7fa] work">
        <AdminSidebar />

        {/* Main Content */}
        <main className="min-h-screen min-w-0 transition-all duration-300 lg:ml-[250px]">
          {/* Top bar */}
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
            <div className="flex h-14 items-center justify-between pl-14 pr-4 lg:px-6">
              <div className="min-w-0">
                <nav className="flex items-center gap-1 text-[12px] text-slate-400">
                  <Link href="/dashboard/admin" className="hover:text-[#0142b2]">Admin</Link>
                  {crumbs.map((c) => (
                    <React.Fragment key={c.href}>
                      <span>/</span>
                      <Link href={c.href} className="truncate hover:text-[#0142b2]">{c.label}</Link>
                    </React.Fragment>
                  ))}
                </nav>
                <h2 className="truncate text-[17px] font-bold leading-tight text-[#0b1b4a] outfit">{pageTitle}</h2>
              </div>

              {/* Right Side — Search, Notification, Profile */}
              <div className="flex items-center gap-2">
                <Link href="/" target="_blank" className="hidden sm:inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:border-[#0142b2] hover:text-[#0142b2]">
                  <FiExternalLink size={13} /> View site
                </Link>

                {/* Notification Bell */}
                <div className="relative">
                  <NotificationBell />
                </div>

                {/* Divider */}
                <div className="w-px h-7 bg-slate-200 mx-1 hidden sm:block" />

                {/* Profile Dropdown */}
                <div ref={dropdownRef} className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 rounded-md py-1 pl-1 pr-2 hover:bg-slate-50 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#0142b2] flex items-center justify-center text-white text-xs font-bold">
                      {userInitial}
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-semibold text-slate-700 leading-tight max-w-[120px] truncate">
                        {userName}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium leading-tight">
                        {userRole}
                      </p>
                    </div>
                    <FiChevronDown
                      size={14}
                      className={`text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {dropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-md border border-slate-200 shadow-lg py-1">
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="text-sm font-semibold text-slate-800 truncate">{userName}</p>
                        <p className="text-xs text-slate-400 truncate">{user?.email || ''}</p>
                      </div>

                      <div className="py-1">
                        {[
                          { icon: FiUser, label: 'My Profile', href: '/dashboard/admin/settings' },
                          { icon: FiSettings, label: 'Settings', href: '/dashboard/admin/settings' },
                          { icon: FiBell, label: 'Notifications', href: '/dashboard/admin/notifications' },
                        ].map((item) => {
                          const Icon = item.icon;
                          return (
                            <Link
                              key={item.label}
                              href={item.href}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-[#eef3fc] hover:text-[#0142b2] transition-colors"
                            >
                              <Icon size={15} className="text-slate-400" />
                              {item.label}
                            </Link>
                          );
                        })}
                      </div>

                      <div className="border-t border-slate-100 pt-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-rose-500 hover:bg-rose-50 w-full transition-colors"
                        >
                          <FiLogOut size={15} />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <div className="admin-content mx-auto max-w-[1440px] min-w-0 p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>
      <style jsx global>{`
        /* Admin readability: lift the tiny text sizes used across admin pages */
        .admin-content [class~="text-[9px]"], .admin-content [class~="text-[10px]"] { font-size: 11.5px; }
        .admin-content [class~="text-[11px]"] { font-size: 12.5px; }
        .admin-content .text-xs { font-size: 13px; line-height: 1.15rem; }
        .admin-content .text-sm { font-size: 14.5px; }
        /* Wide tables wrap instead of pushing the page sideways */
        .admin-content table { max-width: 100%; }
      `}</style>
    </ProtectedRoute>
  );
};

export default AdminLayout;
