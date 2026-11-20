"use client";

import { usePathname } from "next/navigation";

// The batch tool pages (class folders/materials, attendance) are shared by the
// mentor dashboard and the admin dashboard. Links stay inside whichever one is open.
export function useBatchToolPaths() {
    const isAdmin = (usePathname() || "").startsWith("/dashboard/admin");
    return {
        classes: isAdmin ? "/dashboard/admin/classes" : "/dashboard/mentor/batch-materials",
        attendance: isAdmin ? "/dashboard/admin/attendance" : "/dashboard/mentor/attendance",
    };
}
