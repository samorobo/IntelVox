"use client";

import { useState, useEffect } from "react";
import DashboardHeader from "@/components/DashboardHeader";
import { Search, Download, Plus, X } from "lucide-react";
import axiosClient from "@/lib/axiosClient";

interface Tenant {
  _id: string;
  name: string;
  email: string;
  plan: string;
  status: "active" | "inactive";
  addedOn: string;
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
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    planType: "",
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  // Auto-hide message after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Fetch tenants from backend
  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const res = await axiosClient.get("/tenants");
        setTenants(res.data);
      } catch (err) {
        console.error("Failed to fetch tenants:", err);
        setMessage({ text: "Failed to load tenants.", type: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchTenants();
  }, []);

  const toggleStatus = async (id: string) => {
    try {
      const current = tenants.find((t) => t._id === id);
      if (!current) return;

      const newStatus = current.status === "active" ? "inactive" : "active";
      await axiosClient.patch(`/tenants/${id}`, { status: newStatus });

      setTenants((prev) =>
        prev.map((t) => (t._id === id ? { ...t, status: newStatus } : t))
      );

      setMessage({
        text: `Tenant ${
          newStatus === "active" ? "activated" : "deactivated"
        } successfully.`,
        type: "success",
      });
    } catch (err) {
      console.error("Failed to update tenant:", err);
      setMessage({ text: "Error updating tenant status.", type: "error" });
    }
  };

  const filteredTenants = tenants.filter(
    (tenant) =>
      tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.plan.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.email.trim()) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      errors.email = "Please enter a valid email address";
    if (!formData.planType) errors.planType = "Plan type is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const res = await axiosClient.post("/tenants", {
        name: formData.name,
        email: formData.email,
        plan: formData.planType,
      });

      setTenants((prev) => [res.data, ...prev]);
      setIsModalOpen(false);
      setFormData({ name: "", email: "", planType: "" });
      setFormErrors({});
      setMessage({ text: "Tenant added successfully.", type: "success" });
    } catch (err) {
      console.error("Failed to add tenant:", err);
      setMessage({ text: "Error adding tenant.", type: "error" });
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

      {/* ✅ Message bar */}
      {message && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-md text-sm font-medium transition-all duration-300 ${
            message.type === "success"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {message.text}
        </div>
      )}

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

          {loading ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Loading tenants...
            </div>
          ) : (
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
                      Plan
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
                      key={tenant._id}
                      className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="py-4 px-6 text-sm font-medium text-gray-900 dark:text-white">
                        {tenant.name}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
                        {tenant.email}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            tenant.plan === "Enterprise"
                              ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                              : tenant.plan === "Professional"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
                          }`}
                        >
                          {tenant.plan}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
                        {new Date(tenant.addedOn).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => toggleStatus(tenant._id)}
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
              {filteredTenants.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No tenants found matching your search.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ✅ Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm"
            onClick={closeModal}
          ></div>

          <div className="flex min-h-full items-center justify-center p-4">
            <div
              className="relative bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-md animate-fadeIn"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Add New Tenant
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="px-6 py-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Plan Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="planType"
                    value={formData.planType}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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

              <div className="flex justify-end gap-3 mt-6 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Add Tenant
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
