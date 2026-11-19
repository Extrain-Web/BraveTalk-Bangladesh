'use client';
import AdminRoleGate from '@/components/Admin/AdminRoleGate';

// Analytics holds income/revenue reports → admin & superAdmin only (Managers blocked).
export default function AnalyticsLayout({ children }) {
  return <AdminRoleGate allow={['superAdmin', 'admin']}>{children}</AdminRoleGate>;
}
