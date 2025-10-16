"use client";

import { useState, useEffect } from "react";
import { Search, Download, FileDown, X, Check } from "lucide-react";
import axiosClient from "@/lib/axiosClient";

interface Subscription {
  _id: string;
  planName: string;
  dateTime: string;
  amount: number;
  status: "active" | "expired" | "cancelled" | "pending";
}

interface Plan {
  _id?: string;
  name: string;
  description: string;
  isActive: boolean;
  billing: {
    monthly: {
      price: string;
      originalPrice?: string;
    };
    yearly: {
      price: string;
      originalPrice?: string;
    };
  };
  features: string[];
  totalSubscribers: number;
}

interface Notification {
  id: string;
  message: string;
  type: "success" | "error" | "info";
  timestamp: number;
}

export default function SubscriptionManagementPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([
    {
      _id: "1",
      planName: "Business Plan",
      dateTime: "2025-10-01T09:00:00",
      amount: 89.99,
      status: "active",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);

  // Fetch user's subscription history from backend
  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const addNotification = (
    message: string,
    type: "success" | "error" | "info"
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: Notification = {
      id,
      message,
      type,
      timestamp: Date.now(),
    };

    setNotifications((prev) => [newNotification, ...prev]);

    // Auto remove after 5 seconds
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  };

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      // This would be the actual endpoint for user's subscription history
      // const response = await axiosClient.get("/users/subscriptions");
      // setSubscriptions(response.data);

      // For now, using static data as specified
      setSubscriptions([
        {
          _id: "1",
          planName: "Business Plan",
          dateTime: "2025-10-01T09:00:00",
          amount: 89.99,
          status: "active",
        },
      ]);
    } catch (err: any) {
      addNotification(
        err.response?.data?.error || "Failed to fetch subscription history",
        "error"
      );
      console.error("Error fetching subscriptions:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    setPlansLoading(true);
    try {
      const response = await axiosClient.get("/plans");
      setPlans(response.data);
    } catch (err: any) {
      addNotification(
        err.response?.data?.error || "Failed to fetch plans",
        "error"
      );
      console.error("Error fetching plans:", err);
    } finally {
      setPlansLoading(false);
    }
  };

  const handleDownloadInvoice = async (id: string, planName: string) => {
    try {
      // This would be the actual endpoint for downloading invoice
      // await axiosClient.get(`/subscriptions/${id}/invoice`);
      addNotification(
        `Invoice for ${planName} downloaded successfully`,
        "success"
      );
    } catch (err: any) {
      addNotification(
        err.response?.data?.error || "Failed to download invoice",
        "error"
      );
      console.error("Error downloading invoice:", err);
    }
  };

  const handleChangePlan = async () => {
    try {
      await fetchPlans();
      setShowPlanModal(true);
    } catch (err: any) {
      addNotification(
        err.response?.data?.error || "Failed to load plans",
        "error"
      );
    }
  };

  const handleCloseModal = () => {
    setShowPlanModal(false);
    setSelectedPlan("");
  };

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handlePlanChange = async () => {
    if (!selectedPlan) {
      addNotification("Please select a plan", "error");
      return;
    }

    try {
      // This would be the actual endpoint for changing user's plan
      // await axiosClient.post("/users/subscriptions/change", { planId: selectedPlan });

      const selectedPlanData = plans.find((p) => p._id === selectedPlan);
      addNotification(
        `Plan changed to ${selectedPlanData?.name} successfully!`,
        "success"
      );
      setShowPlanModal(false);

      // Refresh subscription data
      fetchSubscriptions();
    } catch (err: any) {
      addNotification(
        err.response?.data?.error || "Failed to change plan",
        "error"
      );
      console.error("Error changing plan:", err);
    }
  };

  const handleExport = async () => {
    try {
      // This would be the actual endpoint for exporting subscription data
      // await axiosClient.get("/users/subscriptions/export");
      addNotification("Subscription data exported successfully", "success");
    } catch (err: any) {
      addNotification(
        err.response?.data?.error || "Failed to export data",
        "error"
      );
      console.error("Error exporting data:", err);
    }
  };

  const formatPrice = (price: string) => {
    if (price.toLowerCase() === "free" || price === "0") {
      return "Free";
    }
    if (/^\d+(\.\d{1,2})?$/.test(price)) {
      return `$${price}`;
    }
    return price;
  };

  const filteredSubscriptions = subscriptions.filter(
    (subscription) =>
      subscription.planName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscription.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscription.amount.toString().includes(searchTerm)
  );

  const getStatusColor = (status: Subscription["status"]) => {
    const colors = {
      active:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      expired: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      cancelled:
        "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
      pending:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    };
    return colors[status];
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 py-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Subscription Management
        </h1>
      </div>

      {/* Notification Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`flex items-start gap-3 p-4 rounded-lg shadow-lg border backdrop-blur-sm transform transition-all duration-300 animate-in slide-in-from-right-full ${
              notification.type === "success"
                ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300"
                : notification.type === "error"
                ? "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300"
                : "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300"
            }`}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{notification.message}</p>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="flex-shrink-0 p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Plan Change Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Glossy Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 via-purple-50/10 to-gray-100/30 backdrop-blur-md backdrop-saturate-150">
            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-200/30 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute bottom-1/3 right-1/4 w-24 h-24 bg-purple-200/20 rounded-full blur-lg animate-pulse delay-1000"></div>
            <div className="absolute top-1/3 right-1/3 w-20 h-20 bg-indigo-200/25 rounded-full blur-lg animate-pulse delay-500"></div>
          </div>

          {/* Modal Content */}
          <div className="relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-white/20 dark:border-gray-600/30 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200/50 dark:border-gray-700/50">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Change Your Plan
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Choose your plan
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Select the plan that works best for you
                </p>
              </div>

              {/* Billing Toggle */}
              <div className="flex justify-center mb-8">
                <div className="bg-gray-100/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-lg p-1 border border-gray-200/50 dark:border-gray-600/50">
                  <button
                    onClick={() => setBillingCycle("monthly")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      billingCycle === "monthly"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-600/50"
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setBillingCycle("yearly")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      billingCycle === "yearly"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-600/50"
                    }`}
                  >
                    Yearly
                  </button>
                </div>
              </div>

              {/* Plans from Database */}
              {plansLoading ? (
                <div className="text-center py-8">
                  <div className="text-gray-500 dark:text-gray-400">
                    Loading plans...
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {plans.map((plan) => (
                    <div
                      key={plan._id}
                      className={`border rounded-xl p-6 cursor-pointer transition-all duration-300 backdrop-blur-sm ${
                        selectedPlan === plan._id
                          ? "border-blue-500 bg-blue-50/80 dark:bg-blue-900/30 shadow-lg scale-105"
                          : "border-gray-300/80 dark:border-gray-600/80 bg-white/60 dark:bg-gray-700/60 hover:border-blue-500 hover:shadow-md hover:scale-105"
                      }`}
                      onClick={() => handlePlanSelect(plan._id!)}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {plan.name}
                        </h3>
                        {selectedPlan === plan._id && (
                          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center shadow-sm">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>

                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                        {plan.description}
                      </p>

                      <div className="mb-4">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {billingCycle === "monthly"
                            ? formatPrice(plan.billing.monthly.price)
                            : formatPrice(plan.billing.yearly.price)}
                        </div>
                        {plan.billing[billingCycle].originalPrice && (
                          <div className="text-gray-500 dark:text-gray-400 text-sm line-through">
                            {formatPrice(
                              plan.billing[billingCycle].originalPrice
                            )}
                          </div>
                        )}
                      </div>

                      <ul className="space-y-2 mb-4">
                        {plan.features.map((feature, index) => (
                          <li
                            key={index}
                            className="text-gray-600 dark:text-gray-400 text-sm flex items-center"
                          >
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                            {feature}
                          </li>
                        ))}
                      </ul>

                      <div className="text-gray-500 dark:text-gray-400 text-sm">
                        {plan.totalSubscribers}+ subscribers
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end gap-4 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
                <button
                  onClick={handleCloseModal}
                  className="px-6 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-lg hover:bg-gray-200/80 dark:hover:bg-gray-600/80 transition-all border border-gray-200/50 dark:border-gray-600/50"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePlanChange}
                  disabled={!selectedPlan}
                  className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Change Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="p-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              All Subscriptions
            </h2>
            <div className="flex items-center gap-4">
              <button
                onClick={handleChangePlan}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                Change Plan
              </button>

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
                  placeholder="Search subscriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Loading subscriptions...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">
                      Plan Name
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">
                      Date/Time
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">
                      Amount
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">
                      Status
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">
                      Invoice
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubscriptions.map((subscription) => (
                    <tr
                      key={subscription._id}
                      className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="py-4 px-6 text-sm font-medium text-gray-900 dark:text-white">
                        {subscription.planName}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
                        {formatDateTime(subscription.dateTime)}
                      </td>
                      <td className="py-4 px-6 text-sm font-semibold text-gray-900 dark:text-white">
                        ${subscription.amount.toFixed(2)}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(
                            subscription.status
                          )}`}
                        >
                          {subscription.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() =>
                            handleDownloadInvoice(
                              subscription._id,
                              subscription.planName
                            )
                          }
                          className="inline-flex items-center justify-center p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Download invoice"
                        >
                          <FileDown className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredSubscriptions.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No subscriptions found matching your search.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
