"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardHeader from "@/components/DashboardHeader";
import {
  ArrowLeft,
  Download,
  Phone,
  Calendar,
  Clock,
  User,
  Building,
  Hash,
  MessageSquare,
  Volume2,
  Play,
  Pause,
  Search,
} from "lucide-react";

interface CallDetail {
  id: string;
  name: string;
  agentName: string;
  tenant: string;
  phone: string;
  date: string;
  time: string;
  duration: string;
  callDirection: string;
  callStatus: string;
  callDuration: string;
  humanHandoff: string;
  recordingStatus: string;
  sentiment: string;
  aiAgent: string;
  outcome: string;
}

interface TranscriptMessage {
  id: number;
  speaker: "customer" | "agent";
  text: string;
  timestamp: string;
  date: string;
  highlightedText?: string;
}

export default function CallDetailPage() {
  const params = useParams();
  const router = useRouter();
  const callId = params?.id as string;

  const [activeTab, setActiveTab] = useState<"details" | "transcript">(
    "details"
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState("12:02");
  const [totalTime] = useState("23:00");
  const [progress, setProgress] = useState(52);
  const [searchTerm, setSearchTerm] = useState("");
  const transcriptMessages: TranscriptMessage[] = [
    {
      id: 1,
      speaker: "customer",
      text: "Hello, I'm calling about my recent order that hasn't arrived yet.",
      timestamp: "00:12",
      date: "Sep 15, 2025",
    },
    {
      id: 2,
      speaker: "agent",
      text: "I can help you with that. Could you please provide your order number?",
      timestamp: "00:25",
      date: "Sep 15, 2025",
    },
    {
      id: 3,
      speaker: "customer",
      text: "Yes, it's ORD-7842. The delivery was supposed to be yesterday.",
      timestamp: "00:38",
      date: "Sep 15, 2025",
    },
    {
      id: 4,
      speaker: "agent",
      text: "Thank you. I can see your order is currently at our distribution center. It should be delivered by tomorrow.",
      timestamp: "01:15",
      date: "Sep 15, 2025",
    },
    {
      id: 5,
      speaker: "customer",
      text: "That's good to hear. I was getting worried because I need it for an important event.",
      timestamp: "01:45",
      date: "Sep 15, 2025",
    },
  ];

  const filteredMessages = transcriptMessages.filter((message) =>
    message.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (callId) {
      console.log("Call ID from URL:", callId);
      // Future: fetchCallDetail(callId);
    }
  }, [callId]);

  const callDetail: CallDetail = {
    id: "1",
    name: "John Doe",
    agentName: "Mr. Arjun Mehta",
    tenant: "Acme Corp",
    phone: "+1(545) 565-343",
    date: "15 Sep 2025",
    time: "8:07 PM",
    duration: "23:00",
    callDirection: "Outbound",
    callStatus: "Exceeded",
    callDuration: "23 min",
    humanHandoff: "Yes",
    recordingStatus: "On",
    sentiment: "Negative",
    aiAgent: "Solo Bot",
    outcome: "Connected",
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProgress(Number(e.target.value));
  };

  const handleBack = () => {
    router.back();
  };

  const handleDownloadRecording = () => {
    console.log("Download recording");
  };

  const handleDownloadTranscript = () => {
    console.log("Download transcript");
  };

  return (
    <>
      <DashboardHeader title={`Call Log (${callDetail.name})`} />

      <div className="p-8">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Calls
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex gap-8 px-6">
              <button
                onClick={() => setActiveTab("details")}
                className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "details"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                Details
              </button>
              <button
                onClick={() => setActiveTab("transcript")}
                className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "transcript"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                Transcript
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === "details" && (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                      Basic details
                    </h3>
                    <button
                      onClick={handleDownloadRecording}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download Recording
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 flex items-center gap-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                          <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            Call direction
                          </div>
                          <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {callDetail.callDirection}
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 flex items-center gap-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                          <MessageSquare className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            Call outcome
                          </div>
                          <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {callDetail.outcome}
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 flex items-center gap-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                          <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            Human handoff
                          </div>
                          <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {callDetail.humanHandoff}
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 flex items-center gap-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                          <MessageSquare className="w-5 h-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            Sentiment
                          </div>
                          <div className="text-sm font-semibold text-red-600 dark:text-red-400 truncate">
                            {callDetail.sentiment}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 flex items-center gap-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            Call date
                          </div>
                          <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {callDetail.date}
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 flex items-center gap-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                          <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            Call time
                          </div>
                          <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {callDetail.time}
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 flex items-center gap-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center">
                          <Clock className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            Call duration
                          </div>
                          <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {callDetail.duration}
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 flex items-center gap-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center">
                          <User className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            AI Agent
                          </div>
                          <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {callDetail.aiAgent}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 flex items-center gap-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center">
                          <User className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            Customer name
                          </div>
                          <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {callDetail.agentName}
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 flex items-center gap-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                          <Phone className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            Customer number
                          </div>
                          <div className="text-sm font-semibold text-gray-900 dark:text-white truncate font-mono">
                            {callDetail.phone}
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 flex items-center gap-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                          <Volume2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            Recording status
                          </div>
                          <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {callDetail.recordingStatus}
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 flex items-center gap-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-rose-100 dark:bg-rose-900/30 rounded-lg flex items-center justify-center">
                          <Hash className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            Call status
                          </div>
                          <div className="text-sm font-semibold text-red-600 dark:text-red-400 truncate">
                            {callDetail.callStatus}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-400">{currentTime}</span>
                    <span className="text-sm text-gray-400">{totalTime}</span>
                  </div>

                  <div className="mb-6">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={progress}
                      onChange={handleProgressChange}
                      className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                      style={{
                        background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${progress}%, #374151 ${progress}%, #374151 100%)`,
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-center gap-4">
                    <button className="text-gray-400 hover:text-white transition-colors">
                      <Volume2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handlePlayPause}
                      className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-full hover:bg-blue-700 transition-colors"
                    >
                      {isPlaying ? (
                        <Pause className="w-5 h-5 text-white" />
                      ) : (
                        <Play className="w-5 h-5 text-white ml-0.5" />
                      )}
                    </button>
                    <button
                      onClick={handleDownloadRecording}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "transcript" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                    Transcript details
                  </h3>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleDownloadTranscript}
                      className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    <div className="relative w-64">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search transcript..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white text-sm rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {filteredMessages.length > 0 ? (
                    filteredMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`p-4 rounded-lg border transition-all ${
                          message.speaker === "customer"
                            ? "bg-gray-800 dark:bg-gray-900 border-gray-700 dark:border-gray-800"
                            : "bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-0.5 ${
                              message.speaker === "customer"
                                ? "bg-blue-600/20"
                                : "bg-green-100 dark:bg-green-900/30"
                            }`}
                          >
                            <User
                              className={`w-4 h-4 ${
                                message.speaker === "customer"
                                  ? "text-blue-400"
                                  : "text-green-600 dark:text-green-400"
                              }`}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <div
                                className={`text-sm font-semibold ${
                                  message.speaker === "customer"
                                    ? "text-blue-300"
                                    : "text-gray-900 dark:text-white"
                                }`}
                              >
                                {message.speaker === "customer"
                                  ? "Customer (Virtual Assistant)"
                                  : "Agent"}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {message.date}
                                </span>
                                <span className="text-xs text-gray-400 dark:text-gray-500">
                                  •
                                </span>
                                <span
                                  className={`text-xs ${
                                    message.speaker === "customer"
                                      ? "text-gray-400"
                                      : "text-gray-500 dark:text-gray-400"
                                  }`}
                                >
                                  {message.timestamp}
                                </span>
                              </div>
                            </div>
                            <p
                              className={`text-sm mb-2 leading-relaxed ${
                                message.speaker === "customer"
                                  ? "text-gray-300"
                                  : "text-gray-700 dark:text-gray-300"
                              }`}
                            >
                              {message.text}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400 opacity-50" />
                      <p className="text-gray-500 dark:text-gray-400">
                        No messages found matching your search.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
