'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FiHome, FiUsers, FiAward, FiFileText, FiUserCheck, FiMenu, FiX, FiLogOut, FiChevronDown, FiArrowLeft,
  FiSettings, FiShoppingCart, FiDollarSign, FiBarChart2, FiBell, FiTag, FiGlobe, FiClipboard, FiBook,
  FiLayers, FiCalendar, FiUser, FiEdit3, FiBookOpen,
} from 'react-icons/fi';
import { useSettings } from '@/context/SettingsContext';

// Brand: blue #0142b2, navy #0b1b4a, red #e5251f
const MENU = [
  {
    label: 'Overview',
    items: [{ title: 'Dashboard', href: '/dashboard/admin', icon: FiHome, exact: true }],
  },
  {
    label: 'Payments & Reports',
    items: [
      { title: 'Payment History', href: '/dashboard/admin/payments', icon: FiDollarSign, deny: ['trainingManager'] },
      { title: 'Income Analytics', href: '/dashboard/admin/analytics', icon: FiBarChart2, deny: ['trainingManager'] },
      { title: 'Reports', href: '/dashboard/admin/reports', icon: FiFileText },
    ],
  },
  {
    label: 'Sales',
    items: [
      { title: 'Orders', href: '/dashboard/admin/orders', icon: FiShoppingCart },
      { title: 'Course Enrollments', href: '/dashboard/admin/enrollments', icon: FiUserCheck },
      { title: 'Book Enrollments', href: '/dashboard/admin/books/enrollments', icon: FiBookOpen },
      { title: 'Coupons', href: '/dashboard/admin/coupons', icon: FiTag },
    ],
  },
  {
    label: 'Courses',
    items: [
      {
        title: 'Courses', icon: FiLayers,
        submenu: [
          { title: 'All Courses', href: '/dashboard/admin/course', exact: true },
          { title: 'Add Course', href: '/dashboard/admin/course/create' },
          { title: 'Categories', href: '/dashboard/admin/category', exact: true },
          { title: 'Add Category', href: '/dashboard/admin/category/create' },
        ],
      },
      {
        title: 'Batches', icon: FiCalendar,
        submenu: [
          { title: 'All Batches', href: '/dashboard/admin/batch', exact: true },
          { title: 'Add Batch', href: '/dashboard/admin/batch/create' },
        ],
      },
      {
        title: 'Mentors', icon: FiUser,
        submenu: [
          { title: 'All Mentors', href: '/dashboard/admin/mentor', exact: true },
          { title: 'Add Mentor', href: '/dashboard/admin/mentor/create' },
        ],
      },
      { title: 'Certifications', href: '/dashboard/admin/certification', icon: FiAward },
    ],
  },
  {
    label: 'Bookstore',
    items: [
      {
        title: 'Books', icon: FiBook,
        submenu: [
          { title: 'All Books', href: '/dashboard/admin/books', exact: true },
          { title: 'Add Book', href: '/dashboard/admin/books/create' },
        ],
      },
    ],
  },
  {
    label: 'Communication',
    items: [
      { title: 'Notice Board', href: '/dashboard/admin/notice-board', icon: FiClipboard },
      { title: 'Notifications', href: '/dashboard/admin/notifications', icon: FiBell },
    ],
  },
  {
    label: 'Website',
    items: [
      {
        title: 'Site Content', icon: FiGlobe,
        submenu: [
          { title: 'Contact Page', href: '/dashboard/admin/site-content/contact' },
          { title: 'Site Photos', href: '/dashboard/admin/site-content/images' },
        ],
      },
      {
        title: 'Blog', icon: FiEdit3,
        submenu: [
          { title: 'All Posts', href: '/dashboard/admin/blog', exact: true },
          { title: 'Add Post', href: '/dashboard/admin/blog/create' },
        ],
      },
    ],
  },
  {
    label: 'Administration',
    items: [
      {
        title: 'Users', icon: FiUsers,
        submenu: [
          { title: 'Team / Staff', href: '/dashboard/admin/user/staff', deny: ['trainingManager'] },
          { title: 'Students', href: '/dashboard/admin/user/students' },
        ],
      },
      { title: 'Settings', href: '/dashboard/admin/settings', icon: FiSettings },
    ],
  },
];

// Hide items a role isn't allowed to see; drop submenu parents left empty.
const filterByRole = (items, r) => items
  .filter((it) => !(it.deny && it.deny.includes(r)))
  .map((it) => (it.submenu ? { ...it, submenu: filterByRole(it.submenu, r) } : it))
  .filter((it) => !it.submenu || it.submenu.length > 0);

const readUser = () => {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(localStorage.getItem('user') || '{}') || {}; } catch { return {}; }
};

const AdminSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState(() => new Set());
  const [user, setUser] = useState({});
  const pathname = usePathname();
  const { settings } = useSettings() || {};
  const logoSrc = settings?.logo || '/images/logo.png';

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setUser(readUser()); }, []);

  const role = user.role || 'admin';
  const userName = user.firstName || user.name || 'Admin';

  const isActive = (item) => {
    if (!item.href) return false;
    if (item.exact) return pathname === item.href;
    return pathname === item.href || pathname.startsWith(item.href + '/');
  };
  const hasActiveChild = (item) => (item.submenu ? item.submenu.some(isActive) : isActive(item));

  const toggleMenu = (key) => setOpenMenus((prev) => {
    const next = new Set(prev);
    if (next.has(key)) next.delete(key); else next.add(key);
    return next;
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const groups = MENU
    .map((g) => ({ ...g, items: filterByRole(g.items, role) }))
    .filter((g) => g.items.length > 0);

  const rowBase = 'group relative flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-[14px] transition-colors';
  const rowIdle = 'text-slate-600 hover:bg-slate-100 hover:text-[#0b1b4a]';
  const rowActive = 'bg-[#eef3fc] text-[#0142b2] font-semibold';

  const renderItem = (item) => {
    const Icon = item.icon;
    const active = hasActiveChild(item);

    if (item.submenu) {
      const expanded = openMenus.has(item.title) || active;
      return (
        <div key={item.title}>
          <button type="button" onClick={() => toggleMenu(item.title)} className={`${rowBase} ${active ? 'text-[#0142b2] font-semibold' : rowIdle}`}>
            <Icon size={16} className={active ? 'text-[#0142b2]' : 'text-slate-400 group-hover:text-[#0142b2]'} />
            <span className="flex-1 text-left">{item.title}</span>
            <FiChevronDown size={13} className={`text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </button>
          {expanded && (
            <div className="ml-[20px] mt-0.5 mb-1 space-y-px border-l border-slate-200 pl-2.5">
              {item.submenu.map((sub) => {
                const subActive = isActive(sub);
                return (
                  <Link
                    key={sub.href}
                    href={sub.href}
                    onClick={() => setIsOpen(false)}
                    className={`block rounded-md px-2.5 py-1.5 text-[13.5px] transition-colors ${subActive ? 'bg-[#eef3fc] font-semibold text-[#0142b2]' : 'text-slate-500 hover:bg-slate-100 hover:text-[#0b1b4a]'}`}
                  >
                    {sub.title}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)} className={`${rowBase} ${active ? rowActive : rowIdle}`}>
        {active && <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r bg-[#0142b2]" />}
        <Icon size={16} className={active ? 'text-[#0142b2]' : 'text-slate-400 group-hover:text-[#0142b2]'} />
        <span>{item.title}</span>
      </Link>
    );
  };

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-3 left-3 z-[60] flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 shadow-sm"
        aria-label="Toggle menu"
      >
        {isOpen ? <FiX size={17} /> : <FiMenu size={17} />}
      </button>

      <aside
        className={`fixed left-0 top-0 z-[50] flex h-screen w-[250px] flex-col border-r border-slate-200 bg-white transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Logo */}
        <div className="flex h-14 shrink-0 items-center gap-2 border-b border-slate-200 px-4">
          <Link href="/dashboard/admin" className="flex items-center" onClick={() => setIsOpen(false)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoSrc} alt="Brave Talk Bangladesh" className="h-8 w-auto" />
          </Link>
          <span className="ml-auto rounded-sm bg-[#0b1b4a] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">Admin</span>
        </div>

        {/* Navigation */}
        <nav className="admin-sidebar-scroll flex-1 overflow-y-auto px-3 py-3">
          {groups.map((group, gi) => (
            <div key={group.label} className={gi > 0 ? 'mt-4' : ''}>
              <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">{group.label}</p>
              <div className="space-y-px">{group.items.map(renderItem)}</div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="shrink-0 border-t border-slate-200 p-3">
          <Link href="/" className={`${rowBase} ${rowIdle}`}>
            <FiArrowLeft size={15} className="text-slate-400" /> Back to website
          </Link>
          <div className="mt-2 flex items-center gap-2.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0142b2] text-xs font-bold text-white">
              {userName.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-semibold text-[#0b1b4a]">{userName}</p>
              <p className="truncate text-[12px] text-slate-400">{user.email || ''}</p>
            </div>
            <button onClick={handleLogout} title="Logout" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-400 hover:bg-rose-50 hover:text-[#e5251f]">
              <FiLogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {isOpen && <div className="fixed inset-0 z-[45] bg-slate-900/30 lg:hidden" onClick={() => setIsOpen(false)} />}

      <style jsx global>{`
        .admin-sidebar-scroll::-webkit-scrollbar { width: 4px; }
        .admin-sidebar-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
      `}</style>
    </>
  );
};

export default AdminSidebar;
