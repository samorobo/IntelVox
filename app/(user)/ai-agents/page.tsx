"use client";

import { useState, useEffect } from "react";
import axiosClient from "@/lib/axiosClient";
import { Eye, MoreVertical } from "lucide-react";
import DashboardHeader from "@/components/DashboardHeader";
import {
  Search,
  Download,
  Plus,
  X,
  Loader2,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";
import AgentDetailsModal from "@/components/AgentDetailsModal";

interface TwilioConfig {
  phoneNumber: string;
  accountSid: string;
  isActive: boolean;
}

interface LLMConfig {
  provider: string;
  modelname: string;
  maxTokens: number | null;
  temperature: number | null;
  isActive: boolean;
}

interface AIAgent {
  id: string;
  name: string;
  persona: string;
  conversations: number;
  retention: number;
  createdOn: string;
  status: "active" | "inactive" | "suspended";
  type: string;
  voice: string;
  knowledgeBase: string;
  tenantId: string;
  tenant: {
    id: string;
    name: string;
    email: string;
  };
  twilioConfig: TwilioConfig | null;
  llmConfig: LLMConfig | null;
}

interface FormData {
  name: string;
  persona: string;
  type: string;
  twilioConfigId: string;
  llmConfigId: string;
  voice: string;
  knowledgeBase: string;
}

interface FormErrors {
  name?: string;
  persona?: string;
  type?: string;
  twilioConfigId?: string;
  llmConfigId?: string;
  voice?: string;
  knowledgeBase?: string;
}

import { getTenantIdOrThrow } from "@/lib/utils";

const VOICE_OPTIONS = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"];

export default function AIAgentPage() {
  const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<AIAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "inbound" | "outbound">(
    "all"
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<AIAgent | null>(null);
  const [formStep, setFormStep] = useState<"basic" | "knowledge">("basic");
  const [formData, setFormData] = useState<FormData>({
    name: "",
    persona: "",
    type: "inbound",
    twilioConfigId: "",
    llmConfigId: "",
    voice: "",
    knowledgeBase: "",
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);

  const [twilioConfigs, setTwilioConfigs] = useState<any[]>([]);
  const [llmConfigs, setLlmConfigs] = useState<any[]>([]);
  const [loadingConfigs, setLoadingConfigs] = useState(false);
  const handleViewDetails = (agent: AIAgent) => {
    setSelectedAgent(agent);
    setDetailsModalOpen(true);
  };
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setLoadingConfigs(true);

        const tenantId = getTenantIdOrThrow();
        const [agentsResponse, twilioResponse, llmResponse] = await Promise.all(
          [
            axiosClient.get(`/agents/${tenantId}`),
            axiosClient.get(`/twilio/${tenantId}`),
            axiosClient.get(`/llm/${tenantId}`),
          ]
        );

        setAgents(agentsResponse.data);
        setFilteredAgents(agentsResponse.data);
        setTwilioConfigs(twilioResponse.data);
        setLlmConfigs(llmResponse.data);
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
        setLoadingConfigs(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    let filtered = agents;

    if (activeTab !== "all") {
      filtered = filtered.filter((agent) => agent.type === activeTab);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (agent) =>
          agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          agent.persona.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredAgents(filtered);
  }, [agents, activeTab, searchTerm]);

  const toggleStatus = async (id: string) => {
    try {
      setStatusUpdating(id);

      const agent = agents.find((a) => a.id === id);
      const newStatus = agent?.status === "active" ? "inactive" : "active";

      await axiosClient.put(`/agent/${id}`, { status: newStatus });

      setAgents((prev) =>
        prev.map((agent) =>
          agent.id === id ? { ...agent, status: newStatus } : agent
        )
      );

      toast.success(
        `Agent ${
          newStatus === "active" ? "activated" : "deactivated"
        } successfully`
      );
    } catch (err) {
      console.error("Error updating agent status:", err);
      toast.error("Failed to update agent status");
    } finally {
      setStatusUpdating(null);
    }
  };

  const handleOpenModal = (agent: AIAgent | null = null) => {
    setEditingAgent(agent);
    setFormStep("basic");
    if (agent) {
      const twilioConfigId =
        twilioConfigs.find(
          (config) => config.phoneNumber === agent.twilioConfig?.phoneNumber
        )?.id || "";

      const llmConfigId =
        llmConfigs.find(
          (config) =>
            config.modelname === agent.llmConfig?.modelname &&
            config.provider === agent.llmConfig?.provider
        )?.id || "";

      setFormData({
        name: agent.name,
        persona: agent.persona,
        type: agent.type,
        twilioConfigId,
        llmConfigId,
        voice: agent.voice,
        knowledgeBase: agent.knowledgeBase,
      });
    } else {
      setFormData({
        name: "",
        persona: "",
        type: "inbound",
        twilioConfigId: "",
        llmConfigId: "",
        voice: "",
        knowledgeBase: "",
      });
    }
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (!submitting) {
      setIsModalOpen(false);
      setEditingAgent(null);
      setFormStep("basic");
      setFormData({
        name: "",
        persona: "",
        type: "inbound",
        twilioConfigId: "",
        llmConfigId: "",
        voice: "",
        knowledgeBase: "",
      });
      setFormErrors({});
    }
  };

  const validateBasicStep = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.name.trim()) errors.name = "Agent name is required";
    if (!formData.persona.trim())
      errors.persona = "Persona description is required";
    if (!formData.type) errors.type = "Agent type is required";
    if (!formData.twilioConfigId)
      errors.twilioConfigId = "Twilio number is required";
    if (!formData.llmConfigId) errors.llmConfigId = "LLM Model is required";
    if (!formData.voice) errors.voice = "Voice is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateKnowledgeStep = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.knowledgeBase.trim()) {
      errors.knowledgeBase = "Knowledge base is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (validateBasicStep()) {
      setFormStep("knowledge");
    }
  };

  const handlePrevStep = () => {
    setFormStep("basic");
  };

  const handleSubmit = async () => {
    if (!validateKnowledgeStep()) return;

    try {
      setSubmitting(true);

      const tenantId = getTenantIdOrThrow();
      const agentPayload = {
        ...formData,
        tenantId: tenantId,
        conversations: 0,
        retention: 0,
      };

      if (editingAgent) {
        const response = await axiosClient.put(
          `/agent/${editingAgent.id}`,
          agentPayload
        );
        setAgents((prev) =>
          prev.map((agent) =>
            agent.id === editingAgent.id ? response.data : agent
          )
        );
        toast.success("Agent updated successfully!");
      } else {
        const response = await axiosClient.post(`/agent`, agentPayload);
        // Refresh agents to get the updated data with configs
        const agentsResponse = await axiosClient.get(
          `/agents/${tenantId}`
        );
        setAgents(agentsResponse.data);
        toast.success("Agent created successfully!");
      }

      handleCloseModal();
    } catch (err) {
      console.error("Error saving agent:", err);
      toast.error("Failed to save agent");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this agent?")) return;

    try {
      await axiosClient.delete(`/agent/${id}`);
      setAgents((prev) => prev.filter((agent) => agent.id !== id));
      toast.success("Agent deleted successfully");
    } catch (err) {
      console.error("Error deleting agent:", err);
      toast.error("Failed to delete agent");
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const getTypeBadgeColor = (type: string) => {
    return type === "inbound"
      ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
  };

  const getRetentionColor = (retention: number) => {
    if (retention >= 90) return "text-green-600 dark:text-green-400";
    if (retention >= 80) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getLlmDisplayText = (agent: AIAgent) => {
    if (agent.llmConfig) {
      return `${agent.llmConfig.modelname} (${agent.llmConfig.provider})`;
    }
    return "Not configured";
  };

  const getTwilioDisplayText = (agent: AIAgent) => {
    return agent.twilioConfig?.phoneNumber || "Not configured";
  };

  const renderFormStep = () => {
    if (formStep === "basic") {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Agent Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              disabled={submitting}
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                formErrors.name
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 dark:border-gray-600"
              }`}
              placeholder="Enter agent name"
            />
            {formErrors.name && (
              <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Persona Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.persona}
              onChange={(e) => handleInputChange("persona", e.target.value)}
              disabled={submitting}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed resize-none ${
                formErrors.persona
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 dark:border-gray-600"
              }`}
              placeholder="Describe the agent's personality and behavior..."
            />
            {formErrors.persona && (
              <p className="mt-1 text-sm text-red-500">{formErrors.persona}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Agent Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleInputChange("type", e.target.value)}
              disabled={submitting}
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                formErrors.type
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 dark:border-gray-600"
              }`}
            >
              <option value="inbound">Inbound Agent</option>
              <option value="outbound">Outbound Agent</option>
            </select>
            {formErrors.type && (
              <p className="mt-1 text-sm text-red-500">{formErrors.type}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {formData.type === "inbound"
                ? "Handles incoming customer queries and support requests"
                : "Proactively reaches out to potential customers and leads"}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Twilio Number <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.twilioConfigId}
              onChange={(e) =>
                handleInputChange("twilioConfigId", e.target.value)
              }
              disabled={submitting || loadingConfigs}
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                formErrors.twilioConfigId
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 dark:border-gray-600"
              }`}
            >
              <option value="">Select Twilio Number</option>
              {twilioConfigs
                .filter((config) => config.isActive)
                .map((config) => (
                  <option key={config.id} value={config.id}>
                    {config.phoneNumber}
                  </option>
                ))}
            </select>
            {formErrors.twilioConfigId && (
              <p className="mt-1 text-sm text-red-500">
                {formErrors.twilioConfigId}
              </p>
            )}
            {loadingConfigs && (
              <p className="mt-1 text-xs text-gray-500">
                Loading Twilio numbers...
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              LLM Model <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.llmConfigId}
              onChange={(e) => handleInputChange("llmConfigId", e.target.value)}
              disabled={submitting || loadingConfigs}
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                formErrors.llmConfigId
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 dark:border-gray-600"
              }`}
            >
              <option value="">Select LLM Model</option>
              {llmConfigs
                .filter((config) => config.isActive)
                .map((config) => (
                  <option key={config.id} value={config.id}>
                    {config.modelname} ({config.provider})
                  </option>
                ))}
            </select>
            {formErrors.llmConfigId && (
              <p className="mt-1 text-sm text-red-500">
                {formErrors.llmConfigId}
              </p>
            )}
            {loadingConfigs && (
              <p className="mt-1 text-xs text-gray-500">
                Loading LLM models...
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Voice <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.voice}
              onChange={(e) => handleInputChange("voice", e.target.value)}
              disabled={submitting}
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                formErrors.voice
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 dark:border-gray-600"
              }`}
            >
              <option value="">Select Voice</option>
              {VOICE_OPTIONS.map((voice) => (
                <option key={voice} value={voice}>
                  {voice.charAt(0).toUpperCase() + voice.slice(1)}
                </option>
              ))}
            </select>
            {formErrors.voice && (
              <p className="mt-1 text-sm text-red-500">{formErrors.voice}</p>
            )}
          </div>
        </div>
      );
    } else {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Knowledge Base <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.knowledgeBase}
              onChange={(e) =>
                handleInputChange("knowledgeBase", e.target.value)
              }
              disabled={submitting}
              rows={8}
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed resize-none ${
                formErrors.knowledgeBase
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 dark:border-gray-600"
              }`}
              placeholder="Enter the agent's knowledge base, training data, or specific instructions..."
            />
            {formErrors.knowledgeBase && (
              <p className="mt-1 text-sm text-red-500">
                {formErrors.knowledgeBase}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Provide detailed information, FAQs, or specific instructions that
              the agent should know.
            </p>
          </div>
        </div>
      );
    }
  };

  return (
    <>
      <DashboardHeader title="AI Agent Management" />

      <div className="p-8">
        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab("all")}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "all"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                All Agents
              </button>
              <button
                onClick={() => setActiveTab("inbound")}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "inbound"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                Inbound Agents
              </button>
              <button
                onClick={() => setActiveTab("outbound")}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "outbound"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                Outbound Agents
              </button>
            </nav>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {activeTab === "all"
                ? "All AI Agents"
                : activeTab === "inbound"
                ? "Inbound Agents"
                : "Outbound Agents"}
            </h2>
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleOpenModal()}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Create New Bot
              </button>

              <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                <Download className="w-4 h-4" />
                Export
              </button>

              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search agents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Loading agents...</span>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                      Agent Name
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400 hidden md:table-cell">
                      Type
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400 hidden lg:table-cell">
                      LLM Model
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400 hidden xl:table-cell">
                      Conversations / Retentions
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAgents.map((agent) => (
                    <tr
                      key={agent.id}
                      className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {agent.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 md:hidden truncate max-w-[120px]">
                            {agent.persona}
                          </div>
                          <div className="flex items-center gap-1 mt-1 md:hidden">
                            <span
                              className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${getTypeBadgeColor(
                                agent.type
                              )}`}
                            >
                              {agent.type.charAt(0).toUpperCase() +
                                agent.type.slice(1)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 hidden md:table-cell">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadgeColor(
                            agent.type
                          )}`}
                        >
                          {agent.type.charAt(0).toUpperCase() +
                            agent.type.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4 hidden lg:table-cell">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {getLlmDisplayText(agent)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                          {agent.voice}
                        </div>
                      </td>
                      <td className="py-3 px-4 hidden xl:table-cell">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {agent.conversations.toLocaleString()} /{" "}
                          <span className={getRetentionColor(agent.retention)}>
                            {agent.retention}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => toggleStatus(agent.id)}
                          disabled={statusUpdating === agent.id}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                            agent.status === "active"
                              ? "bg-green-500"
                              : "bg-gray-300 dark:bg-gray-600"
                          }`}
                        >
                          {statusUpdating === agent.id ? (
                            <Loader2 className="w-2.5 h-2.5 animate-spin text-white absolute left-1" />
                          ) : (
                            <span
                              className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                                agent.status === "active"
                                  ? "translate-x-5"
                                  : "translate-x-1"
                              }`}
                            />
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleViewDetails(agent)}
                            className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenModal(agent)}
                            className="p-1 text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors"
                            title="Edit agent"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(agent.id)}
                            className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                            title="Delete agent"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm"
            onClick={handleCloseModal}
          ></div>

          <div className="flex min-h-full items-center justify-center p-4">
            <div
              className="relative bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl animate-fadeIn"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {editingAgent ? "Edit AI Agent" : "Create New Bot"}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Step {formStep === "basic" ? "1" : "2"} of 2 -{" "}
                    {formStep === "basic" ? "Basic Details" : "Knowledge Base"}
                  </p>
                </div>
                <button
                  onClick={handleCloseModal}
                  disabled={submitting}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="px-6 py-4">{renderFormStep()}</div>

              <div className="flex justify-between items-center mt-6 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <div>
                  {formStep === "knowledge" && (
                    <button
                      onClick={handlePrevStep}
                      disabled={submitting}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Back
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleCloseModal}
                    disabled={submitting}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>

                  {formStep === "basic" ? (
                    <button
                      onClick={handleNextStep}
                      disabled={submitting}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Please wait...
                        </>
                      ) : editingAgent ? (
                        "Save Changes"
                      ) : (
                        "Create Agent"
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <AgentDetailsModal
        agent={selectedAgent}
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
      />
    </>
  );
  
}