"use client";

import { useState } from "react";
import DashboardHeader from "@/components/DashboardHeader";
import { Check, Plus, X } from "lucide-react";

interface Plan {
  id: string;
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

export default function SubscriptionPlansPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [plans, setPlans] = useState<Plan[]>([
    {
      id: "starter",
      name: "Starter",
      description:
        "Perfect for individuals and small teams just getting started",
      isActive: true,
      billing: {
        monthly: { price: "Free" },
        yearly: { price: "Free" },
      },
      features: [
        "1 AI agent",
        "2,000 minutes / month",
        "Basic analytics",
        "Email support",
      ],
      totalSubscribers: 290,
    },
    {
      id: "business",
      name: "Business",
      description: "Designed for growing teams needing more scale and features",
      isActive: true,
      billing: {
        monthly: {
          price: "$89",
          originalPrice: "$199",
        },
        yearly: {
          price: "$900",
          originalPrice: "$2300",
        },
      },
      features: [
        "5 AI agents",
        "5,000 minutes / month",
        "Advanced analytics & call recording",
        "Priority support",
      ],
      totalSubscribers: 290,
    },
    {
      id: "enterprise",
      name: "Enterprise",
      description: "Tailored for large organizations with advanced needs",
      isActive: true,
      billing: {
        monthly: {
          price: "$199",
          originalPrice: "$299",
        },
        yearly: {
          price: "$1800",
          originalPrice: "$2800",
        },
      },
      features: [
        "Unlimited AI agents",
        "Unlimited minutes / month",
        "Advanced analytics & call recording",
        "Custom integrations & SLA",
      ],
      totalSubscribers: 290,
    },
  ]);

  const handleTogglePlan = (planId: string) => {
    setPlans((prevPlans) =>
      prevPlans.map((plan) =>
        plan.id === planId ? { ...plan, isActive: !plan.isActive } : plan
      )
    );
  };

  const handleOpenModal = (plan: Plan) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPlan(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted for plan:", selectedPlan);
    handleCloseModal();
  };

  return (
    <>
      <DashboardHeader title="Subscription management" />
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              All Subscription
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              View and manage platform subscription plans
            </p>
          </div>
          <button
            onClick={() =>
              handleOpenModal({
                id: "new",
                name: "New Plan",
                description: "Create a new subscription plan",
                isActive: true,
                billing: {
                  monthly: { price: "" },
                  yearly: { price: "" },
                },
                features: [],
                totalSubscribers: 0,
              })
            }
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Plan
          </button>
        </div>
        <div className="grid grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="bg-gray-800 dark:bg-gray-900 rounded-lg border border-gray-700 dark:border-gray-800 overflow-hidden hover:border-gray-600 transition-colors"
            >
              <div className="p-6 border-b border-gray-700 dark:border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {plan.name}
                    </h3>
                    <p className="text-xs text-gray-400">{plan.description}</p>
                  </div>
                  <button
                    onClick={() => handleTogglePlan(plan.id)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${
                      plan.isActive ? "bg-blue-600" : "bg-gray-600"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                        plan.isActive ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
              <div className="p-6 border-b border-gray-700 dark:border-gray-800 space-y-3">
                <div
                  onClick={() => handleOpenModal(plan)}
                  className="bg-gray-700/50 hover:bg-gray-700/70 rounded-lg p-4 border border-gray-600 cursor-pointer transition-all duration-200 hover:scale-[1.02]"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-300">
                        Monthly
                      </p>
                      {plan.billing.monthly.originalPrice && (
                        <p className="text-xs text-gray-400 line-through">
                          {plan.billing.monthly.originalPrice}
                        </p>
                      )}
                    </div>
                    <span className="text-xl font-bold text-white">
                      {plan.billing.monthly.price}
                    </span>
                  </div>
                </div>
                <div
                  onClick={() => handleOpenModal(plan)}
                  className="bg-gray-700/50 hover:bg-gray-700/70 rounded-lg p-4 border border-gray-600 cursor-pointer transition-all duration-200 hover:scale-[1.02]"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-300">
                        Yearly
                      </p>
                      {plan.billing.yearly.originalPrice && (
                        <p className="text-xs text-gray-400 line-through">
                          {plan.billing.yearly.originalPrice}
                        </p>
                      )}
                    </div>
                    <span className="text-xl font-bold text-white">
                      {plan.billing.yearly.price}
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-3">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-blue-500" />
                    </div>
                    <span className="text-sm text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
              <div className="px-6 py-4 bg-gray-700/50 border-t border-gray-700 dark:border-gray-800">
                <p className="text-xs text-gray-400">
                  Total subscribed tenants:{" "}
                  <span className="text-white font-semibold">
                    {plan.totalSubscribers}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/20 backdrop-blur-[2px] backdrop-saturate-150 transition-opacity duration-300"
              onClick={handleCloseModal}
            />

            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl mx-auto transform transition-all duration-300 scale-100 opacity-100">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {selectedPlan?.id === "new"
                    ? "Create New Plan"
                    : `Edit ${selectedPlan?.name} Plan`}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Plan Name
                  </label>
                  <input
                    type="text"
                    defaultValue={selectedPlan?.name}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter plan name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    defaultValue={selectedPlan?.description}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Enter plan description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Monthly Price
                    </label>
                    <input
                      type="text"
                      defaultValue={selectedPlan?.billing.monthly.price}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., $89"
                    />
                    <input
                      type="text"
                      defaultValue={selectedPlan?.billing.monthly.originalPrice}
                      className="w-full mt-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Original price (optional)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Yearly Price
                    </label>
                    <input
                      type="text"
                      defaultValue={selectedPlan?.billing.yearly.price}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., $900"
                    />
                    <input
                      type="text"
                      defaultValue={selectedPlan?.billing.yearly.originalPrice}
                      className="w-full mt-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Original price (optional)"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Features (one per line)
                  </label>
                  <textarea
                    defaultValue={selectedPlan?.features.join("\n")}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Enter features, one per line"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Total Subscribers
                  </label>
                  <input
                    type="number"
                    defaultValue={selectedPlan?.totalSubscribers}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter number of subscribers"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Plan Active
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      selectedPlan && handleTogglePlan(selectedPlan.id)
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      selectedPlan?.isActive ? "bg-blue-600" : "bg-gray-600"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                        selectedPlan?.isActive
                          ? "translate-x-6"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    {selectedPlan?.id === "new"
                      ? "Create Plan"
                      : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
