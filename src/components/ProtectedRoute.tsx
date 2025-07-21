// src/components/ProtectedRoute.tsx
"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/"); // Redirect to login if not logged in
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  return <>{children}</>;
}
