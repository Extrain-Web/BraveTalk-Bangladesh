'use client';
import AdminRoleGate from '@/components/Admin/AdminRoleGate';

// Team/Staff = admin & manager accounts → admin & superAdmin only (Managers blocked).
export default function StaffLayout({ children }) {
  return <AdminRoleGate allow={['superAdmin', 'admin']}>{children}</AdminRoleGate>;
}
