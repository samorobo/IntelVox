"use client";

import { useState } from "react";
import DashboardHeader from "@/components/DashboardHeader";
import { Search, Download, Plus, X } from "lucide-react";

interface Tenant {
  id: string;
  name: string;
  email: string;
  planType: string;
  lastActivity: string;
  nextBilling: string;
  addedOn: string;
  status: "active" | "inactive";
}

interface FormData {
  name: string;
  email: string;
  planType: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  planType?: string;
}

export default function TenantManagementPage() {
  const [tenants, setTenants] = useState<Tenant[]>([
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      planType: "Enterprise",
      lastActivity: "2 hours ago",
      nextBilling: "Jan 15, 2024",
      addedOn: "Jan 1, 2023",
      status: "active",
    },
    {
      id: "2",
      name: "Sarah Smith",
      email: "sarah@example.com",
      planType: "Professional",
      lastActivity: "1 day ago",
      nextBilling: "Jan 20, 2024",
      addedOn: "Mar 15, 2023",
      status: "active",
    },
    {
      id: "3",
      name: "Mike Johnson",
      email: "mike@example.com",
      planType: "Starter",
      lastActivity: "3 days ago",
      nextBilling: "Feb 1, 2024",
      addedOn: "Jun 10, 2023",
      status: "inactive",
    },
    {
      id: "4",
      name: "Emily Davis",
      email: "emily@example.com",
      planType: "Professional",
      lastActivity: "5 hours ago",
      nextBilling: "Jan 18, 2024",
      addedOn: "Aug 22, 2023",
      status: "active",
    },
    {
      id: "5",
      name: "Alex Wilson",
      email: "alex@example.com",
      planType: "Enterprise",
      lastActivity: "1 week ago",
      nextBilling: "Jan 25, 2024",
      addedOn: "Nov 5, 2023",
      status: "inactive",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    planType: "",
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const toggleStatus = (id: string) => {
    setTenants(
      tenants.map((tenant) =>
        tenant.id === id
          ? {
              ...tenant,
              status: tenant.status === "active" ? "inactive" : "active",
            }
          : tenant
      )
    );
  };

  const filteredTenants = tenants.filter(
    (tenant) =>
      tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.planType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.name.trim()) {
      errors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.planType) {
      errors.planType = "Plan type is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const newTenant: Tenant = {
        id: String(tenants.length + 1),
        name: formData.name,
        email: formData.email,
        planType: formData.planType,
        lastActivity: "Just now",
        nextBilling: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        addedOn: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        status: "active",
      };

      setTenants([newTenant, ...tenants]);
      setIsModalOpen(false);
      setFormData({ name: "", email: "", planType: "" });
      setFormErrors({});
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ name: "", email: "", planType: "" });
    setFormErrors({});
  };

  return (
    <>
      <DashboardHeader title="Tenant Management" />
      <div className="p-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              All Tenants
            </h2>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Add Tenant
              </button>

              <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                <Download className="w-4 h-4" />
                Export
              </button>

              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tenants..."
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
                    Email
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">
                    Plan Type
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">
                    Last Activity
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">
                    Next Billing
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">
                    Added On
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTenants.map((tenant) => (
                  <tr
                    key={tenant.id}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="py-4 px-6">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {tenant.name}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {tenant.email}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          tenant.planType === "Enterprise"
                            ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                            : tenant.planType === "Professional"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
                        }`}
                      >
                        {tenant.planType}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {tenant.lastActivity}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {tenant.nextBilling}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {tenant.addedOn}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => toggleStatus(tenant.id)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                          tenant.status === "active"
                            ? "bg-green-500"
                            : "bg-gray-300 dark:bg-gray-600"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            tenant.status === "active"
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTenants.length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-500 dark:text-gray-400">
                No tenants found matching your search.
              </div>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto transition-all duration-300 ease-out"
          style={{ animation: "fadeIn 0.3s ease-out" }}
        >
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes slideUp {
              from { 
                opacity: 0;
                transform: translateY(20px) scale(0.95);
              }
              to { 
                opacity: 1;
                transform: translateY(0) scale(1);
              }
            }
            .backdrop-blur-custom {
              backdrop-filter: blur(8px);
              -webkit-backdrop-filter: blur(8px);
            }
          `}</style>
          <div
            className="fixed inset-0 bg-white/30 dark:bg-gray-900/30 backdrop-blur-custom transition-all duration-300"
            onClick={closeModal}
          ></div>

          <div className="flex min-h-full items-center justify-center p-4">
            <div
              className="relative bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-md transform transition-all duration-300 ease-out"
              style={{ animation: "slideUp 0.3s ease-out" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Add New Tenant
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="px-6 py-4">
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                        formErrors.name
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                      placeholder="Enter tenant name"
                    />
                    {formErrors.name && (
                      <p className="mt-1 text-sm text-red-500">
                        {formErrors.name}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                        formErrors.email
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                      placeholder="Enter email address"
                    />
                    {formErrors.email && (
                      <p className="mt-1 text-sm text-red-500">
                        {formErrors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="planType"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Plan Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="planType"
                      name="planType"
                      value={formData.planType}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                        formErrors.planType
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                    >
                      <option value="">Select a plan</option>
                      <option value="Starter">Starter</option>
                      <option value="Professional">Professional</option>
                      <option value="Enterprise">Enterprise</option>
                    </select>
                    {formErrors.planType && (
                      <p className="mt-1 text-sm text-red-500">
                        {formErrors.planType}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    Add Tenant
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
