"use client";

import "../globals.css";
import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  UserPlus,
  BookOpen,
} from "lucide-react";
import axiosClient from "@/lib/axiosClient";
import { getTenantId } from "@/lib/utils";

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
    href: "/knowledge-base",
    label: "Knowledge Base",
    icon: BookOpen,
  },
  {
    href: "/campaign",
    label: "Campaigns",
    icon: Bot,
  },
  {
    href: "/contact-leads",
    label: "Contacts & Leads",
    icon: Contact,
  },
  {
    href: "/human-handoff",
    label: "Human Handoff",
    icon: UserPlus,
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
  const [userInfo, setUserInfo] = useState<{ name: string; email: string }>({
    name: "",
    email: "",
  });
  const router = useRouter();

  useEffect(() => {
    // Only access localStorage on client side
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme === "dark") {
        setDarkMode(true);
      }
    }
  }, []);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const applyLocalFallback = () => {
        if (typeof window === "undefined") return;
        const storedName = localStorage.getItem("tenantName") || "";
        const storedEmail = localStorage.getItem("tenantEmail") || "";
        if (storedName || storedEmail) {
          setUserInfo({
            name: storedName,
            email: storedEmail,
          });
        }
      };

      const fetchFromTenantDetails = async (tenantId: string) => {
        try {
          const response = await axiosClient.get(
            `/tenant/details-config/${tenantId}`
          );
          const data = response.data?.data || response.data;
          if (data) {
            const name =
              data.name?.trim() || localStorage.getItem("tenantName") || "";
            const email =
              data.email || localStorage.getItem("tenantEmail") || "";
            if (typeof window !== "undefined") {
              if (name) localStorage.setItem("tenantName", name);
              if (email) localStorage.setItem("tenantEmail", email);
            }
            setUserInfo({
              name,
              email,
            });
            return true;
          }
        } catch (err) {
          console.error("Failed to fetch tenant details:", err);
        }
        return false;
      };

      try {
        const tenantId = getTenantId();
        if (!tenantId) {
          applyLocalFallback();
          return;
        }

        const response = await axiosClient.get(
          `/otp/verify?tenantId=${tenantId}`
        );
        const tenantData =
          response.data?.data?.tenant ||
          response.data?.tenant ||
          response.data?.data;

        if (tenantData) {
          const name =
            tenantData.name?.trim() || localStorage.getItem("tenantName") || "";
          const email =
            tenantData.email || localStorage.getItem("tenantEmail") || "";

          if (typeof window !== "undefined") {
            if (name) localStorage.setItem("tenantName", name);
            if (email) localStorage.setItem("tenantEmail", email);
          }

          setUserInfo({
            name,
            email,
          });
        } else {
          const fetched = await fetchFromTenantDetails(tenantId);
          if (!fetched) {
            applyLocalFallback();
          }
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
        const tenantId = getTenantId();
        if (!(tenantId && (await fetchFromTenantDetails(tenantId)))) {
          applyLocalFallback();
        }
      }
    };

    fetchUserProfile();
  }, []);

  const toggleTheme = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("theme", newDarkMode ? "dark" : "light");
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("tenantId");
      router.push("/");
    }
  };

  return (
    <html>
      <body>
        <div className={darkMode ? "dark" : ""}>
          <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
            <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col h-screen sticky top-0">
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
                      {userInfo.name || "User"}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {userInfo.email || "No email"}
                    </span>
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 w-full"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="text-sm font-medium">Log Out</span>
                </button>
              </div>
            </aside>

            <div className="flex-1 flex flex-col h-screen overflow-y-auto">
              {children}
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
