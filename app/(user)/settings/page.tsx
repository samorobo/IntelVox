"use client";

import { useState, useEffect } from "react";
import { Camera, Edit, Trash2, Plus, X, Eye, EyeOff, Copy } from "lucide-react";
import DashboardHeader from "@/components/DashboardHeader";
import axiosClient from "@/lib/axiosClient";
import { getTenantId, getTenantIdOrThrow } from "@/lib/utils";
interface LLMConfig {
  id: string;
  provider: string;
  apiKey: string;
  modelname: string;
  maxTokens: number | null;
  temperature: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TwilioConfig {
  id: string;
  accountSid: string;
  authToken: string;
  phoneNumber: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Notification {
  id: string;
  message: string;
  type: "success" | "error" | "info";
  timestamp: number;
}

interface WebhookConfig {
  tenantId: string;
  webhookBaseUrl: string;
  webhooks: {
    main_webhook: {
      url: string;
      description: string;
      note: string;
    };
  };
  setup_instructions: {
    inbound_calls: {
      primary_webhook: string;
      instructions: string[];
    };
  };
}


export default function UserSettingsPage() {
  const [user, setUser] = useState({
    name: "",
    email: "",
    avatarUrl: "",
  });

  const [basicDetails, setBasicDetails] = useState({
    name: "",
    email: "",
  });

  const [handConfig, setHandConfig] = useState({
    handOffNumber: "",
    handOffStartTime: "",
    handOffEndTime: "",
    isRecordingAllowed: false,
  });

  const [llmConfigs, setLlmConfigs] = useState<LLMConfig[]>([]);
  const [twilioConfigs, setTwilioConfigs] = useState<TwilioConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [llmLoading, setLlmLoading] = useState(false);
  const [twilioLoading, setTwilioLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<"llm" | "twilio">("twilio");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showLLMModal, setShowLLMModal] = useState(false);
  const [showTwilioModal, setShowTwilioModal] = useState(false);
  const [editingLLM, setEditingLLM] = useState<LLMConfig | null>(null);
  const [editingTwilio, setEditingTwilio] = useState<TwilioConfig | null>(null);
  const [savingLLM, setSavingLLM] = useState(false);
  const [savingTwilio, setSavingTwilio] = useState(false);

  const [visibleApiKeys, setVisibleApiKeys] = useState<Set<string>>(new Set());
  const [visibleAuthTokens, setVisibleAuthTokens] = useState<Set<string>>(
    new Set()
  );
  const [visibleAccountSids, setVisibleAccountSids] = useState<Set<string>>(
    new Set()
  );



const [webhookConfig, setWebhookConfig] = useState<WebhookConfig | null>(null);
const [webhookLoading, setWebhookLoading] = useState(false);
const [webhookError, setWebhookError] = useState<string | null>(null);
const [copiedWebhook, setCopiedWebhook] = useState(false);


const [savingBasicDetails, setSavingBasicDetails] = useState(false);
const [savingHandConfig, setSavingHandConfig] = useState(false);

  const [llmForm, setLlmForm] = useState<
    Omit<LLMConfig, "id" | "isActive" | "createdAt" | "updatedAt">
  >({
    provider: "openai",
    apiKey: "",
    modelname: "",
    maxTokens: null,
    temperature: null,
  });

  const [twilioForm, setTwilioForm] = useState<
    Omit<TwilioConfig, "id" | "isActive" | "createdAt" | "updatedAt">
  >({
    accountSid: "",
    authToken: "",
    phoneNumber: "",
  });

  useEffect(() => {
    const fetchTenantProfile = async () => {
      try {
        const response = await axiosClient.get("/otp/verify");
        const tenantData = response.data?.data?.tenant;
        if (tenantData) {
          const normalizedName = tenantData.name?.trim() || "";
          setUser((prev) => ({
            ...prev,
            name: normalizedName,
            email: tenantData.email || "",
          }));
          setBasicDetails((prev) => ({
            ...prev,
            name: normalizedName || prev.name,
            email: tenantData.email || prev.email,
          }));
        }
      } catch (error) {
        console.error("Error fetching tenant profile:", error);
      }
    };

    fetchTenantProfile();
    fetchTenantDetails();
    fetchHandOffConfig();
    fetchLLMConfigs();
    fetchTwilioConfigs();
    fetchWebhookConfig();
  }, []);

  const fetchLLMConfigs = async () => {
    try {
      setLlmLoading(true);
      const tenantId = getTenantIdOrThrow();
      const response = await axiosClient.get(`/llm/${tenantId}`);
      setLlmConfigs(response.data);
    } catch (error) {
      console.error("Error fetching LLM configs:", error);
      addNotification("Failed to fetch LLM configurations", "error");
    } finally {
      setLlmLoading(false);
      setLoading(false);
    }
  };

  const fetchTwilioConfigs = async () => {
    try {
      setTwilioLoading(true);
      const tenantId = getTenantIdOrThrow();
      const response = await axiosClient.get(`/twilio/${tenantId}`);
      setTwilioConfigs(response.data);
    } catch (error) {
      console.error("Error fetching Twilio configs:", error);
      addNotification("Failed to fetch Twilio configurations", "error");
    } finally {
      setTwilioLoading(false);
      setLoading(false);
    }
  };

  const normalizeTimeValue = (value?: string | null) => {
    if (!value) return "";
    if (value.length >= 5) {
      return value.slice(0, 5);
    }
    return value;
  };

  const fetchWebhookConfig = async () => {
    try {
      setWebhookLoading(true);
      setWebhookError(null);
      const tenantId = getTenantIdOrThrow();
      const response = await axiosClient.get(`/call/${tenantId}/webhook-config`);

      console.log("[Webhook] tenantId used:", tenantId);
      console.log("[Webhook] raw response:", response.data);

      // Support both plain object and { data: object } wrapper, plus JSON strings
      let payload: any = response.data?.data ?? response.data;

      if (typeof payload === "string") {
        try {
          payload = JSON.parse(payload);
        } catch (e) {
          console.error("[Webhook] Failed to parse JSON string payload:", e);
        }
      }

      if (payload) {
        setWebhookConfig(payload as WebhookConfig);
      } else {
        console.warn("[Webhook] Empty webhook payload received:", payload);
        setWebhookConfig(null);
      }
    } catch (error) {
      console.error("Error fetching webhook config:", error);
      setWebhookError(
        (error as any)?.response?.data?.message ||
          (error as any)?.response?.data?.error ||
          "Failed to fetch webhook configuration"
      );
      addNotification("Failed to fetch webhook configuration", "error");
    } finally {
      setWebhookLoading(false);
    }
  };

  const fetchTenantDetails = async () => {
    try {
      const tenantId = getTenantIdOrThrow();
      const response = await axiosClient.get(`/tenant/details-config/${tenantId}`);
      const data = response.data?.data || response.data;
      if (data) {
        console.log("[TenantDetails] raw response:", data);

        setBasicDetails({
          name: data.name || "",
          email: data.email || "",
        });
        setUser((prev) => ({
          ...prev,
          name: data.name || prev.name,
          email: data.email || prev.email,
        }));
        if (typeof window !== "undefined") {
          if (data.name) {
            localStorage.setItem("tenantName", data.name.trim());
          }
          if (data.email) {
            localStorage.setItem("tenantEmail", data.email);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching tenant details:", error);
    }
  };

  const fetchHandOffConfig = async () => {
    try {
      const tenantId = getTenantIdOrThrow();
      const response = await axiosClient.get(`/tenant/handoff-config/${tenantId}`);
      const data = response.data?.data || response.data;
      if (data) {
        console.log("[HandOffConfig] raw response:", data);

        const hasHandOffNumberKey =
          "handOffNumber" in data ||
          "handoffNumber" in data ||
          "handoff_number" in data;
        const hasHandOffStartKey =
          "handOffStartTime" in data ||
          "handoffStartTime" in data ||
          "handoff_start_time" in data;
        const hasHandOffEndKey =
          "handOffEndTime" in data ||
          "handoffEndTime" in data ||
          "handoff_end_time" in data;
        const hasRecordingKey =
          "isRecordingAllowed" in data || "is_recording_allowed" in data;

        const handOffNumberValue =
          data.handOffNumber ?? data.handoffNumber ?? data.handoff_number ?? "";
        const handOffStartTimeValue =
          data.handOffStartTime ??
          data.handoffStartTime ??
          data.handoff_start_time ??
          "";
        const handOffEndTimeValue =
          data.handOffEndTime ??
          data.handoffEndTime ??
          data.handoff_end_time ??
          "";
        const isRecordingAllowedValue =
          data.isRecordingAllowed ?? data.is_recording_allowed ?? false;

        setHandConfig((prev) => ({
          handOffNumber: hasHandOffNumberKey
            ? handOffNumberValue || ""
            : prev.handOffNumber,
          handOffStartTime: hasHandOffStartKey
            ? normalizeTimeValue(handOffStartTimeValue)
            : prev.handOffStartTime,
          handOffEndTime: hasHandOffEndKey
            ? normalizeTimeValue(handOffEndTimeValue)
            : prev.handOffEndTime,
          isRecordingAllowed: hasRecordingKey
            ? Boolean(isRecordingAllowedValue)
            : prev.isRecordingAllowed,
        }));
      }
    } catch (error) {
      console.error("Error fetching handoff config:", error);
    }
  };

  const addNotification = (
    message: string,
    type: "success" | "error" | "info"
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: Notification = {
      id,
      message,
      type,
      timestamp: Date.now(),
    };

    setNotifications((prev) => [newNotification, ...prev]);

    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  };

  const handleBasicDetailsChange = (
    field: keyof typeof basicDetails,
    value: string
  ) => {
    setBasicDetails((prev) => ({ ...prev, [field]: value }));
  };

  const handleHandConfigChange = (
    field: keyof typeof handConfig,
    value: string | boolean
  ) => {
    setHandConfig((prev) => ({ ...prev, [field]: value }));
  };

  const buildDetailsPayload = () => ({
    name: basicDetails.name.trim(),
    email: basicDetails.email.trim(),
  });

  const buildHandOffPayload = () => ({
    handOffNumber: handConfig.handOffNumber.trim(),
    handoffNumber: handConfig.handOffNumber.trim(),
    handoff_number: handConfig.handOffNumber.trim(),

    handOffStartTime: handConfig.handOffStartTime,
    handoffStartTime: handConfig.handOffStartTime,
    handoff_start_time: handConfig.handOffStartTime,

    handOffEndTime: handConfig.handOffEndTime,
    handoffEndTime: handConfig.handOffEndTime,
    handoff_end_time: handConfig.handOffEndTime,

    isRecordingAllowed: handConfig.isRecordingAllowed,
    is_recording_allowed: handConfig.isRecordingAllowed,
  });

  // const handleSaveBasicDetails = async () => {
  //   if (!basicDetails.name.trim() || !basicDetails.email.trim()) {
  //     addNotification("Please provide both company name and email.", "error");
  //     return;
  //   }

  //   try {
  //     const tenantId = getTenantIdOrThrow();
  //     await axiosClient.put(
  //       `/tenant/details-config/${tenantId}`,
  //       buildDetailsPayload()
  //     );
  //     setUser((prev) => ({
  //       ...prev,
  //       name: basicDetails.name,
  //       email: basicDetails.email,
  //     }));
  //     addNotification("Basic details updated successfully", "success");
  //   } catch (error: any) {
  //     console.error("Error updating basic details:", error);
  //     const message =
  //       error.response?.data?.message || "Failed to update basic details";
  //     addNotification(message, "error");
  //   }
  // };


 const handleSaveBasicDetails = async () => {
  if (!basicDetails.name.trim() || !basicDetails.email.trim()) {
    addNotification("Please provide both company name and email.", "error");
    return;
  }

  try {
    setSavingBasicDetails(true); // ✅ ADD THIS
    const tenantId = getTenantIdOrThrow();
    await axiosClient.put(
      `/tenant/details-config/${tenantId}`,
      buildDetailsPayload()
    );
    setUser((prev) => ({
      ...prev,
      name: basicDetails.name,
      email: basicDetails.email,
    }));
    addNotification("Basic details updated successfully", "success");
    await fetchTenantDetails();
  } catch (error: any) {
    console.error("Error updating basic details:", error);
    const message =
      error.response?.data?.message || "Failed to update basic details";
    addNotification(message, "error");
  } finally {
    setSavingBasicDetails(false); // ✅ ADD THIS
  }
};

  // const handleSaveHandConfig = async () => {
  //   if (
  //     !handConfig.handOffNumber.trim() ||
  //     !handConfig.handOffStartTime ||
  //     !handConfig.handOffEndTime
  //   ) {
  //     addNotification(
  //       "Please provide handoff number and both start/end times.",
  //       "error"
  //     );
  //     return;
  //   }

  //   try {
  //     const tenantId = getTenantIdOrThrow();
  //     await axiosClient.put(
  //       `/tenant/details-config/${tenantId}`,
  //       buildDetailsPayload()
  //     );
  //     addNotification("Hand configuration updated successfully", "success");
  //   } catch (error: any) {
  //     console.error("Error updating handoff configuration:", error);
  //     const message =
  //       error.response?.data?.message ||
  //       "Failed to update handoff configuration";
  //     addNotification(message, "error");
  //   }
  // };


  const handleSaveHandConfig = async () => {
    if (
      !handConfig.handOffNumber.trim() ||
      !handConfig.handOffStartTime ||
      !handConfig.handOffEndTime
    ) {
      addNotification(
        "Please provide handoff number and both start/end times.",
        "error"
      );
      return;
    }

    try {
      setSavingHandConfig(true);
      const tenantId = getTenantIdOrThrow();
      await axiosClient.put(
        `/tenant/handoff-config/${tenantId}`,
        buildHandOffPayload()
      );
      addNotification("Hand configuration updated successfully", "success");
      await fetchHandOffConfig();
    } catch (error: any) {
      console.error("Error updating handoff configuration:", error);
      const message =
        error.response?.data?.message ||
        "Failed to update handoff configuration";
      addNotification(message, "error");
    } finally {
      setSavingHandConfig(false);
    }
  };

  const handleAvatarChange = () => {
    addNotification("Avatar upload feature coming soon", "info");
  };

  const toggleApiKeyVisibility = (id: string) => {
    setVisibleApiKeys((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleAuthTokenVisibility = (id: string) => {
    setVisibleAuthTokens((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleAccountSidVisibility = (id: string) => {
    setVisibleAccountSids((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleAddLLM = () => {
    setEditingLLM(null);
    setLlmForm({
      provider: "openai",
      apiKey: "",
      modelname: "",
      maxTokens: null,
      temperature: null,
    });
    setShowLLMModal(true);
  };

  const handleEditLLM = (config: LLMConfig) => {
    setEditingLLM(config);
    setLlmForm({
      provider: config.provider,
      apiKey: config.apiKey,
      modelname: config.modelname,
      maxTokens: config.maxTokens,
      temperature: config.temperature,
    });
    setShowLLMModal(true);
  };

  const handleDeleteLLM = async (id: string) => {
    if (!confirm("Are you sure you want to delete this LLM configuration?")) {
      return;
    }

    try {
      const tenantId = getTenantIdOrThrow();
      await axiosClient.delete(`/llm/${tenantId}/${id}`);
      setLlmConfigs((prev) => prev.filter((config) => config.id !== id));
      addNotification("LLM configuration deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting LLM config:", error);
      addNotification("Failed to delete LLM configuration", "error");
    }
  };

  const handleSaveLLM = async () => {
    if (!llmForm.provider || !llmForm.apiKey || !llmForm.modelname) {
      addNotification("Please fill in all required fields", "error");
      return;
    }

    try {
      setSavingLLM(true);
      const tenantId = getTenantIdOrThrow();
      if (editingLLM) {
        const response = await axiosClient.put(
          `/llm/${tenantId}/${editingLLM.id}`,
          llmForm
        );
        setLlmConfigs((prev) =>
          prev.map((config) =>
            config.id === editingLLM.id ? response.data : config
          )
        );
        addNotification("LLM configuration updated successfully", "success");
      } else {
        const response = await axiosClient.post(
          `/llm/${tenantId}`,
          llmForm
        );
        setLlmConfigs((prev) => [...prev, response.data]);
        addNotification("LLM configuration added successfully", "success");
      }

      setShowLLMModal(false);
      setEditingLLM(null);
    } catch (error: any) {
      console.error("Error saving LLM config:", error);
      const errorMessage =
        error.response?.data?.error || "Failed to save LLM configuration";
      addNotification(errorMessage, "error");
    } finally {
      setSavingLLM(false);
    }
  };

  const handleAddTwilio = () => {
    setEditingTwilio(null);
    setTwilioForm({
      accountSid: "",
      authToken: "",
      phoneNumber: "",
    });
    setShowTwilioModal(true);
  };

  const handleEditTwilio = (config: TwilioConfig) => {
    setEditingTwilio(config);
    setTwilioForm({
      accountSid: config.accountSid,
      authToken: config.authToken,
      phoneNumber: config.phoneNumber,
    });
    setShowTwilioModal(true);
  };

  const handleDeleteTwilio = async (id: string) => {
    if (
      !confirm("Are you sure you want to delete this Twilio configuration?")
    ) {
      return;
    }

    try {
      const tenantId = getTenantIdOrThrow();
      await axiosClient.delete(`/twilio/${tenantId}/${id}`);
      setTwilioConfigs((prev) => prev.filter((config) => config.id !== id));
      addNotification("Twilio configuration deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting Twilio config:", error);
      addNotification("Failed to delete Twilio configuration", "error");
    }
  };

  const handleSaveTwilio = async () => {
    if (
      !twilioForm.accountSid ||
      !twilioForm.authToken ||
      !twilioForm.phoneNumber
    ) {
      addNotification("Please fill in all required fields", "error");
      return;
    }

    try {
      setSavingTwilio(true);
      const tenantId = getTenantIdOrThrow();
      if (editingTwilio) {
        const response = await axiosClient.put(
          `/twilio/${tenantId}/${editingTwilio.id}`,
          twilioForm
        );
        setTwilioConfigs((prev) =>
          prev.map((config) =>
            config.id === editingTwilio.id ? response.data : config
          )
        );
        addNotification("Twilio configuration updated successfully", "success");
      } else {
        const response = await axiosClient.post(
          `/twilio/${tenantId}`,
          twilioForm
        );
        setTwilioConfigs((prev) => [...prev, response.data]);
        addNotification("Twilio configuration added successfully", "success");
      }

      setShowTwilioModal(false);
      setEditingTwilio(null);
    } catch (error: any) {
      console.error("Error saving Twilio config:", error);
      const errorMessage =
        error.response?.data?.error || "Failed to save Twilio configuration";
      addNotification(errorMessage, "error");
    } finally {
      setSavingTwilio(false);
    }
  };

  const maskString = (str: string) => {
    if (str.length <= 8) return "***************";
    return str.substring(0, 4) + "***************";
  };

  const RequiredAsterisk = () => <span className="text-red-500 ml-1">*</span>;

  const handleCopyWebhook = async (url: string) => {
  try {
    await navigator.clipboard.writeText(url);
    setCopiedWebhook(true);
    addNotification("Webhook URL copied to clipboard!", "success");
    setTimeout(() => setCopiedWebhook(false), 2000);
  } catch (error) {
    addNotification("Failed to copy webhook URL", "error");
  }
};

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardHeader title="Settings Page" />

      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`flex items-start gap-3 p-4 rounded-lg shadow-lg border backdrop-blur-sm transform transition-all duration-300 animate-in slide-in-from-right-full ${
              notification.type === "success"
                ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300"
                : notification.type === "error"
                ? "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300"
                : "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300"
            }`}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{notification.message}</p>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="flex-shrink-0 p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-6">
          <div className="flex flex-col items-center">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </div>
              {/* <button
                onClick={handleAvatarChange}
                className="absolute bottom-0 right-0 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-colors"
              >
                <Camera className="w-4 h-4" />
              </button> */}
            </div>
            <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
              {user.name}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Basic Details
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Company Name
              </label>
              <input
                type="text"
                value={basicDetails.name}
                onChange={(e) =>
                  handleBasicDetailsChange("name", e.target.value)
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={basicDetails.email}
                onChange={(e) =>
                  handleBasicDetailsChange("email", e.target.value)
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
  onClick={handleSaveBasicDetails}
  disabled={savingBasicDetails}
  className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
>
  {savingBasicDetails ? (
    <>
      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      Saving...
    </>
  ) : (
    "Save Changes"
  )}
</button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Human Handoff Configuration
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Handoff Number
              </label>
              <input
                type="text"
                placeholder="e.g +911234567890"
                value={handConfig.handOffNumber}
                onChange={(e) =>
                  handleHandConfigChange("handOffNumber", e.target.value)
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Handoff Start Time
              </label>
              <input
                type="time"
                value={handConfig.handOffStartTime}
                onChange={(e) =>
                  handleHandConfigChange("handOffStartTime", e.target.value)
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Language
              </label>
              <input
                type="text"
                value="English"
                disabled
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Handoff End Time
              </label>
              <input
                type="time"
                value={handConfig.handOffEndTime}
                onChange={(e) =>
                  handleHandConfigChange("handOffEndTime", e.target.value)
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Allow recording and transcription
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Enable this to record calls and generate transcriptions.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                handleHandConfigChange(
                  "isRecordingAllowed",
                  !handConfig.isRecordingAllowed
                )
              }
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900 ${
                handConfig.isRecordingAllowed
                  ? "bg-blue-600"
                  : "bg-gray-300 dark:bg-gray-600"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
                  handConfig.isRecordingAllowed ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </button>
          </div>
          <div className="flex justify-end">
            <button
  onClick={handleSaveHandConfig}
  disabled={savingHandConfig}
  className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
>
  {savingHandConfig ? (
    <>
      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      Saving...
    </>
  ) : (
    "Save Changes"
  )}
</button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Connect Your Account
          </h3>

          <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700">
            {/** LLM tab hidden for now but kept for future use **/}
            {/**
            <button
              onClick={() => setActiveTab("llm")}
              className={`pb-3 px-2 font-medium transition-colors ${
                activeTab === "llm"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              LLM
            </button>
            **/}
            <button
              onClick={() => setActiveTab("twilio")}
              className={`pb-3 px-2 font-medium transition-colors ${
                activeTab === "twilio"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Twilio
            </button>
          </div>

          {/** LLM tab content hidden for now but preserved for future use **/}
          {/**
          {activeTab === "llm" && (
            <div>
              <div className="flex justify-end mb-4">
                <button
                  onClick={handleAddLLM}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add LLM
                </button>
              </div>

              <div className="overflow-x-auto">
                {llmLoading ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    Loading LLM configurations...
                  </div>
                ) : (
                  <>
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                            Provider
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                            API Key
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                            Model Name
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                            Max Tokens
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                            Temperature
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {llmConfigs.map((config) => (
                          <tr
                            key={config.id}
                            className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            <td className="py-3 px-4 text-sm text-gray-900 dark:text-white capitalize">
                              {config.provider}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400 font-mono">
                              <div className="flex items-center gap-2">
                                {visibleApiKeys.has(config.id)
                                  ? config.apiKey
                                  : maskString(config.apiKey)}
                                <button
                                  onClick={() =>
                                    toggleApiKeyVisibility(config.id)
                                  }
                                  className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded transition-colors"
                                >
                                  {visibleApiKeys.has(config.id) ? (
                                    <EyeOff className="w-3 h-3" />
                                  ) : (
                                    <Eye className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                              {config.modelname}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                              {config.maxTokens || "N/A"}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                              {config.temperature || "N/A"}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditLLM(config)}
                                  className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteLLM(config.id)}
                                  className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {llmConfigs.length === 0 && (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        No LLM configurations found. Add one to get started.
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
          **/}

          {activeTab === "twilio" && (
            <div>
              <div className="flex justify-end mb-4">
                <button
                  onClick={handleAddTwilio}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Twilio
                </button>
              </div>

              <div className="overflow-x-auto">
                {twilioLoading ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    Loading Twilio configurations...
                  </div>
                ) : (
                  <>
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                            Account SID
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                            Auth Token
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                            Phone Number
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {twilioConfigs.map((config) => (
                          <tr
                            key={config.id}
                            className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400 font-mono">
                              <div className="flex items-center gap-2">
                                {visibleAccountSids.has(config.id)
                                  ? config.accountSid
                                  : maskString(config.accountSid)}
                                <button
                                  onClick={() =>
                                    toggleAccountSidVisibility(config.id)
                                  }
                                  className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded transition-colors"
                                >
                                  {visibleAccountSids.has(config.id) ? (
                                    <EyeOff className="w-3 h-3" />
                                  ) : (
                                    <Eye className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400 font-mono">
                              <div className="flex items-center gap-2">
                                {visibleAuthTokens.has(config.id)
                                  ? config.authToken
                                  : maskString(config.authToken)}
                                <button
                                  onClick={() =>
                                    toggleAuthTokenVisibility(config.id)
                                  }
                                  className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded transition-colors"
                                >
                                  {visibleAuthTokens.has(config.id) ? (
                                    <EyeOff className="w-3 h-3" />
                                  ) : (
                                    <Eye className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                              {config.phoneNumber}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditTwilio(config)}
                                  className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteTwilio(config.id)}
                                  className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {twilioConfigs.length === 0 && (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        No Twilio configurations found. Add one to get started.
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Webhook Configuration Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Webhook Configuration
          </h3>

          {webhookLoading ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Loading webhook configuration...
            </p>
          ) : webhookError ? (
            <p className="text-sm text-red-500">
              {webhookError}
            </p>
          ) : !webhookConfig ? (
            <p className="text-sm text-red-500">
              Webhook configuration not available. Please ensure your account is properly set up.
            </p>
          ) : (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  Primary webhook URL
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  Unified webhook for both inbound and outbound calls.
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs md:text-sm break-all rounded bg-gray-100 dark:bg-gray-900 px-3 py-2 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
                    {webhookConfig?.webhooks?.main_webhook?.url ?? ""}
                  </code>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopyWebhook(
                        webhookConfig?.setup_instructions?.inbound_calls
                          ?.primary_webhook ?? ""
                      )
                    }
                    className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                  >
                    <Copy className="w-4 h-4" />
                    {copiedWebhook ? "Copied" : "Copy"}
                  </button>
                </div>
                {webhookConfig?.webhooks?.main_webhook?.note && (
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    {webhookConfig.webhooks.main_webhook.note}
                  </p>
                )}
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Inbound call setup instructions
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  Follow these steps in your Twilio console to configure inbound calls:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
                  {webhookConfig?.setup_instructions?.inbound_calls?.instructions?.map(
                    (line, idx) => <li key={idx}>{line}</li>
                  )}
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>


      

      {showLLMModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingLLM
                  ? "Edit LLM Configuration"
                  : "Add LLM Configuration"}
              </h3>
              <button
                onClick={() => setShowLLMModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Provider <RequiredAsterisk />
                  </label>
                  <select
                    value={llmForm.provider}
                    onChange={(e) =>
                      setLlmForm({ ...llmForm, provider: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="openai">OpenAI</option>
                    <option value="anthropic">Anthropic</option>
                    <option value="openrouter">OpenRouter</option>
                    <option value="azure">Azure</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Model Name <RequiredAsterisk />
                  </label>
                  <input
                    type="text"
                    value={llmForm.modelname}
                    onChange={(e) =>
                      setLlmForm({ ...llmForm, modelname: e.target.value })
                    }
                    placeholder="e.g., gpt-4, claude-3-opus"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    API Key <RequiredAsterisk />
                  </label>
                  <input
                    type="text"
                    value={llmForm.apiKey}
                    onChange={(e) =>
                      setLlmForm({ ...llmForm, apiKey: e.target.value })
                    }
                    placeholder="Enter your API key"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Max Tokens
                  </label>
                  <input
                    type="number"
                    value={llmForm.maxTokens === null ? "" : llmForm.maxTokens}
                    onChange={(e) =>
                      setLlmForm({
                        ...llmForm,
                        maxTokens: e.target.value === "" ? null : parseInt(e.target.value)
                      })
                    }
                    placeholder="e.g., 2000"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Temperature (0.0 - 1.0)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    value={llmForm.temperature === null ? "" : llmForm.temperature}
                    onChange={(e) => {
                      const value = e.target.value;
                      setLlmForm({
                        ...llmForm,
                        temperature: value === "" ? null : parseFloat(value)
                      });
                    }}
                    placeholder="e.g., 0.7"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowLLMModal(false)}
                  disabled={savingLLM}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveLLM}
                  disabled={savingLLM}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {savingLLM ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Please Wait...
                    </>
                  ) : (
                    <>{editingLLM ? "Update" : "Add"}</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showTwilioModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingTwilio
                  ? "Edit Twilio Configuration"
                  : "Add Twilio Configuration"}
              </h3>
              <button
                onClick={() => setShowTwilioModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Account SID <RequiredAsterisk />
                  </label>
                  <input
                    type="text"
                    value={twilioForm.accountSid}
                    onChange={(e) =>
                      setTwilioForm({
                        ...twilioForm,
                        accountSid: e.target.value,
                      })
                    }
                    placeholder="AC..."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Auth Token <RequiredAsterisk />
                  </label>
                  <input
                    type="text"
                    value={twilioForm.authToken}
                    onChange={(e) =>
                      setTwilioForm({
                        ...twilioForm,
                        authToken: e.target.value,
                      })
                    }
                    placeholder="Enter your auth token"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number <RequiredAsterisk />
                  </label>
                  <input
                    type="tel"
                    value={twilioForm.phoneNumber}
                    onChange={(e) =>
                      setTwilioForm({
                        ...twilioForm,
                        phoneNumber: e.target.value,
                      })
                    }
                    placeholder="+1234567890"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowTwilioModal(false)}
                  disabled={savingTwilio}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveTwilio}
                  disabled={savingTwilio}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {savingTwilio ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Please Wait...
                    </>
                  ) : (
                    <>{editingTwilio ? "Update" : "Add"}</>
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
