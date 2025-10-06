"use client";

import { useState } from "react";
import DashboardHeader from "@/components/DashboardHeader";
import { Search, Download, Eye } from "lucide-react";

interface Call {
  id: string;
  name: string;
  agentName: string;
  tenant: string;
  phone: string;
  date: string;
  time: string;
  duration: string;
}

export default function CallsTranscriptPage() {
  const [calls, setCalls] = useState<Call[]>([
    {
      id: "1",
      name: "John Doe",
      agentName: "Sarah Johnson",
      tenant: "Acme Corp",
      phone: "+1 (555) 123-4567",
      date: "Oct 4, 2025",
      time: "09:30 AM",
      duration: "12:45",
    },
    {
      id: "2",
      name: "Emily Chen",
      agentName: "Michael Smith",
      tenant: "TechStart Inc",
      phone: "+1 (555) 234-5678",
      date: "Oct 4, 2025",
      time: "10:15 AM",
      duration: "08:20",
    },
    {
      id: "3",
      name: "Robert Williams",
      agentName: "Sarah Johnson",
      tenant: "Global Solutions",
      phone: "+1 (555) 345-6789",
      date: "Oct 3, 2025",
      time: "02:45 PM",
      duration: "15:30",
    },
    {
      id: "4",
      name: "Maria Garcia",
      agentName: "David Lee",
      tenant: "Innovate Co",
      phone: "+1 (555) 456-7890",
      date: "Oct 3, 2025",
      time: "11:20 AM",
      duration: "06:15",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");

  const handleViewTranscript = (id: string) => {
    console.log("View transcript for call:", id);
    // Add your view transcript logic here
  };

  const handleExport = () => {
    console.log("Exporting calls data...");
    // Add your export logic here
  };

  const filteredCalls = calls.filter(
    (call) =>
      call.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      call.agentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      call.tenant.toLowerCase().includes(searchTerm.toLowerCase()) ||
      call.phone.includes(searchTerm)
  );

  return (
    <>
      <DashboardHeader title="Calls & Transcript Management" />
      <div className="p-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          {/* Table Header with Search */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              All Calls
            </h2>
            <div className="flex items-center gap-4">
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
              </button>

              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search calls..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">
                    Name
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">
                    Agent Name
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">
                    Tenant
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">
                    Phone
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">
                    Date & Time
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">
                    Duration
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCalls.map((call) => (
                  <tr
                    key={call.id}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {call.name}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {call.agentName}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {call.tenant}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                        {call.phone}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-900 dark:text-white font-medium">
                        {call.date}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {call.time}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                        {call.duration}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => handleViewTranscript(call.id)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        title="View Transcript"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredCalls.length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-500 dark:text-gray-400">
                No calls found matching your search.
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
