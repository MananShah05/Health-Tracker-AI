"use client";

import { useEffect, ReactNode } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Sidebar } from "@/components/layout/Sidebar";
import { LogModal } from "@/components/log/LogModal";

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, loadUser, loadLogs, loadPatterns } = useAppStore();

  useEffect(() => {
    loadUser().then(() => {
      loadLogs();
      loadPatterns();
    });
  }, []);

  if (!user) return (
    <div className="flex h-full items-center justify-center">
      <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div className="flex h-full">
      <Sidebar />
      <main className="flex-1 overflow-y-auto pb-24">{children}</main>
      <LogModal />
    </div>
  );
}