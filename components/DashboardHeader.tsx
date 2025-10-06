"use client";

import { UserCircle, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";

interface DashboardHeaderProps {
  title: string;
}

export default function DashboardHeader({ title }: DashboardHeaderProps) {
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

    // Update the main layout's theme class
    const html = document.documentElement;
    if (newDarkMode) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-8 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          {title}
        </h1>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
          >
            {darkMode ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>
          <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400">
            <UserCircle className="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>
  );
}
