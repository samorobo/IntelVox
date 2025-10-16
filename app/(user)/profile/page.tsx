import { Users, DollarSign, CreditCard, Activity } from "lucide-react";
import DashboardHeader from "@/components/DashboardHeader";

export default function DashboardPage() {
  const stats = [
    {
      title: "Total Users",
      value: "12,584",
      icon: Users,
      description: "+12% from last month",
      color: "bg-blue-500",
    },
    {
      title: "Total Revenue",
      value: "$45,231.89",
      icon: DollarSign,
      description: "+18% from last month",
      color: "bg-green-500",
    },
    {
      title: "Active Sessions",
      value: "2,341",
      icon: Activity,
      description: "+4% from last month",
      color: "bg-purple-500",
    },
    {
      title: "Pending Transactions",
      value: "573",
      icon: CreditCard,
      description: "-2% from last month",
      color: "bg-orange-500",
    },
  ];

  return (
    <>
      <DashboardHeader title="User Dashboard" />
      <div className="p-8">
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center">
                  <div className={`${stat.color} p-3 rounded-xl mr-4`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {stat.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Recent Activity
              </h3>
              <div className="space-y-4">
                <p className="text-gray-600 dark:text-gray-400">
                  Activity content goes here...
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Stats
              </h3>
              <div className="space-y-4">
                <p className="text-gray-600 dark:text-gray-400">
                  Stats content goes here...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
