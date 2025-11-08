"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import DashboardHeader from "@/components/DashboardHeader";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function DashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("Month");

  const stats = [
    {
      title: "Calls attempted",
      value: "234",
      change: "+5%",
      changeType: "increase",
      period: "vs last month",
    },
    {
      title: "Calls connected",
      value: "435",
      change: "+2%",
      changeType: "decrease",
      period: "vs last month",
    },
    {
      title: "Calls converted",
      value: "123",
      change: "+2%",
      changeType: "decrease",
      period: "vs last month",
    },
    {
      title: "AI consumers in calls",
      value: "89",
      change: "+4%",
      changeType: "increase",
      period: "vs last month",
    },
  ];

  const chartData = [
    { month: "May", attempted: 180, connected: 320, converted: 140 },
    { month: "Jun", attempted: 190, connected: 340, converted: 150 },
    { month: "Jul", attempted: 200, connected: 360, converted: 160 },
    { month: "Aug", attempted: 185, connected: 350, converted: 145 },
    { month: "Sep", attempted: 195, connected: 370, converted: 155 },
    { month: "Oct", attempted: 210, connected: 390, converted: 170 },
    { month: "Nov", attempted: 205, connected: 380, converted: 165 },
    { month: "Dec", attempted: 220, connected: 400, converted: 180 },
    { month: "Jan '25", attempted: 215, connected: 395, converted: 175 },
    { month: "Feb", attempted: 225, connected: 410, converted: 185 },
    { month: "Mar", attempted: 230, connected: 425, converted: 190 },
    { month: "Apr", attempted: 234, connected: 435, converted: 195 },
  ];

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
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className={`font-medium ${
                        stat.changeType === "increase"
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {stat.change}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {stat.period}
                    </span>
                  </div>
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
