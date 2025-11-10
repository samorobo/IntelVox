"use client";

import "../globals.css";
import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
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
  Bot,
  Contact,
} from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
}
const navItems = [
  {
    href: "/profile",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/ai-agents",
    label: "AI Agents",
    icon: Bot,
  },
  {
    href: "/contact-leads",
    label: "Contacts & Leads",
    icon: Contact,
  },
  {
    href: "/calls",
    label: "Calls & Transcript",
    icon: PhoneCall,
  },
  {
    href: "/billing",
    label: "Billings & Usage",
    icon: CreditCard,
  },
  {
    href: "/team",
    label: "Team & Roles",
    icon: Users,
  },
];
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
    <html>
      <body>
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
                {navItems.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{label}</span>
                  </Link>
                ))}
              </nav>

              <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                <Link
                  href="/settings"
                  className="flex items-center gap-3 px-3 py-2 mb-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 w-full"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <UserCircle className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                  </div>

                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      John Doe
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      johndoe@email.com
                    </span>
                  </div>
                </Link>
                <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 w-full">
                  <LogOut className="w-5 h-5" />
                  <span className="text-sm font-medium">Log Out</span>
                </button>
              </div>
            </aside>

            <div className="flex-1 flex flex-col">{children}</div>
          </div>
        </div>
      </body>
    </html>
  );
}
