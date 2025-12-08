"use client";

import { useState, useEffect } from "react";
import { Search, Eye, Calendar, Loader2, X, Trash2 } from "lucide-react";
import axiosClient from "@/lib/axiosClient";

interface Handoff {
  id: string;
  contactName: string;
  phoneNumber: string;
  note: string;
  callDate: string;
  callTime: string;
  duration: string;
  status: "Upcoming" | "Completed" | "Missed";
}

export default function HumanHandoffPage() {
  const [handoffs, setHandoffs] = useState<Handoff[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<"All" | "Upcoming" | "Completed" | "Missed">("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [viewHandoff, setViewHandoff] = useState<Handoff | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedHandoffId, setSelectedHandoffId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({ contactName: "", phoneNumber: "", note: "", callDate: "", callTime: "", duration: "" });
  const [formErrors, setFormErrors] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const itemsPerPage = 5;

  useEffect(() => {
    const fetchHandoffs = async () => {
      try {
        setLoading(true);
        setError(null);

        const tenantId =
          typeof window !== "undefined" ? localStorage.getItem("tenantId") : null;

        if (!tenantId) {
          setError("Tenant information not found. Please sign in again.");
          setLoading(false);
          return;
        }

        const response = await axiosClient.get(`/handoff/${tenantId}/`);
        const items = response.data?.data ?? [];

        const mapped: Handoff[] = items.map((item: any, index: number) => {
          const rawStatus = (item.status || "completed") as string;
          let normalizedStatus: Handoff["status"] = "Completed";
          if (rawStatus.toLowerCase() === "upcoming") normalizedStatus = "Upcoming";
          else if (rawStatus.toLowerCase() === "missed") normalizedStatus = "Missed";

          return {
            id: item.id?.toString() ?? `${index}`,
            contactName: item.contactName,
            phoneNumber: item.phoneNumber,
            note: item.note,
            callDate: item.callDate,
            callTime: item.callTime,
            duration: item.duration,
            status: normalizedStatus,
          };
        });

        setHandoffs(mapped);
      } catch (err: any) {
        console.error("Error fetching handoffs:", err);
        setError(
          err?.response?.data?.error ||
            err?.response?.data?.message ||
            "Failed to load handoffs. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchHandoffs();
  }, []);

  const filteredHandoffs = handoffs.filter(h => {
    const matchesSearch = h.contactName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         h.phoneNumber.includes(searchTerm) || 
                         h.note.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === "All" || h.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filteredHandoffs.length / itemsPerPage);
  const currentHandoffs = filteredHandoffs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getStatusColor = (status: Handoff["status"]) => ({
    Upcoming: "bg-green-100 text-green-800",
    Completed: "bg-blue-100 text-blue-800",
    Missed: "bg-red-100 text-red-800",
  }[status]);

  const validateForm = () => {
    const errors: any = {};
    if (!formData.contactName.trim()) errors.contactName = "Required";
    if (!formData.phoneNumber.trim()) errors.phoneNumber = "Required";
    if (!formData.note.trim()) errors.note = "Required";
    if (!formData.callDate) errors.callDate = "Required";
    if (!formData.callTime) errors.callTime = "Required";
    if (!formData.duration) errors.duration = "Required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleScheduleCallback = async () => {
    if (!validateForm()) return;
    setSubmitting(true);
    setTimeout(() => {
      setHandoffs(prev => [{
        id: Date.now().toString(),
        contactName: formData.contactName,
        phoneNumber: formData.phoneNumber,
        note: formData.note,
        callDate: formData.callDate,
        callTime: formData.callTime,
        duration: formData.duration,
        status: "Upcoming",
      }, ...prev]);
      setIsScheduleModalOpen(false);
      setFormData({ contactName: "", phoneNumber: "", note: "", callDate: "", callTime: "", duration: "" });
      setSubmitting(false);
    }, 1000);
  };

  const handleDeleteClick = (handoffId: string) => {
    setSelectedHandoffId(handoffId);
    setViewHandoff(null); // Close the details modal
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedHandoffId) return;
    
    try {
      setIsDeleting(true);
      setError(null);
      
      const tenantId = localStorage.getItem("tenantId");
      if (!tenantId) {
        throw new Error("Tenant information not found. Please sign in again.");
      }

      const response = await axiosClient.delete(`/calls/${tenantId}`, {
        data: { deleteHandoffs: true, handoffId: selectedHandoffId },
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 200) {
        // Remove the deleted handoff from the list
        setHandoffs(prev => prev.filter(h => h.id !== selectedHandoffId));
        setIsDeleteModalOpen(false);
        // Show success message
        console.log("Handoff deleted successfully");
      } else {
        throw new Error("Failed to delete handoff");
      }
    } catch (err: any) {
      console.error("Error deleting handoff:", err);
      setError(
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to delete handoff. Please try again."
      );
    } finally {
      setIsDeleting(false);
      setSelectedHandoffId(null);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setSelectedHandoffId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 py-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Human Handoff</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">View and manage all scheduled human callbacks and inquiries.</p>
          </div>
          {/* <button onClick={() => setIsScheduleModalOpen(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
            <Calendar className="w-4 h-4" />Schedule Callback
          </button> */}
        </div>
      </div>

      <div className="p-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Search by name, phone, or note..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-80" />
              </div>
              <div className="flex gap-2">
                {["All", "Upcoming", "Completed", "Missed"].map(filter => (
                  <button key={filter} onClick={() => { setActiveFilter(filter as any); setCurrentPage(1); }} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeFilter === filter ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"}`}>{filter}</button>
                ))}
              </div>
            </div>
          </div>
          {error && (
            <div className="px-6 pt-2 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
          <table className="w-full table-fixed">
            <colgroup>
              <col className="w-[15%]" />
              <col className="w-[13%]" />
              <col className="w-[25%]" />
              <col className="w-[10%]" />
              <col className="w-[9%]" />
              <col className="w-[9%]" />
              <col className="w-[12%]" />
              <col className="w-[7%]" />
            </colgroup>
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">Contact Name</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">Phone Number</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">Note</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">Call Date</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">Call Time</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">Duration</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">Status</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      <span>Loading handoffs...</span>
                    </div>
                  </td>
                </tr>
              ) : currentHandoffs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                    No handoffs found.
                  </td>
                </tr>
              ) : (
                currentHandoffs.map(handoff => (
                  <tr key={handoff.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="py-4 px-6 text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">{handoff.contactName}</td>
                    <td className="py-4 px-6 text-sm text-blue-600 dark:text-blue-400 whitespace-nowrap">{handoff.phoneNumber}</td>
                    <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400 group relative">
                      <div className="truncate cursor-help">{handoff.note}</div>
                      <div className="invisible group-hover:visible absolute left-0 top-full mt-2 z-50 w-80 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl pointer-events-none">
                        {handoff.note}
                        <div className="absolute -top-1 left-6 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">{handoff.callDate}</td>
                    <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">{handoff.callTime}</td>
                    <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">{handoff.duration}</td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(handoff.status)}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        {handoff.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <button 
                        onClick={() => setViewHandoff(handoff)} 
                        className="p-1.5 text-gray-600 hover:text-blue-600 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-center gap-2">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50">← Previous</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button key={page} onClick={() => setCurrentPage(page)} className={`px-3 py-1 text-sm rounded ${currentPage === page ? "bg-blue-600 text-white" : "text-gray-600"}`}>{page}</button>
            ))}
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50">Next →</button>
          </div>
        </div>
      </div>

      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => !submitting && setIsScheduleModalOpen(false)}></div>
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Schedule Callback</h3>
                <button onClick={() => !submitting && setIsScheduleModalOpen(false)} className="text-gray-400 hover:text-gray-500"><X className="w-5 h-5" /></button>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Name <span className="text-red-500">*</span></label>
                  <input type="text" value={formData.contactName} onChange={(e) => setFormData({...formData, contactName: e.target.value})} className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.contactName ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`} placeholder="Enter contact name" />
                  {formErrors.contactName && <p className="mt-1 text-sm text-red-500">{formErrors.contactName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number <span className="text-red-500">*</span></label>
                  <input type="text" value={formData.phoneNumber} onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.phoneNumber ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`} placeholder="+1234567890" />
                  {formErrors.phoneNumber && <p className="mt-1 text-sm text-red-500">{formErrors.phoneNumber}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Note <span className="text-red-500">*</span></label>
                  <textarea value={formData.note} onChange={(e) => setFormData({...formData, note: e.target.value})} rows={3} className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${formErrors.note ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`} placeholder="Enter callback reason or notes" />
                  {formErrors.note && <p className="mt-1 text-sm text-red-500">{formErrors.note}</p>}
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Call Date <span className="text-red-500">*</span></label>
                    <input type="date" value={formData.callDate} onChange={(e) => setFormData({...formData, callDate: e.target.value})} className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.callDate ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`} />
                    {formErrors.callDate && <p className="mt-1 text-sm text-red-500">{formErrors.callDate}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Call Time <span className="text-red-500">*</span></label>
                    <input type="time" value={formData.callTime} onChange={(e) => setFormData({...formData, callTime: e.target.value})} className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.callTime ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`} />
                    {formErrors.callTime && <p className="mt-1 text-sm text-red-500">{formErrors.callTime}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration <span className="text-red-500">*</span></label>
                    <input type="text" value={formData.duration} onChange={(e) => setFormData({...formData, duration: e.target.value})} className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.duration ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`} placeholder="15 min" />
                    {formErrors.duration && <p className="mt-1 text-sm text-red-500">{formErrors.duration}</p>}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <button onClick={() => setIsScheduleModalOpen(false)} disabled={submitting} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50">Cancel</button>
                <button onClick={handleScheduleCallback} disabled={submitting} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400">
                  {submitting ? <><Loader2 className="w-4 h-4 animate-spin" />Scheduling...</> : "Schedule Callback"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewHandoff && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setViewHandoff(null)}></div>
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Callback Details</h3>
                <button onClick={() => setViewHandoff(null)} className="text-gray-400 hover:text-gray-500"><X className="w-5 h-5" /></button>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div><p className="text-sm text-gray-600 dark:text-gray-400">Contact Name</p><p className="text-base font-medium text-gray-900 dark:text-white">{viewHandoff.contactName}</p></div>
                <div><p className="text-sm text-gray-600 dark:text-gray-400">Phone Number</p><p className="text-base font-medium text-blue-600 dark:text-blue-400">{viewHandoff.phoneNumber}</p></div>
                <div><p className="text-sm text-gray-600 dark:text-gray-400">Note</p><p className="text-base text-gray-900 dark:text-white">{viewHandoff.note}</p></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-sm text-gray-600 dark:text-gray-400">Call Date</p><p className="text-base font-medium text-gray-900 dark:text-white">{viewHandoff.callDate}</p></div>
                  <div><p className="text-sm text-gray-600 dark:text-gray-400">Call Time</p><p className="text-base font-medium text-gray-900 dark:text-white">{viewHandoff.callTime}</p></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-sm text-gray-600 dark:text-gray-400">Duration</p><p className="text-base font-medium text-gray-900 dark:text-white">{viewHandoff.duration}</p></div>
                  <div><p className="text-sm text-gray-600 dark:text-gray-400">Status</p><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(viewHandoff.status)}`}>● {viewHandoff.status}</span></div>
                </div>
              </div>
              <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <button 
                  onClick={() => setViewHandoff(null)} 
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
                <button 
                  onClick={() => handleDeleteClick(viewHandoff.id)}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleCancelDelete}
          ></div>
          
          {/* Modal */}
          <div className="relative z-10 w-full max-w-md rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-2xl">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Delete Handoff
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Are you sure you want to delete this handoff? This action cannot be undone.
              </p>
              
              <div className="flex justify-center gap-3">
                <button
                  type="button"
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  onClick={handleCancelDelete}
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </>
                  )}
                </button>
              </div>
              
              {error && (
                <div className="mt-4 text-sm text-red-500">
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
