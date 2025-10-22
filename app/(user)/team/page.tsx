"use client";

import { useState, useEffect } from "react";
import DashboardHeader from "@/components/DashboardHeader";
import { Search, Download, Plus, X, Loader2, Edit, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "agent_manager" | "lead_manager";
  addedOn: string;
  status: "active" | "inactive";
}

interface FormData {
  name: string;
  email: string;
  role: "agent_manager" | "lead_manager";
}

interface FormErrors {
  name?: string;
  email?: string;
  role?: string;
}

// Mock data for demonstration
const mockTeamMembers: TeamMember[] = [
  {
    id: "1",
    name: "John Smith",
    email: "john.smith@company.com",
    role: "agent_manager",
    addedOn: "2024-01-15",
    status: "active",
  },
  {
    id: "2",
    name: "Sarah Johnson",
    email: "sarah.j@company.com",
    role: "lead_manager",
    addedOn: "2024-01-10",
    status: "active",
  },
  {
    id: "3",
    name: "Mike Chen",
    email: "mike.chen@company.com",
    role: "agent_manager",
    addedOn: "2024-01-20",
    status: "inactive",
  },
  {
    id: "4",
    name: "Emily Davis",
    email: "emily.davis@company.com",
    role: "lead_manager",
    addedOn: "2024-01-18",
    status: "active",
  },
  {
    id: "5",
    name: "Alex Rodriguez",
    email: "alex.r@company.com",
    role: "agent_manager",
    addedOn: "2024-01-12",
    status: "active",
  },
];

export default function TeamManagementPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    role: "agent_manager",
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
      setTeamMembers(mockTeamMembers);
      setFilteredMembers(mockTeamMembers);
      setLoading(false);
    };

    loadData();
  }, []);

  // Filter members based on search
  useEffect(() => {
    let filtered = teamMembers;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (member) =>
          member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredMembers(filtered);
  }, [teamMembers, searchTerm]);

  const toggleStatus = async (id: string) => {
    try {
      setStatusUpdating(id);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      setTeamMembers((prev) =>
        prev.map((member) =>
          member.id === id
            ? {
                ...member,
                status: member.status === "active" ? "inactive" : "active",
              }
            : member
        )
      );

      const member = teamMembers.find((m) => m.id === id);
      toast.success(
        `Team member ${
          member?.status === "active" ? "deactivated" : "activated"
        } successfully`
      );
    } catch (err) {
      toast.error("Failed to update team member status");
    } finally {
      setStatusUpdating(null);
    }
  };

  const handleOpenModal = (member: TeamMember | null = null) => {
    setEditingMember(member);
    if (member) {
      setFormData({
        name: member.name,
        email: member.email,
        role: member.role,
      });
    } else {
      setFormData({
        name: "",
        email: "",
        role: "agent_manager",
      });
    }
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (!submitting) {
      setIsModalOpen(false);
      setEditingMember(null);
      setFormData({ name: "", email: "", role: "agent_manager" });
      setFormErrors({});
    }
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }
    if (!formData.role) errors.role = "Role is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (editingMember) {
        // Update existing member
        setTeamMembers((prev) =>
          prev.map((member) =>
            member.id === editingMember.id
              ? {
                  ...member,
                  name: formData.name,
                  email: formData.email,
                  role: formData.role,
                }
              : member
          )
        );
        toast.success("Team member updated successfully!");
      } else {
        // Create new member
        const newMember: TeamMember = {
          id: Math.random().toString(36).substr(2, 9),
          name: formData.name,
          email: formData.email,
          role: formData.role,
          addedOn: new Date().toISOString().split("T")[0],
          status: "active",
        };
        setTeamMembers((prev) => [newMember, ...prev]);
        toast.success("Team member added successfully!");
      }

      handleCloseModal();
    } catch (err) {
      toast.error("Failed to save team member");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this team member?")) return;

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      setTeamMembers((prev) => prev.filter((member) => member.id !== id));
      toast.success("Team member deleted successfully");
    } catch (err) {
      toast.error("Failed to delete team member");
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const getRoleBadgeColor = (role: "agent_manager" | "lead_manager") => {
    return role === "agent_manager"
      ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
  };

  const getRoleDisplayName = (role: "agent_manager" | "lead_manager") => {
    return role === "agent_manager" ? "Agent Manager" : "Lead Manager";
  };

  return (
    <>
      <DashboardHeader title="Team & Roles Management" />

      <div className="p-8">
        {/* Main Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Team Members
            </h2>
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleOpenModal()}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Add Member
              </button>

              <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                <Download className="w-4 h-4" />
                Export
              </button>

              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search team members..."
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
                <span>Loading team members...</span>
              </div>
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
                      Role
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">
                      Added On
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
                  {filteredMembers.map((member) => (
                    <tr
                      key={member.id}
                      className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="py-4 px-6 text-sm font-medium text-gray-900 dark:text-white">
                        {member.name}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
                        {member.email}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(
                            member.role
                          )}`}
                        >
                          {getRoleDisplayName(member.role)}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
                        {new Date(member.addedOn).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => toggleStatus(member.id)}
                          disabled={statusUpdating === member.id}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                            member.status === "active"
                              ? "bg-green-500"
                              : "bg-gray-300 dark:bg-gray-600"
                          }`}
                        >
                          {statusUpdating === member.id ? (
                            <Loader2 className="w-3 h-3 animate-spin text-white absolute left-1.5" />
                          ) : (
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                member.status === "active"
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
                            onClick={() => handleOpenModal(member)}
                            className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            title="Edit team member"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(member.id)}
                            className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                            title="Delete team member"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredMembers.length === 0 && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  {teamMembers.length === 0
                    ? "No team members found. Add your first team member to get started."
                    : "No team members found matching your search."}
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
                  {editingMember ? "Edit Team Member" : "Add Team Member"}
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
                    Full Name <span className="text-red-500">*</span>
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
                    placeholder="Enter full name"
                  />
                  {formErrors.name && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    disabled={submitting}
                    className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
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
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      handleInputChange(
                        "role",
                        e.target.value as "agent_manager" | "lead_manager"
                      )
                    }
                    disabled={submitting}
                    className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                      formErrors.role
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    <option value="agent_manager">Agent Manager</option>
                    <option value="lead_manager">Lead Manager</option>
                  </select>
                  {formErrors.role && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.role}
                    </p>
                  )}
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-gray-500">
                      <strong>Agent Manager:</strong> Manages AI agents,
                      monitors performance, and handles configurations
                    </p>
                    <p className="text-xs text-gray-500">
                      <strong>Lead Manager:</strong> Manages customer leads,
                      oversees outreach campaigns, and tracks conversions
                    </p>
                  </div>
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
                  ) : editingMember ? (
                    "Save Changes"
                  ) : (
                    "Add Member"
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
