// app/contacts/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Search, Download, Trash2, Plus, Upload, X, Loader2, FileDown, Users } from "lucide-react";
import axiosClient from "@/lib/axiosClient";
import axios from "axios";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import { getTenantId, getTenantIdOrThrow } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Link from "next/link";

const LABEL_API_BASE_URL = "https://backend.developmentsite.space";

interface Lead {
  id: string;
  name: string;
  number: string;
  date?: string;
  time?: string;
  duration?: string;
  status?: "converted" | "rejected" | "reschedule" | "handoff" | "on_hold";
  consent?: boolean;
  tenantId?: string;
  createdAt?: string;
  updatedAt?: string;
  label?: string;
  labelId?: string;
}

interface AddContactFormData {
  name: string;
  number: string;
  label: string;
  consent: boolean;
}

interface AddContactFormErrors {
  name?: string;
  number?: string;
  label?: string;
}

interface Label {
  id: string;
  name: string;
}

export default function ContactLeadsPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);
  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
  const [addContactFormData, setAddContactFormData] = useState<AddContactFormData>({
    name: "",
    number: "",
    label: "",
    consent: false,
  });
  const [addContactFormErrors, setAddContactFormErrors] = useState<AddContactFormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [labels, setLabels] = useState<Label[]>([]);
  const [newLabelName, setNewLabelName] = useState("");
  const [labelError, setLabelError] = useState<string | null>(null);
  const [loadingLabels, setLoadingLabels] = useState(false);

  // Fetch contacts and labels on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const tenantId = getTenantId();
      if (tenantId) {
        fetchContacts();
        fetchLabels();
      } else {
        setLoading(false);
        setMessage({
          text: "Please log in to view contacts.",
          type: "error"
        });
        setTimeout(() => {
          router.push("/");
        }, 2000);
      }
    }
  }, [router]);

  // Auto-hide messages after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const tenantId = getTenantId();
      if (!tenantId) {
        setMessage({
          text: "Tenant ID not found. Please log in again.",
          type: "error"
        });
        router.push("/");
        return;
      }
      const response = await axiosClient.get(`/contact/${tenantId}`);
      setLeads(response.data);
    } catch (error: any) {
      console.error("Error fetching contacts:", error);
      console.error("Error details:", error.response?.data);
      const errorMessage = error.message?.includes("Tenant ID not found")
          ? "Please log in to view contacts."
          : error.response?.data?.error || "Failed to load contacts. Please try again.";
      setMessage({
        text: errorMessage,
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchLabels = async () => {
    try {
      setLoadingLabels(true);
      const tenantId = getTenantId();
      if (!tenantId) {
        return;
      }
      const response = await axios.get(`${LABEL_API_BASE_URL}/label/${tenantId}`);
      const labelsData = response.data;
      if (Array.isArray(labelsData)) {
        const formattedLabels = labelsData.map((label: any) => {
          if (typeof label === 'string') {
            return { id: label, name: label };
          }
          return { id: label.id || label.name, name: label.name || label.id };
        });
        setLabels(formattedLabels);
      }
    } catch (error: any) {
      console.error("Error fetching labels:", error);
    } finally {
      setLoadingLabels(false);
    }
  };

  const handleDelete = async (id: string) => {
    const lead = leads.find((l) => l.id === id);
    if (!lead) return;

    if (window.confirm(`Are you sure you want to delete ${lead.name}?`)) {
      try {
        setDeleting(id);
        const tenantId = getTenantId();
        if (!tenantId) {
          setMessage({
            text: "Please log in to delete contacts.",
            type: "error"
          });
          return;
        }
        await axiosClient.delete(`/contact/${tenantId}/${id}`);
        setMessage({ text: "Contact deleted successfully.", type: "success" });
        await fetchContacts();
      } catch (error: any) {
        console.error("Error deleting contact:", error);
        setMessage({
          text: error.response?.data?.error || "Failed to delete contact. Please try again.",
          type: "error"
        });
      } finally {
        setDeleting(null);
      }
    }
  };

  const filteredLeads = leads.filter(
      (lead) =>
          lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lead.number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lead.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lead.label?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: Lead["status"]) => {
    const colors = {
      converted: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      reschedule: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      handoff: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      on_hold: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
    };
    return colors[status || "on_hold"];
  };

  const formatDateTime = (date?: string, time?: string) => {
    if (!date) return "N/A";

    try {
      const dateObj = new Date(date);
      if (time) {
        const [hours, minutes] = time.split(':');
        dateObj.setHours(parseInt(hours), parseInt(minutes));
      }

      return dateObj.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid Date";
    }
  };

  const handleExport = () => {
    try {
      const headers = ["Name", "Number", "Label", "Status", "Created Date"];
      const csvRows = [
        headers.join(","),
        ...leads.map(lead => [
          `"${lead.name}"`,
          `"${lead.number}"`,
          `"${lead.label || 'N/A'}"`,
          `"${lead.status || 'on_hold'}"`,
          `"${lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : 'N/A'}"`
        ].join(","))
      ];

      const csvContent = csvRows.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `contacts_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setMessage({ text: "Contacts exported successfully!", type: "success" });
    } catch (error) {
      console.error("Error exporting contacts:", error);
      setMessage({ text: "Failed to export contacts.", type: "error" });
    }
  };

  const handleOpenAddContactModal = () => {
    setAddContactFormData({
      name: "",
      number: "",
      label: "",
      consent: false,
    });
    setAddContactFormErrors({});
    setIsAddContactModalOpen(true);
  };

  const handleCloseAddContactModal = () => {
    if (!submitting) {
      setIsAddContactModalOpen(false);
      setAddContactFormData({
        name: "",
        number: "",
        label: "",
        consent: false,
      });
      setAddContactFormErrors({});
    }
  };

  const validatePhoneNumber = (phone: string): boolean => {
    const digitsOnly = phone.replace(/\D/g, "");
    return digitsOnly.length >= 10 && digitsOnly.length <= 15;
  };

  const validateAddContactForm = (): boolean => {
    const errors: AddContactFormErrors = {};

    if (!addContactFormData.name.trim()) {
      errors.name = "Name is required";
    }

    if (!addContactFormData.number.trim()) {
      errors.number = "Phone number is required";
    } else if (!validatePhoneNumber(addContactFormData.number)) {
      errors.number = "Please enter a valid phone number";
    }

    setAddContactFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddContact = async () => {
    if (!validateAddContactForm()) return;

    try {
      setSubmitting(true);

      const contactPayload = {
        name: addContactFormData.name,
        number: addContactFormData.number,
        labelId: addContactFormData.label || undefined,
        consent: addContactFormData.consent,
        status: "on_hold" as const
      };

      console.log("Creating contact with payload:", contactPayload);
      const tenantId = getTenantId();
      if (!tenantId) {
        setMessage({
          text: "Please log in to add contacts.",
          type: "error"
        });
        return;
      }

      const response = await axiosClient.post(`/contact/${tenantId}`, contactPayload);
      console.log("Contact created successfully:", response.data);

      setMessage({ text: "Contact added successfully!", type: "success" });
      handleCloseAddContactModal();
      await fetchContacts();
    } catch (error: any) {
      console.error("Error adding contact:", error);
      const errorMessage = error.response?.data?.error || "Failed to add contact. Please try again.";
      setMessage({ text: errorMessage, type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddContactInputChange = (field: keyof AddContactFormData, value: string | boolean) => {
    setAddContactFormData((prev) => ({ ...prev, [field]: value }));
    if (field !== "consent" && addContactFormErrors[field as keyof AddContactFormErrors]) {
      setAddContactFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleOpenLabelModal = () => {
    setNewLabelName("");
    setLabelError(null);
    setIsLabelModalOpen(true);
  };

  const handleCloseLabelModal = () => {
    setIsLabelModalOpen(false);
    setNewLabelName("");
    setLabelError(null);
  };

  const handleAddLabel = async () => {
    const trimmedLabel = newLabelName.trim();

    if (!trimmedLabel) {
      setLabelError("Label name is required");
      return;
    }

    if (labels.some((label) => label.name.toLowerCase() === trimmedLabel.toLowerCase())) {
      setLabelError("Label already exists");
      return;
    }

    try {
      setSubmitting(true);
      const tenantId = getTenantId();
      if (!tenantId) {
        setLabelError("Please log in to add labels.");
        return;
      }

      await axios.post(`${LABEL_API_BASE_URL}/label/${tenantId}`, {
        name: trimmedLabel,
      });

      setMessage({ text: "Label added successfully!", type: "success" });
      handleCloseLabelModal();
      await fetchLabels();
    } catch (error: any) {
      console.error("Error adding label:", error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || "Failed to add label. Please try again.";
      setLabelError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Contact & Leads
          </h1>
        </div>

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
                All Leads ({leads.length})
              </h2>
              <div className="flex items-center gap-4">
                <button
                    onClick={handleOpenAddContactModal}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Contact
                </button>

                <button
                    onClick={handleOpenLabelModal}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Label
                </button>

                <Link
                    href="contacts/bulk-upload"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <Upload className="w-4 h-4" />
                  Bulk Upload
                </Link>

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
                      placeholder="Search leads..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">Loading contacts...</p>
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
                        Number
                      </th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">
                        Label
                      </th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">
                        Status
                      </th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">
                        Created
                      </th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">
                        Action
                      </th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredLeads.map((lead) => (
                        <tr
                            key={lead.id}
                            className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <td className="py-4 px-6 text-sm font-medium text-gray-900 dark:text-white">
                            {lead.name}
                          </td>
                          <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
                            {lead.number}
                          </td>
                          <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
                            {lead.label || "No Label"}
                          </td>
                          <td className="py-4 px-6">
                        <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(
                                lead.status
                            )}`}
                        >
                          {lead.status?.replace("_", " ") || "on hold"}
                        </span>
                          </td>
                          <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
                            {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : "N/A"}
                          </td>
                          <td className="py-4 px-6">
                            <button
                                onClick={() => handleDelete(lead.id)}
                                disabled={deleting === lead.id}
                                className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Delete lead"
                            >
                              {deleting === lead.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                  <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </td>
                        </tr>
                    ))}
                    </tbody>
                  </table>
                  {filteredLeads.length === 0 && (
                      <div className="text-center py-16">
                        <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
                          {searchTerm ? "No contacts found matching your search." : "No contacts yet."}
                        </p>
                        {!searchTerm && (
                            <p className="text-gray-400 dark:text-gray-500 text-sm">
                              Click "Add Contact" to create your first contact.
                            </p>
                        )}
                      </div>
                  )}
                </div>
            )}
          </div>
        </div>

        {/* Add Contact Modal */}
        {isAddContactModalOpen && (
            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div
                  className="fixed inset-0 bg-black/30 backdrop-blur-sm"
                  onClick={handleCloseAddContactModal}
              ></div>

              <div className="flex min-h-full items-center justify-center p-4">
                <div
                    className="relative bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-md"
                    onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Add Contact
                    </h3>
                    <button
                        onClick={handleCloseAddContactModal}
                        disabled={submitting}
                        className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
                          value={addContactFormData.name}
                          onChange={(e) => handleAddContactInputChange("name", e.target.value)}
                          disabled={submitting}
                          className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                              addContactFormErrors.name
                                  ? "border-red-500 focus:ring-red-500"
                                  : "border-gray-300 dark:border-gray-600"
                          }`}
                          placeholder="Enter contact name"
                      />
                      {addContactFormErrors.name && (
                          <p className="mt-1 text-sm text-red-500">
                            {addContactFormErrors.name}
                          </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <PhoneInput
                          defaultCountry="ng"
                          value={addContactFormData.number}
                          onChange={(phone) => handleAddContactInputChange("number", phone)}
                          disabled={submitting}
                          className={`w-full ${
                              addContactFormErrors.number ? "phone-input-error" : ""
                          }`}
                          inputClassName="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {addContactFormErrors.number && (
                          <p className="mt-1 text-sm text-red-500">
                            {addContactFormErrors.number}
                          </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Select Label
                      </label>
                      <select
                          value={addContactFormData.label}
                          onChange={(e) => handleAddContactInputChange("label", e.target.value)}
                          disabled={submitting || labels.length === 0 || loadingLabels}
                          className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                              addContactFormErrors.label
                                  ? "border-red-500 focus:ring-red-500"
                                  : "border-gray-300 dark:border-gray-600"
                          }`}
                      >
                        <option value="">
                          {loadingLabels ? "Loading labels..." : labels.length === 0 ? "No labels available" : "Select a label"}
                        </option>
                        {labels.map((label) => (
                            <option key={label.id} value={label.id}>
                              {label.name}
                            </option>
                        ))}
                      </select>
                      {labels.length === 0 && !loadingLabels && (
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Add a label to enable this dropdown.
                          </p>
                      )}
                      {addContactFormErrors.label && (
                          <p className="mt-1 text-sm text-red-500">
                            {addContactFormErrors.label}
                          </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Consent
                      </label>
                      <button
                          onClick={() => handleAddContactInputChange("consent", !addContactFormData.consent)}
                          disabled={submitting}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                              addContactFormData.consent
                                  ? "bg-blue-600"
                                  : "bg-gray-300 dark:bg-gray-600"
                          }`}
                      >
                    <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            addContactFormData.consent
                                ? "translate-x-6"
                                : "translate-x-1"
                        }`}
                    />
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-6 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={handleCloseAddContactModal}
                        disabled={submitting}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                    <button
                        onClick={handleAddContact}
                        disabled={submitting}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Adding...
                          </>
                      ) : (
                          "Add Contact"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
        )}

        {/* Add Label Modal */}
        {isLabelModalOpen && (
            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div
                  className="fixed inset-0 bg-black/30 backdrop-blur-sm"
                  onClick={handleCloseLabelModal}
              ></div>

              <div className="flex min-h-full items-center justify-center p-4">
                <div
                    className="relative bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-md"
                    onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Add Label
                    </h3>
                    <button
                        onClick={handleCloseLabelModal}
                        className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="px-6 py-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Label Name <span className="text-red-500">*</span>
                      </label>
                      <input
                          type="text"
                          value={newLabelName}
                          onChange={(e) => {
                            setNewLabelName(e.target.value);
                            if (labelError) {
                              setLabelError(null);
                            }
                          }}
                          disabled={submitting}
                          className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                              labelError
                                  ? "border-red-500 focus:ring-red-500"
                                  : "border-gray-300 dark:border-gray-600"
                          }`}
                          placeholder="Enter label name"
                      />
                      {labelError && (
                          <p className="mt-1 text-sm text-red-500">
                            {labelError}
                          </p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={handleCloseLabelModal}
                        disabled={submitting}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                    <button
                        onClick={handleAddLabel}
                        disabled={submitting}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Adding...
                          </>
                      ) : (
                          <>
                            <Plus className="w-4 h-4" />
                            Add Label
                          </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
        )}
      </div>
  );
}