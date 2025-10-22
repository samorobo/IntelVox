"use client";

import { useState, useEffect } from "react";
import DashboardHeader from "@/components/DashboardHeader";
import { Search, Download, Plus, X, Loader2, Edit, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

interface AIAgent {
  id: string;
  name: string;
  persona: string;
  convos: number;
  retention: string;
  createdOn: string;
  status: "active" | "inactive";
  type: "inbound" | "outbound";
}

interface FormData {
  name: string;
  persona: string;
  type: "inbound" | "outbound";
}

interface FormErrors {
  name?: string;
  persona?: string;
  type?: string;
}

// Mock data for demonstration
const mockAgents: AIAgent[] = [
  {
    id: "1",
    name: "Sales Assistant",
    persona: "Friendly sales representative",
    convos: 1247,
    retention: "87%",
    createdOn: "2024-01-15",
    status: "active",
    type: "inbound",
  },
  {
    id: "2",
    name: "Support Bot",
    persona: "Helpful customer support agent",
    convos: 2893,
    retention: "92%",
    createdOn: "2024-01-10",
    status: "active",
    type: "inbound",
  },
  {
    id: "3",
    name: "Lead Generator",
    persona: "Proactive outreach specialist",
    convos: 856,
    retention: "78%",
    createdOn: "2024-01-20",
    status: "inactive",
    type: "outbound",
  },
  {
    id: "4",
    name: "Feedback Collector",
    persona: "Professional feedback analyst",
    convos: 542,
    retention: "85%",
    createdOn: "2024-01-18",
    status: "active",
    type: "outbound",
  },
  {
    id: "5",
    name: "Appointment Setter",
    persona: "Efficient scheduling assistant",
    convos: 967,
    retention: "91%",
    createdOn: "2024-01-12",
    status: "active",
    type: "outbound",
  },
];

export default function AIAgentPage() {
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<AIAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "inbound" | "outbound">(
    "all"
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<AIAgent | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    persona: "",
    type: "inbound",
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);

  // Load mock data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setAgents(mockAgents);
      setFilteredAgents(mockAgents);
      setLoading(false);
    };

    loadData();
  }, []);

  // Filter agents based on search and tab
  useEffect(() => {
    let filtered = agents;

    // Filter by tab
    if (activeTab !== "all") {
      filtered = filtered.filter((agent) => agent.type === activeTab);
    }

    // Filter by search term
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
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      setAgents((prev) =>
        prev.map((agent) =>
          agent.id === id
            ? {
                ...agent,
                status: agent.status === "active" ? "inactive" : "active",
              }
            : agent
        )
      );

      const agent = agents.find((a) => a.id === id);
      toast.success(
        `Agent ${
          agent?.status === "active" ? "deactivated" : "activated"
        } successfully`
      );
    } catch (err) {
      toast.error("Failed to update agent status");
    } finally {
      setStatusUpdating(null);
    }
  };

  const handleOpenModal = (agent: AIAgent | null = null) => {
    setEditingAgent(agent);
    if (agent) {
      setFormData({
        name: agent.name,
        persona: agent.persona,
        type: agent.type,
      });
    } else {
      setFormData({
        name: "",
        persona: "",
        type: "inbound",
      });
    }
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (!submitting) {
      setIsModalOpen(false);
      setEditingAgent(null);
      setFormData({ name: "", persona: "", type: "inbound" });
      setFormErrors({});
    }
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.name.trim()) errors.name = "Agent name is required";
    if (!formData.persona.trim())
      errors.persona = "Persona description is required";
    if (!formData.type) errors.type = "Agent type is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (editingAgent) {
        // Update existing agent
        setAgents((prev) =>
          prev.map((agent) =>
            agent.id === editingAgent.id
              ? {
                  ...agent,
                  name: formData.name,
                  persona: formData.persona,
                  type: formData.type,
                }
              : agent
          )
        );
        toast.success("Agent updated successfully!");
      } else {
        // Create new agent
        const newAgent: AIAgent = {
          id: Math.random().toString(36).substr(2, 9),
          name: formData.name,
          persona: formData.persona,
          convos: 0,
          retention: "0%",
          createdOn: new Date().toISOString().split("T")[0],
          status: "active",
          type: formData.type,
        };
        setAgents((prev) => [newAgent, ...prev]);
        toast.success("Agent created successfully!");
      }

      handleCloseModal();
    } catch (err) {
      toast.error("Failed to save agent");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this agent?")) return;

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      setAgents((prev) => prev.filter((agent) => agent.id !== id));
      toast.success("Agent deleted successfully");
    } catch (err) {
      toast.error("Failed to delete agent");
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const getTypeBadgeColor = (type: "inbound" | "outbound") => {
    return type === "inbound"
      ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
  };

  const getRetentionColor = (retention: string) => {
    const percentage = parseInt(retention);
    if (percentage >= 90) return "text-green-600 dark:text-green-400";
    if (percentage >= 80) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
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

        {/* Main Content */}
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
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">
                      Agent Name
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">
                      Persona
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">
                      Type
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">
                      Conversations
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">
                      Retention
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">
                      Created On
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">
                      Status
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAgents.map((agent) => (
                    <tr
                      key={agent.id}
                      className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="py-4 px-6 text-sm font-medium text-gray-900 dark:text-white">
                        {agent.name}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
                        {agent.persona}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadgeColor(
                            agent.type
                          )}`}
                        >
                          {agent.type.charAt(0).toUpperCase() +
                            agent.type.slice(1)}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
                        {agent.convos.toLocaleString()}
                      </td>
                      <td className="py-4 px-6 text-sm font-medium">
                        <span className={getRetentionColor(agent.retention)}>
                          {agent.retention}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
                        {new Date(agent.createdOn).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => toggleStatus(agent.id)}
                          disabled={statusUpdating === agent.id}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                            agent.status === "active"
                              ? "bg-green-500"
                              : "bg-gray-300 dark:bg-gray-600"
                          }`}
                        >
                          {statusUpdating === agent.id ? (
                            <Loader2 className="w-3 h-3 animate-spin text-white absolute left-1.5" />
                          ) : (
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                agent.status === "active"
                                  ? "translate-x-6"
                                  : "translate-x-1"
                              }`}
                            />
                          )}
                        </button>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenModal(agent)}
                            className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
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
              {filteredAgents.length === 0 && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  {agents.length === 0
                    ? "No AI agents found. Create your first agent to get started."
                    : "No agents found matching your search."}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm"
            onClick={handleCloseModal}
          ></div>

          <div className="flex min-h-full items-center justify-center p-4">
            <div
              className="relative bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-md animate-fadeIn"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {editingAgent ? "Edit AI Agent" : "Create New Bot"}
                </h3>
                <button
                  onClick={handleCloseModal}
                  disabled={submitting}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="px-6 py-4 space-y-4">
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
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Persona Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.persona}
                    onChange={(e) =>
                      handleInputChange("persona", e.target.value)
                    }
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
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.persona}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Agent Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      handleInputChange(
                        "type",
                        e.target.value as "inbound" | "outbound"
                      )
                    }
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
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.type}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    {formData.type === "inbound"
                      ? "Handles incoming customer queries and support requests"
                      : "Proactively reaches out to potential customers and leads"}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleCloseModal}
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
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
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
