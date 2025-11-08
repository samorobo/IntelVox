"use client";

import { useState, useEffect } from "react";
import { Search, Download, Trash2, Plus, Upload, X, Loader2, FileDown } from "lucide-react";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";

interface Lead {
  _id: string;
  name: string;
  number: string;
  dateTime: string;
  duration: string;
  status: "converted" | "rejected" | "reschedule" | "handoff" | "on-hold";
}

interface AddContactFormData {
  name: string;
  phoneNumber: string;
  consent: boolean;
}

interface AddContactFormErrors {
  name?: string;
  phoneNumber?: string;
}

export default function ContactLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([
    {
      _id: "1",
      name: "John Doe",
      number: "+1 234 567 8900",
      dateTime: "2025-10-15T14:30:00",
      duration: "15:30",
      status: "converted",
    },
    {
      _id: "2",
      name: "Jane Smith",
      number: "+1 234 567 8901",
      dateTime: "2025-10-15T10:15:00",
      duration: "08:45",
      status: "on-hold",
    },
    {
      _id: "3",
      name: "Mike Johnson",
      number: "+1 234 567 8902",
      dateTime: "2025-10-14T16:45:00",
      duration: "12:20",
      status: "reschedule",
    },
    {
      _id: "4",
      name: "Sarah Williams",
      number: "+1 234 567 8903",
      dateTime: "2025-10-14T09:00:00",
      duration: "05:15",
      status: "rejected",
    },
    {
      _id: "5",
      name: "David Brown",
      number: "+1 234 567 8904",
      dateTime: "2025-10-13T13:20:00",
      duration: "20:10",
      status: "handoff",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);
  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
  const [addContactFormData, setAddContactFormData] = useState<AddContactFormData>({
    name: "",
    phoneNumber: "",
    consent: false,
  });
  const [addContactFormErrors, setAddContactFormErrors] = useState<AddContactFormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleDelete = (id: string) => {
    const leadName = leads.find((l) => l._id === id)?.name;
    if (window.confirm(`Are you sure you want to delete ${leadName}?`)) {
      setLeads((prev) => prev.filter((l) => l._id !== id));
      setMessage({ text: "Lead deleted successfully.", type: "success" });
    }
  };

  const filteredLeads = leads.filter(
    (lead) =>
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: Lead["status"]) => {
    const colors = {
      converted:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      reschedule:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      handoff: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      "on-hold":
        "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
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

  const handleExport = () => {
    setMessage({ text: "Exporting leads data...", type: "success" });
  };

  const handleOpenAddContactModal = () => {
    setAddContactFormData({
      name: "",
      phoneNumber: "",
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
        phoneNumber: "",
        consent: false,
      });
      setAddContactFormErrors({});
    }
  };

  const validatePhoneNumber = (phone: string): boolean => {
    // Basic validation - phone number should have at least 10 digits
    const digitsOnly = phone.replace(/\D/g, "");
    return digitsOnly.length >= 10 && digitsOnly.length <= 15;
  };

  const validateAddContactForm = (): boolean => {
    const errors: AddContactFormErrors = {};

    if (!addContactFormData.name.trim()) {
      errors.name = "Name is required";
    }

    if (!addContactFormData.phoneNumber.trim()) {
      errors.phoneNumber = "Phone number is required";
    } else if (!validatePhoneNumber(addContactFormData.phoneNumber)) {
      errors.phoneNumber = "Please enter a valid phone number";
    }

    setAddContactFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddContact = async () => {
    if (!validateAddContactForm()) return;

    try {
      setSubmitting(true);

      // TODO: API call will be integrated here
      // const response = await axios.post(`${API_BASE_URL}contact`, {
      //   name: addContactFormData.name,
      //   number: addContactFormData.phoneNumber,
      //   consent: addContactFormData.consent,
      // });

      // For now, add to local state
      const newLead: Lead = {
        _id: Date.now().toString(),
        name: addContactFormData.name,
        number: addContactFormData.phoneNumber,
        dateTime: new Date().toISOString(),
        duration: "00:00",
        status: "on-hold",
      };

      setLeads((prev) => [newLead, ...prev]);
      setMessage({ text: "Contact added successfully!", type: "success" });
      handleCloseAddContactModal();
    } catch (err) {
      console.error("Error adding contact:", err);
      setMessage({ text: "Failed to add contact", type: "error" });
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

  const handleDownloadTemplate = () => {
    // TODO: API call will be integrated here to download actual template
    // For now, create a simple CSV template
    const csvContent = "Name,Phone Number,Consent\nJohn Doe,+1234567890,true\nJane Smith,+1987654321,false";
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "contacts_template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    setMessage({ text: "CSV template downloaded successfully!", type: "success" });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
        setMessage({ text: "Please upload a CSV file", type: "error" });
        return;
      }
      setUploadedFile(file);
    }
  };

  const handleUploadCSV = async () => {
    if (!uploadedFile) {
      setMessage({ text: "Please select a file to upload", type: "error" });
      return;
    }

    try {
      setSubmitting(true);

      // TODO: API call will be integrated here
      // const formData = new FormData();
      // formData.append('file', uploadedFile);
      // const response = await axios.post(`${API_BASE_URL}contacts/bulk-upload`, formData);

      // Simulate upload
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setMessage({ text: "CSV file uploaded successfully!", type: "success" });
      setUploadedFile(null);
      setIsBulkUploadModalOpen(false);
    } catch (err) {
      console.error("Error uploading CSV:", err);
      setMessage({ text: "Failed to upload CSV file", type: "error" });
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
              All Leads
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
                onClick={() => setIsBulkUploadModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                <Upload className="w-4 h-4" />
                Bulk Upload
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
                  placeholder="Search leads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Loading leads...
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
                      Date/Time
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">
                      Duration
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">
                      Status
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map((lead) => (
                    <tr
                      key={lead._id}
                      className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="py-4 px-6 text-sm font-medium text-gray-900 dark:text-white">
                        {lead.name}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
                        {lead.number}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
                        {formatDateTime(lead.dateTime)}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
                        {lead.duration}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(
                            lead.status
                          )}`}
                        >
                          {lead.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => handleDelete(lead._id)}
                          className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          title="Delete lead"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredLeads.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No leads found matching your search.
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
              className="relative bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-md animate-fadeIn"
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
                    value={addContactFormData.phoneNumber}
                    onChange={(phone) => handleAddContactInputChange("phoneNumber", phone)}
                    disabled={submitting}
                    className={`w-full ${
                      addContactFormErrors.phoneNumber ? "phone-input-error" : ""
                    }`}
                    inputClassName="w-full"
                    countrySelectorStyleProps={{
                      buttonClassName: "country-selector-button"
                    }}
                  />
                  {addContactFormErrors.phoneNumber && (
                    <p className="mt-1 text-sm text-red-500">
                      {addContactFormErrors.phoneNumber}
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
                      Please wait...
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

      {/* Bulk Upload Modal */}
      {isBulkUploadModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => !submitting && setIsBulkUploadModalOpen(false)}
          ></div>

          <div className="flex min-h-full items-center justify-center p-4">
            <div
              className="relative bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl animate-fadeIn"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Bulk Upload Contacts
                </h3>
                <button
                  onClick={() => !submitting && setIsBulkUploadModalOpen(false)}
                  disabled={submitting}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="px-6 py-6 space-y-8">
                {/* Step 1 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <FileDown className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                      Step 1. Download the Intelvox CSV template file
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Choose if you want to download a blank Intelvox CSV template file, or a CSV file with all your current Intelvox products.
                    </p>
                    <button
                      onClick={handleDownloadTemplate}
                      disabled={submitting}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FileDown className="w-4 h-4" />
                      Download CSV File
                    </button>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 dark:border-gray-700"></div>

                {/* Step 2 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <Upload className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                      Step 2. Upload your products
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Add or edit your product info in the Intelvox CSV file, making sure you don't add or delete columns. Once your Intelvox CSV file is ready to go, upload it here.
                    </p>
                    <div className="space-y-3">
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        disabled={submitting}
                        className="hidden"
                        id="csv-upload"
                      />
                      <label
                        htmlFor="csv-upload"
                        className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer ${
                          submitting ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        <Upload className="w-4 h-4" />
                        {uploadedFile ? "Change CSV File" : "Upload CSV File"}
                      </label>
                      {uploadedFile && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Selected:</span>
                          <span>{uploadedFile.name}</span>
                          <button
                            onClick={() => setUploadedFile(null)}
                            disabled={submitting}
                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setIsBulkUploadModalOpen(false)}
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUploadCSV}
                  disabled={submitting || !uploadedFile}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Upload
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