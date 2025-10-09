"use client";

import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import "../../globals.css";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  DollarSign,
  UserCircle,
  LogOut,
  Sun,
  Moon,
  PhoneCall,
} from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
    }
  }, []);

  const toggleTheme = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("theme", newDarkMode ? "dark" : "light");
  };

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
        <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">I</span>
              </div>
              <span className="text-xl font-semibold text-gray-900 dark:text-white">
                Intelvox.ai
              </span>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="text-sm font-medium">Dashboard</span>
            </Link>
            <Link
              href="/dashboard/tenants"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Users className="w-5 h-5" />
              <span className="text-sm font-medium">Tenant management</span>
            </Link>
            <Link
              href="/dashboard/calls"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <PhoneCall className="w-5 h-5" />
              <span className="text-sm font-medium">Calls & transcripts</span>
            </Link>
            <Link
              href="/dashboard/pricing"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <DollarSign className="w-5 h-5" />
              <span className="text-sm font-medium">Pricings and plans</span>
            </Link>
            <Link
              href="/team"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <UserCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Team & roles</span>
            </Link>
          </nav>

          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 w-full">
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium">Log Out</span>
            </button>
          </div>
        </aside>

        <div className="flex-1 flex flex-col">{children}</div>
      </div>
    </div>
  );
}
