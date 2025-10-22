"use client";

import { useState, useEffect } from "react";
import DashboardHeader from "@/components/DashboardHeader";
import { Check, Plus, X, Loader2 } from "lucide-react";
import axiosClient from "@/lib/axiosClient";
import toast from "react-hot-toast";

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
  createdAt: string;
  updatedAt: string;
}

export default function SubscriptionPlansPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    monthlyPrice: "",
    monthlyOriginalPrice: "",
    yearlyPrice: "",
    yearlyOriginalPrice: "",
    features: "",
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get("/plans");
      setPlans(response.data);
    } catch (err: any) {
      console.error("Error fetching plans:", err);
      toast.error(err.response?.data?.error || "Failed to fetch plans");
    } finally {
      setLoading(false);
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

  const handleTogglePlan = async (planId: string) => {
    try {
      const plan = plans.find((p) => p.id === planId);
      if (!plan) return;

      const updatedPlan = { ...plan, isActive: !plan.isActive };
      await axiosClient.patch(`/plans/${planId}`, {
        isActive: updatedPlan.isActive,
      });

      setPlans((prevPlans) =>
        prevPlans.map((plan) =>
          plan.id === planId ? { ...plan, isActive: !plan.isActive } : plan
        )
      );

      toast.success(
        `"${plan.name}" plan ${
          updatedPlan.isActive ? "enabled" : "disabled"
        } successfully`
      );
    } catch (err: any) {
      console.error("Error updating plan:", err);
      toast.error(err.response?.data?.error || "Failed to update plan status");
    }
  };

  const handleOpenModal = (plan: Plan | null) => {
    setSelectedPlan(plan);

    if (plan) {
      setFormData({
        name: plan.name,
        description: plan.description,
        monthlyPrice: plan.billing.monthly.price.replace("$", ""),
        monthlyOriginalPrice:
          plan.billing.monthly.originalPrice?.replace("$", "") || "",
        yearlyPrice: plan.billing.yearly.price.replace("$", ""),
        yearlyOriginalPrice:
          plan.billing.yearly.originalPrice?.replace("$", "") || "",
        features: plan.features.join("\n"),
      });
    } else {
      setFormData({
        name: "",
        description: "",
        monthlyPrice: "",
        monthlyOriginalPrice: "",
        yearlyPrice: "",
        yearlyOriginalPrice: "",
        features: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPlan(null);
    setFormData({
      name: "",
      description: "",
      monthlyPrice: "",
      monthlyOriginalPrice: "",
      yearlyPrice: "",
      yearlyOriginalPrice: "",
      features: "",
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isFormValid = () => {
    return (
      formData.name.trim() &&
      formData.description.trim() &&
      formData.monthlyPrice.trim() &&
      formData.yearlyPrice.trim() &&
      formData.features.trim()
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) return;

    setSubmitLoading(true);

    try {
      const planData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        isActive: true,
        billing: {
          monthly: {
            price: formatPrice(formData.monthlyPrice.trim()),
            ...(formData.monthlyOriginalPrice.trim() && {
              originalPrice: formatPrice(formData.monthlyOriginalPrice.trim()),
            }),
          },
          yearly: {
            price: formatPrice(formData.yearlyPrice.trim()),
            ...(formData.yearlyOriginalPrice.trim() && {
              originalPrice: formatPrice(formData.yearlyOriginalPrice.trim()),
            }),
          },
        },
        features: formData.features.split("\n").filter((f) => f.trim()),
        totalSubscribers: 0,
      };

      if (selectedPlan?.id) {
        await axiosClient.patch(`/plans/${selectedPlan.id}`, planData);
        toast.success(`"${planData.name}" plan updated successfully`);
      } else {
        await axiosClient.post("/plans", planData);
        toast.success(`"${planData.name}" plan created successfully`);
      }

      await fetchPlans();
      handleCloseModal();
    } catch (err: any) {
      console.error("Error saving plan:", err);
      toast.error(err.response?.data?.error || "Failed to save plan");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <DashboardHeader title="Subscription management" />
        <div className="p-8">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Loading plans...</span>
            </div>
          </div>
        </div>
      </>
    );
  }

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
            onClick={() => handleOpenModal(null)}
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
              className="bg-gray-800 dark:bg-gray-900 rounded-lg border border-gray-700 dark:border-gray-800 overflow-hidden hover:border-gray-600 transition-colors flex flex-col"
            >
              <div className="p-6 border-b border-gray-700 dark:border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {plan.name}
                    </h3>
                    <p className="text-xs text-gray-400">{plan.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
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
                    <span className="text-xs text-gray-400">
                      {plan.isActive ? "Enabled" : "Disabled"}
                    </span>
                  </div>
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
                          {formatPrice(plan.billing.monthly.originalPrice)}
                        </p>
                      )}
                    </div>
                    <span className="text-xl font-bold text-white">
                      {formatPrice(plan.billing.monthly.price)}
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
                          {formatPrice(plan.billing.yearly.originalPrice)}
                        </p>
                      )}
                    </div>
                    <span className="text-xl font-bold text-white">
                      {formatPrice(plan.billing.yearly.price)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex-1 p-6 space-y-3">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-blue-500" />
                    </div>
                    <span className="text-sm text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="px-6 py-4 bg-gray-700/50 border-t border-gray-700 dark:border-gray-800 mt-auto">
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
                  {selectedPlan
                    ? `Edit ${selectedPlan.name} Plan`
                    : "Create New Plan"}
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
                    Plan Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter plan name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Enter plan description"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Monthly Price <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="text"
                        value={formData.monthlyPrice}
                        onChange={(e) =>
                          handleInputChange(
                            "monthlyPrice",
                            e.target.value.replace("$", "")
                          )
                        }
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="89 or Free"
                        required
                      />
                    </div>
                    <div className="relative mt-2">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="text"
                        value={formData.monthlyOriginalPrice}
                        onChange={(e) =>
                          handleInputChange(
                            "monthlyOriginalPrice",
                            e.target.value.replace("$", "")
                          )
                        }
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Original price (optional)"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Yearly Price <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="text"
                        value={formData.yearlyPrice}
                        onChange={(e) =>
                          handleInputChange(
                            "yearlyPrice",
                            e.target.value.replace("$", "")
                          )
                        }
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="900 or Free"
                        required
                      />
                    </div>
                    <div className="relative mt-2">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="text"
                        value={formData.yearlyOriginalPrice}
                        onChange={(e) =>
                          handleInputChange(
                            "yearlyOriginalPrice",
                            e.target.value.replace("$", "")
                          )
                        }
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Original price (optional)"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Features (one per line){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.features}
                    onChange={(e) =>
                      handleInputChange("features", e.target.value)
                    }
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Enter features, one per line"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    disabled={submitLoading}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!isFormValid() || submitLoading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {submitLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Please wait...
                      </>
                    ) : selectedPlan ? (
                      "Save Changes"
                    ) : (
                      "Create Plan"
                    )}
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
