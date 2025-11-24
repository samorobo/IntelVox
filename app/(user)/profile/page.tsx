"use client";

import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import DashboardHeader from "@/components/DashboardHeader";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import axiosClient from "@/lib/axiosClient";
import { getTenantIdOrThrow } from "@/lib/utils";

interface StatCard {
  title: string;
  value: string | number;
}

export default function DashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("Month");
  const [stats, setStats] = useState<StatCard[]>([]);
  const [chartData, setChartData] = useState<
    { month: string; attempted: number; connected: number; converted: number }[]
  >([]);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const tenantId = getTenantIdOrThrow();
        const response = await axiosClient.get(`/dashboard/${tenantId}`);
        const data = response.data?.data || response.data;

        setStats([
          {
            title: "Total calls",
            value: data?.totalCalls ?? 0,
          },
          {
            title: "Total Outbound",
            value: data?.totalOutbound ?? 0,
          },
          {
            title: "Total Inbound",
            value: data?.totalInbound ?? 0,
          },
          {
            title: "Total HandOffs",
            value: data?.totalHandoff ?? 0,
          },
        ]);

        const monthlyData = Array.isArray(data?.monthly)
          ? data.monthly.map(
              (item: {
                monthName?: string;
                totalCalls?: number;
                outbound?: number;
                handoff?: number;
              }) => ({
                month: item.monthName || "N/A",
                attempted: item.totalCalls ?? 0,
                connected: item.outbound ?? 0,
                converted: item.handoff ?? 0,
              })
            )
          : [];

        setChartData(monthlyData);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        // If the request fails, keep stats as empty or zeros; UI will simply show nothing / 0s
      }
    };

    fetchDashboardStats();
  }, []);

  return (
    <>
      <DashboardHeader title="Dashboard" />
      <div className="p-8">
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Chart Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Call performance over time
              </h2>
              <div className="relative">
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="appearance-none px-4 py-2 pr-10 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="Week">Week</option>
                  <option value="Month">Month</option>
                  <option value="Year">Year</option>
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
              </div>
            </div>

            <div className="p-6">
              {/* Legend */}
              <div className="flex justify-end items-center gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Calls converted
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Calls connected
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Calls attempted
                  </span>
                </div>
              </div>

              {/* Chart */}
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorAttempted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0.3} />
                    </linearGradient>
                    <linearGradient id="colorConnected" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0.3} />
                    </linearGradient>
                    <linearGradient id="colorConverted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.3} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                  <XAxis
                    dataKey="month"
                    stroke="#9ca3af"
                    tick={{ fill: "#9ca3af", fontSize: 12 }}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#9ca3af"
                    tick={{ fill: "#9ca3af", fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                    labelStyle={{ color: "#9ca3af" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="attempted"
                    stackId="1"
                    stroke="#a855f7"
                    fill="url(#colorAttempted)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="connected"
                    stackId="1"
                    stroke="#f97316"
                    fill="url(#colorConnected)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="converted"
                    stackId="1"
                    stroke="#10b981"
                    fill="url(#colorConverted)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
