"use client";
import Sidebar from "@/components/Sidebar";

import ProtectedRoute from "@/components/ProtectedRoute";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      
      <main className="flex-1 p-6 overflow-auto bg-gray-100">
        <ProtectedRoute>{children}</ProtectedRoute>
      </main>
    </div>
  );
}
