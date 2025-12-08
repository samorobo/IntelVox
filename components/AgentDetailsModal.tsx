import {
  X,
  Phone,
  Cpu,
  User,
  Calendar,
  BarChart3,
  MessageSquare,
  Volume2,
  Database,
  Shield,
} from "lucide-react";
import { useEffect, useState } from "react";
import axiosClient from "@/lib/axiosClient";

interface Voice {
  id: string;
  name: string;
  description: string;
  gender: string;
  accent: string;
}

interface AgentDetailsModalProps {
  agent: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function AgentDetailsModal({
  agent,
  isOpen,
  onClose,
}: AgentDetailsModalProps) {
  const [voiceDetails, setVoiceDetails] = useState<Voice | null>(null);
  const [loadingVoice, setLoadingVoice] = useState(false);

  useEffect(() => {
    if (!isOpen || !agent?.voice) return;

    const fetchVoiceDetails = async () => {
      try {
        setLoadingVoice(true);
        const response = await axiosClient.get('/api/voices');
        const voices = response.data.data.voices || [];
        const voice = voices.find((v: Voice) => v.id === agent.voice);
        if (voice) {
          setVoiceDetails(voice);
        }
      } catch (error) {
        console.error('Error fetching voice details:', error);
      } finally {
        setLoadingVoice(false);
      }
    };

    fetchVoiceDetails();
  }, [isOpen, agent?.voice]);

  if (!isOpen) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-400";
      case "inactive":
        return "text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-400";
      case "suspended":
        return "text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-400";
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-400";
    }
  };

  const getTypeColor = (type: string) => {
    return type === "inbound"
      ? "text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-400"
      : "text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-400";
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-slate-900/70 backdrop-blur-md backdrop-saturate-150"
        onClick={onClose}
      ></div>

      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-4xl animate-scaleIn border border-white/20 dark:border-gray-700/50"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative px-6 py-4 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-sm">
                  <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {agent.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(
                        agent.type
                      )}`}
                    >
                      {agent.type.charAt(0).toUpperCase() + agent.type.slice(1)}{" "}
                      Agent
                    </span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        agent.status
                      )}`}
                    >
                      {agent.status.charAt(0).toUpperCase() +
                        agent.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-xl transition-all duration-200 hover:scale-110"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="bg-gray-50/80 dark:bg-gray-800/80 rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50">
                  <div className="flex items-center gap-2 mb-3">
                    <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      Persona
                    </h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    {agent.persona}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Volume2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {voiceDetails?.name || 'Voice'}
                      </h4>
                    </div>
                    {loadingVoice ? (
                      <div className="animate-pulse flex space-x-4">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                      </div>
                    ) : voiceDetails ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 capitalize">
                            {voiceDetails.name} - {voiceDetails.accent}
                          </span>
                        </div>
                        {voiceDetails.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                            {voiceDetails.description}
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500 dark:text-gray-400">No voice selected</span>
                    )}
                  </div>

                  <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <BarChart3 className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        Performance
                      </h4>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {agent.conversations.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Conversations
                        </div>
                      </div>
                      <div className="text-center">
                        <div
                          className={`text-2xl font-bold ${
                            agent.retention >= 80
                              ? "text-green-600"
                              : agent.retention >= 60
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        >
                          {agent.retention}%
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Retention
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <Phone className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      Twilio Configuration
                    </h4>
                  </div>
                  {agent.twilioConfig ? (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Phone Number
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {agent.twilioConfig.phoneNumber}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Account SID
                        </span>
                        <span className="text-sm font-mono text-gray-900 dark:text-white">
                          {agent.twilioConfig.accountSid.slice(0, 8)}...
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Status
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            agent.twilioConfig.isActive
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
                          }`}
                        >
                          {agent.twilioConfig.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                      Not configured
                    </p>
                  )}
                </div>

                <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <Cpu className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      AI Model
                    </h4>
                  </div>
                  {agent.llmConfig ? (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Model
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {agent.llmConfig.modelname}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Provider
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                          {agent.llmConfig.provider}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Max Tokens
                        </span>
                        <span className="text-sm text-gray-900 dark:text-white">
                          {agent.llmConfig.maxTokens || "Default"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Temperature
                        </span>
                        <span className="text-sm text-gray-900 dark:text-white">
                          {agent.llmConfig.temperature || "Default"}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                      Not configured
                    </p>
                  )}
                </div>

                {/* <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      Metadata
                    </h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Created On
                      </span>
                      <span className="text-sm text-gray-900 dark:text-white">
                        {new Date(agent.createdOn).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Tenant
                      </span>
                      <span className="text-sm text-gray-900 dark:text-white">
                        {agent.tenant.name}
                      </span>
                    </div>
                  </div>
                </div> */}
              </div>
            </div>

            <div className="mt-6 bg-gray-50/80 dark:bg-gray-800/80 rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center gap-2 mb-3">
                <Database className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Knowledge Base
                </h4>
              </div>
              <div className="max-h-40 overflow-y-auto">
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  {agent.knowledgeBase}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
