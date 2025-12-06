"use client";

import { useState, useEffect } from "react";
import { formatDate } from "@/lib/format";
import {
  Search,
  Plus,
  Eye,
  Edit,
  PhoneIncoming,
  PhoneOutgoing,
  X,
  Loader2,
  Calendar,
  TrendingUp,
  Users,
  Phone,
} from "lucide-react";
import toast from "react-hot-toast";
import axiosClient from "@/lib/axiosClient";
import { getTenantIdOrThrow } from "@/lib/utils";

interface Campaign {
  id: string;
  name: string;
  type: "Inbound" | "Outbound";
  aiAgent?: string; // For display purposes only
  agentId: string;
  startDate: string;
  endDate: string;
  status: "Active" | "Inactive" | "Suspended" | "Scheduled";
  description?: string;
  labelId?: string;
  totalCalls?: string; // Stored as String in Prisma schema
  contactsReached?: string; // Stored as String in Prisma schema
  conversationRate?: string; // Using conversationRate as specified by user
  tenantId?: string;

  //newly added field
  tenantName?: string;
  tenantEmail?: string;
  labelName?: string;
  agentType?: string;
  agentStatus?: string;
  agentVoice?: string;
  agentConversations?: string;
  agentRetention?: string;
}

interface AIAgent {
  id: string;
  name: string;
  type: string;
}

interface Label {
  id: string;
  name: string;
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiAgents, setAiAgents] = useState<AIAgent[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [campaignType, setCampaignType] = useState<
    "inbound" | "outbound" | null
  >(null);
  const [submitting, setSubmitting] = useState(false);
  const [viewCampaign, setViewCampaign] = useState<Campaign | null>(null);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [formData, setFormData] = useState<any>({
    name: "",
    agent: "",
    startDate: "",
    endDate: "",
    description: "",
    label: "",
  });
  const [formErrors, setFormErrors] = useState<any>({});
  const [viewLoading, setViewLoading] = useState(false);


  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [statusUpdating, setStatusUpdating] = useState(false);



  const itemsPerPage = 5;

  // Fetch campaigns, agents, and labels on component mount
  // useEffect(() => {
  //   const loadData = async () => {
  //     await Promise.all([fetchAgents(), fetchLabels()]);
  //     await fetchCampaigns();
  //   };
  //   loadData();
  // }, []);

  useEffect(() => {
    const loadData = async () => {
      await fetchAgents(); // Wait for agents first
      await fetchLabels();
      await fetchCampaigns(); // Then fetch campaigns
    };
    loadData();
  }, []);

  useEffect(() => {
    if (aiAgents.length > 0 && campaigns.length === 0) {
      fetchCampaigns();
    }
  }, [aiAgents]);

  const handleViewCampaign = async (id: string) => {
    try {
      setViewLoading(true);
      const tenantId = getTenantIdOrThrow();
      const response = await axiosClient.get(`/campaign/${tenantId}/${id}`);

      // Backend may return:
      // - a plain object
      // - { data: object }
      // - a JSON string of either of the above
      let payload: any = response.data;

      if (typeof payload === "string") {
        try {
          payload = JSON.parse(payload);
        } catch (e) {
          console.error("Failed to parse campaign details JSON:", e);
          toast.error("Failed to load campaign details");
          return;
        }
      }

      let data: any = payload?.data ?? payload;

      // If backend still returns an array, pick matching id or first
      if (Array.isArray(data)) {
        if (data.length === 0) {
          toast.error("Campaign details not found");
          return;
        }
        data = data.find((item: any) => item.id === id) ?? data[0];
      }

      if (!data || typeof data !== "object") {
        toast.error("Campaign details not found");
        return;
      }

      const formatted: Campaign = {
        id: data.id || data._id,
        name: data.name,
        type: data.type,
        agentId: data.agentId,
        aiAgent: data.agent?.name || "",
        startDate: data.startDate,
        endDate: data.endDate,
        // Convert backend lowercase status to PascalCase for frontend
        status: (data.status.charAt(0).toUpperCase() + data.status.slice(1)) as Campaign["status"],
        description: data.description,
        labelId: data.labelId,
        totalCalls: data.totalCalls ?? "0",
        contactsReached: data.contactsReached ?? "0",
        conversationRate: data.conversationRate ?? "0%",
        tenantId: data.tenantId,

        // New mapped fields from your sample response
        tenantName: data.tenant?.name,
        tenantEmail: data.tenant?.email,
        labelName: data.label?.name,
        agentType: data.agent?.type,
        agentStatus: data.agent?.status,
        agentVoice: data.agent?.voice,
        agentConversations: data.agent?.conversations,
        agentRetention: data.agent?.retention,
      };

      setViewCampaign(formatted);
      // Store lowercase for dropdown (backend sends lowercase)
      setSelectedStatus(data.status.toLowerCase());
    } catch (error: any) {
      console.error("Error fetching campaign details:", error);
      toast.error(
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        "Failed to load campaign details"
      );
    } finally {
      setViewLoading(false);
    }
  };

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const tenantId = getTenantIdOrThrow();
      const response = await axiosClient.get(`/campaign/${tenantId}`);
      // Map backend response to match our interface
      const formattedCampaigns = response.data.map((campaign: any) => {
        const agent = aiAgents.find((a) => a.id === campaign.agentId);
        return {
          id: campaign.id || campaign._id,
          name: campaign.name,
          type: campaign.type,
          agentId: campaign.agentId,
          aiAgent: campaign.agent?.name || "N/A",

          startDate: campaign.startDate,
          endDate: campaign.endDate,
          status: campaign.status,
          description: campaign.description,
          labelId: campaign.labelId,
          totalCalls: campaign.totalCalls || 0,
          contactsReached: campaign.contactsReached || 0,
          conversationRate: campaign.conversationRate || "0%",
          tenantId: campaign.tenantId,
        };
      });
      setCampaigns(formattedCampaigns);
    } catch (error: any) {
      console.error("Error fetching campaigns:", error);
      toast.error(error.response?.data?.error || "Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const tenantId = getTenantIdOrThrow();
      const response = await axiosClient.get(`/agents/${tenantId}`);
      setAiAgents(response.data);
    } catch (error: any) {
      console.error("Error fetching agents:", error);
      toast.error("Failed to load AI agents");
    }
  };

  const fetchLabels = async () => {
    try {
      const tenantId = getTenantIdOrThrow();
      const response = await axiosClient.get(`/label/${tenantId}`);
      // Handle both array of objects and array of strings
      const labelsData = response.data;
      if (Array.isArray(labelsData)) {
        const formattedLabels = labelsData.map((label: any) => {
          if (typeof label === "string") {
            return { id: label, name: label };
          }
          return { id: label.id || label.name, name: label.name || label.id };
        });
        setLabels(formattedLabels);
      }
    } catch (error: any) {
      console.error("Error fetching labels:", error);
      // Don't show error toast for labels, just log it
    }
  };

  const filteredCampaigns = campaigns.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredCampaigns.length / itemsPerPage);
  const currentCampaigns = filteredCampaigns.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusColor = (status: Campaign["status"]) =>
  ({
    Active: "bg-green-100 text-green-800",
    Scheduled: "bg-yellow-100 text-yellow-800",
    Inactive: "bg-gray-100 text-gray-800",
    Suspended: "bg-red-100 text-red-800",
  }[status]);


  const handleCloseModal = () => {
    if (!submitting) {
      setIsCreateModalOpen(false);
      setCampaignType(null);
      setEditingCampaign(null);
      setFormData({
        name: "",
        agent: "",
        startDate: "",
        endDate: "",
        description: "",
        label: "",
      });
      setFormErrors({});
    }
  };

  const handleEditCampaign = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setCampaignType(campaign.type.toLowerCase() as "inbound" | "outbound");
    setFormData({
      name: campaign.name,
      agent: campaign.agentId,
      startDate: campaign.startDate
        ? new Date(campaign.startDate).toISOString().split("T")[0]
        : "",
      endDate: campaign.endDate
        ? new Date(campaign.endDate).toISOString().split("T")[0]
        : "",
      description: campaign.description || "",
      label: campaign.labelId || "",
    });
    setIsCreateModalOpen(true);
  };

  const validateForm = () => {
    const errors: any = {};
    if (!formData.name.trim()) errors.name = "Required";
    if (!formData.agent) errors.agent = "Required";
    if (!formData.startDate) errors.startDate = "Required";
    if (!formData.endDate) errors.endDate = "Required";
    if (!formData.description.trim()) errors.description = "Required";
    if (campaignType === "outbound" && !formData.label)
      errors.label = "Required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };



  const handleUpdateCampaignStatus = async () => {
    if (!viewCampaign || !selectedStatus) return;

    // Store previous status for rollback on error
    const previousStatus = viewCampaign.status.toLowerCase();

    try {
      setStatusUpdating(true);
      const tenantId = getTenantIdOrThrow();

      // Send lowercase status to backend
      await axiosClient.patch(
        `/campaign/${tenantId}/${viewCampaign.id}/status`,
        { status: selectedStatus.toLowerCase() }
      );

      // Convert to PascalCase for frontend state
      const capitalizedStatus = selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1);

      // Update the viewCampaign state with new status
      setViewCampaign({ ...viewCampaign, status: capitalizedStatus as Campaign["status"] });

      // Update the campaigns list as well
      setCampaigns((prev) =>
        prev.map((campaign) =>
          campaign.id === viewCampaign.id
            ? { ...campaign, status: capitalizedStatus as Campaign["status"] }
            : campaign
        )
      );

      toast.success("Campaign status updated successfully");
    } catch (error: any) {
      console.error("Error updating campaign status:", error);

      // Revert dropdown to previous value on error
      setSelectedStatus(previousStatus);

      toast.error(
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        "Failed to update campaign status"
      );
    } finally {
      setStatusUpdating(false);
    }
  };




  // const handleStartCall = async (campaignId: string) => {
  //   try {
  //     const tenantId = getTenantIdOrThrow();
  //     const response = await axiosClient.post(`/call/${tenantId}/outbound`, {
  //       campaignId,
  //     });
  //     toast.success("Outbound call started successfully");
  //     console.log("Call response:", response.data);
  //   } catch (error: any) {
  //     console.error("Error starting outbound call:", error);
  //     toast.error(
  //       error?.response?.data?.error ||
  //         error?.response?.data?.message ||
  //         "Failed to start outbound call"
  //     );
  //   }
  // };


  const handleStartCall = async (campaignId: string) => {
    toast.success("Call initiated! Your outbound call is being processed.", {
      duration: 5000,
    });

    try {
      const tenantId = getTenantIdOrThrow();
      const response = await axiosClient.post(`/call/${tenantId}/outbound`, {
        campaignId,
      });
      console.log("Call response:", response.data);
    } catch (error: any) {
      console.error("Error starting outbound call:", error);
      toast.error(
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        "Failed to start outbound call"
      );
    }
  };



  const handleCreateCampaign = async () => {
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      // Prepare payload according to backend expectations
      const campaignPayload: any = {
        name: formData.name.trim(),
        type: campaignType === "inbound" ? "Inbound" : "Outbound",
        startDate: formData.startDate,
        endDate: formData.endDate,
        description: formData.description.trim(),
        status: editingCampaign ? editingCampaign.status : "Scheduled",
        // Prisma schema stores totalCalls and contactsReached as String, so send strings
        totalCalls: editingCampaign
          ? String(editingCampaign.totalCalls ?? "0")
          : "0",
        contactsReached: editingCampaign
          ? String(editingCampaign.contactsReached ?? "0")
          : "0",
        conversationRate: editingCampaign
          ? editingCampaign.conversationRate || "0%"
          : "0%",
        agentId: formData.agent,
      };

      // Backend requires labelId for all campaigns; always include when present
      if (formData.label) {
        campaignPayload.labelId = formData.label;
      }

      const tenantId = getTenantIdOrThrow();
      campaignPayload.tenantId = tenantId;
      if (editingCampaign) {
        // Update campaign
        const response = await axiosClient.put(
          `/campaign/${tenantId}/${editingCampaign.id}`,
          campaignPayload
        );
        toast.success("Campaign updated!");
        await fetchCampaigns();
      } else {
        // Create new campaign
        const response = await axiosClient.post(
          `/campaign/${tenantId}`,
          campaignPayload
        );
        toast.success("Campaign created!");
        await fetchCampaigns();
      }
      handleCloseModal();
    } catch (error: any) {
      console.error("Error saving campaign:", error);
      toast.error(
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to save campaign"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 py-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Campaign Management
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          View and manage all inbound and outbound AI campaigns.
        </p>
      </div>

      <div className="p-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Create Campaign
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                Loading campaigns...
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">
                    Campaign Name
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">
                    Type
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">
                    AI Agent
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">
                    Start Date
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">
                    End Date
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">
                    Call Type
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentCampaigns.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
                        {searchTerm
                          ? "No campaigns found matching your search."
                          : "No campaigns yet."}
                      </p>
                      {!searchTerm && (
                        <p className="text-gray-400 dark:text-gray-500 text-sm">
                          Click "Create Campaign" to create your first campaign.
                        </p>
                      )}
                    </td>
                  </tr>
                ) : (
                  currentCampaigns.map((campaign) => (
                    <tr
                      key={campaign.id}
                      className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="py-4 px-6 text-sm font-medium text-gray-900 dark:text-white">
                        {campaign.name}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
                        <span className="inline-flex items-center gap-1">
                          {campaign.type === "Inbound" ? (
                            <PhoneIncoming className="w-4 h-4 text-blue-600" />
                          ) : (
                            <PhoneOutgoing className="w-4 h-4 text-purple-600" />
                          )}
                          {campaign.type}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
                        {campaign.aiAgent}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(campaign.startDate)}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(campaign.endDate)}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            campaign.status
                          )}`}
                        >
                          ● {campaign.type}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewCampaign(campaign.id)}
                            disabled={viewLoading}
                            className="p-1.5 text-gray-600 hover:text-blue-600 disabled:opacity-50"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditCampaign(campaign)}
                            className="p-1.5 text-gray-600 hover:text-blue-600"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50"
            >
              ← Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 text-sm rounded ${currentPage === page
                  ? "bg-blue-600 text-white"
                  : "text-gray-600"
                  }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50"
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      {/* View Modal - Slides up from bottom */}
      {viewCampaign && (
        <div className="fixed inset-0 z-50">
          <div
            className="fixed inset-0 bg-black/30"
            onClick={() => setViewCampaign(null)}
          ></div>
          <div className="fixed bottom-0 left-0 right-0 animate-slide-up">
            <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-t-2xl shadow-2xl max-h-[90vh] overflow-y-auto border-t border-gray-200 dark:border-gray-700">
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 py-6 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                    {viewCampaign.name}
                  </h2>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${viewCampaign.type === "Inbound"
                      ? "bg-blue-50 text-blue-700 border border-blue-100"
                      : "bg-purple-50 text-purple-700 border border-purple-100"
                      }`}
                  >
                    {viewCampaign.type} Campaign
                  </span>
                </div>
                {/* <div className="flex items-center gap-3">
                  {viewCampaign.type === "Outbound" && (
    <button
      type="button"
      onClick={() => handleStartCall(viewCampaign.id)}
      className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
      title="Start outbound call"
    >
      <Phone className="w-4 h-4" />
    </button>
  )}
                  <button
                    onClick={() => setViewCampaign(null)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div> */}


                <div className="flex items-center gap-3">
                  {viewCampaign.type === "Outbound" && (
                    <>
                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        disabled={statusUpdating}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                        <option value="scheduled">Scheduled</option>
                      </select>
                      <button
                        onClick={handleUpdateCampaignStatus}
                        disabled={statusUpdating || !selectedStatus}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center gap-2"
                      >
                        {statusUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
                        {statusUpdating ? "Saving..." : "Save Status"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStartCall(viewCampaign.id)}
                        disabled={viewCampaign.status !== "Active"}
                        className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white hover:bg-blue-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400"
                        title={viewCampaign.status === "Active" ? "Start outbound call" : "Campaign must be Active to start calls"}
                      >
                        <Phone className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setViewCampaign(null)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>


              </div>
              <div className="px-8 py-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-2">
                      <Calendar className="w-5 h-5 text-blue-500" />
                      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        Duration
                      </h3>
                    </div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formatDate(viewCampaign.startDate)} -{" "}
                      {formatDate(viewCampaign.endDate)}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-2">
                      <Users className="w-5 h-5 text-purple-500" />
                      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        AI Agent
                      </h3>
                    </div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {viewCampaign.aiAgent || "N/A"}
                    </p>
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  Performance Metrics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-2">
                      <Phone className="w-4 h-4 text-blue-500" />
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Total Calls
                      </p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {viewCampaign.totalCalls || "0"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Total number of calls in this campaign
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-purple-500" />
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Contacts Reached
                      </p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {viewCampaign.contactsReached || "0"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Total unique contacts reached in this campaign
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Conversation Rate
                      </p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {viewCampaign.conversationRate || "0%"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Percentage of calls that resulted in conversations
                    </p>
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                  Campaign Description
                </h3>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                  <p className="text-gray-700 dark:text-gray-300">
                    {viewCampaign.description || "No description available."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm"
            onClick={handleCloseModal}
          ></div>
          <div className="flex min-h-full items-center justify-center p-4">
            <div
              className="relative bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {!campaignType ? (
                <>
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Create New Campaign
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Choose the type of campaign
                      </p>
                    </div>
                    <button
                      onClick={handleCloseModal}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="px-6 py-8">
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setCampaignType("inbound")}
                        className="flex flex-col items-center p-8 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 group"
                      >
                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200">
                          <PhoneIncoming className="w-8 h-8 text-blue-600" />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          Inbound Campaign
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                          Handle incoming calls
                        </p>
                      </button>
                      <button
                        onClick={() => setCampaignType("outbound")}
                        className="flex flex-col items-center p-8 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 group"
                      >
                        <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4 group-hover:bg-purple-200">
                          <PhoneOutgoing className="w-8 h-8 text-purple-600" />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          Outbound Campaign
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                          Reach out proactively
                        </p>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {editingCampaign ? "Update" : "Create"}{" "}
                        {campaignType === "inbound" ? "Inbound" : "Outbound"}{" "}
                        Campaign
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Fill in the details
                      </p>
                    </div>
                    <button
                      onClick={handleCloseModal}
                      disabled={submitting}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Campaign Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        disabled={submitting}
                        className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.name
                          ? "border-red-500"
                          : "border-gray-300 dark:border-gray-600"
                          }`}
                        placeholder="Enter campaign name"
                      />
                      {formErrors.name && (
                        <p className="mt-1 text-sm text-red-500">
                          {formErrors.name}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {campaignType === "inbound" ? "AI Agent" : "AI Model"}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.agent}
                        onChange={(e) =>
                          setFormData({ ...formData, agent: e.target.value })
                        }
                        disabled={submitting}
                        className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.agent
                          ? "border-red-500"
                          : "border-gray-300 dark:border-gray-600"
                          }`}
                      >
                        <option value="">Select AI agent</option>
                        {aiAgents
                          .filter((agent) => {
                            // Filter agents based on campaign type
                            if (campaignType === "inbound") {
                              return agent.type === "inbound";
                            } else if (campaignType === "outbound") {
                              return agent.type === "outbound";
                            }
                            return true;
                          })
                          .map((agent) => (
                            <option key={agent.id} value={agent.id}>
                              {agent.name}
                            </option>
                          ))}
                      </select>
                      {formErrors.agent && (
                        <p className="mt-1 text-sm text-red-500">
                          {formErrors.agent}
                        </p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Start Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={formData.startDate}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              startDate: e.target.value,
                            })
                          }
                          disabled={submitting}
                          className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.startDate
                            ? "border-red-500"
                            : "border-gray-300 dark:border-gray-600"
                            }`}
                        />
                        {formErrors.startDate && (
                          <p className="mt-1 text-sm text-red-500">
                            {formErrors.startDate}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          End Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={formData.endDate}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              endDate: e.target.value,
                            })
                          }
                          disabled={submitting}
                          className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.endDate
                            ? "border-red-500"
                            : "border-gray-300 dark:border-gray-600"
                            }`}
                        />
                        {formErrors.endDate && (
                          <p className="mt-1 text-sm text-red-500">
                            {formErrors.endDate}
                          </p>
                        )}
                      </div>
                    </div>
                    {campaignType === "outbound" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Label <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.label}
                          onChange={(e) =>
                            setFormData({ ...formData, label: e.target.value })
                          }
                          disabled={submitting}
                          className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.label
                            ? "border-red-500"
                            : "border-gray-300 dark:border-gray-600"
                            }`}
                        >
                          <option value="">Select label</option>
                          {labels.map((label) => (
                            <option key={label.id} value={label.id}>
                              {label.name}
                            </option>
                          ))}
                        </select>
                        {formErrors.label && (
                          <p className="mt-1 text-sm text-red-500">
                            {formErrors.label}
                          </p>
                        )}
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        disabled={submitting}
                        rows={4}
                        className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${formErrors.description
                          ? "border-red-500"
                          : "border-gray-300 dark:border-gray-600"
                          }`}
                        placeholder="Enter description"
                      />
                      {formErrors.description && (
                        <p className="mt-1 text-sm text-red-500">
                          {formErrors.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => setCampaignType(null)}
                      disabled={submitting}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleCreateCampaign}
                      disabled={submitting}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Please wait...
                        </>
                      ) : editingCampaign ? (
                        "Update Campaign"
                      ) : (
                        "Create Campaign"
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
