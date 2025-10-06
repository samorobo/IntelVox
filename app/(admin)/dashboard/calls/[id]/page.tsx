"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
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

export default function CallDetailPage() {
  const params = useParams();
  const callId = params?.id as string;

  const [activeTab, setActiveTab] = useState<"details" | "transcript">(
    "details"
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState("12:02");
  const [totalTime] = useState("23:00");
  const [progress, setProgress] = useState(52);

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
    console.log("Navigate back");
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
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                      <Download className="w-4 h-4" />
                      Download Recording
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                      <Phone className="w-6 h-6 text-blue-500 mt-1" />
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Call Direction
                        </div>
                        <div className="text-base font-medium text-gray-900 dark:text-white">
                          {callDetail.callDirection}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                      <Hash className="w-6 h-6 text-purple-500 mt-1" />
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Call Outcome
                        </div>
                        <div className="text-base font-medium text-gray-900 dark:text-white">
                          {callDetail.outcome}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                      <User className="w-6 h-6 text-green-500 mt-1" />
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Human Handoff
                        </div>
                        <div className="text-base font-medium text-gray-900 dark:text-white">
                          {callDetail.humanHandoff}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                      <MessageSquare className="w-6 h-6 text-red-500 mt-1" />
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Sentiment
                        </div>
                        <div className="text-base font-medium text-red-600 dark:text-red-400">
                          {callDetail.sentiment}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                      <Calendar className="w-6 h-6 text-yellow-500 mt-1" />
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Call Date
                        </div>
                        <div className="text-base font-medium text-gray-900 dark:text-white">
                          {callDetail.date}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                      <Clock className="w-6 h-6 text-indigo-500 mt-1" />
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Call Time
                        </div>
                        <div className="text-base font-medium text-gray-900 dark:text-white">
                          {callDetail.time}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                      <Clock className="w-6 h-6 text-teal-500 mt-1" />
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Call Duration
                        </div>
                        <div className="text-base font-medium text-gray-900 dark:text-white">
                          {callDetail.duration}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                      <User className="w-6 h-6 text-pink-500 mt-1" />
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          AI Agent
                        </div>
                        <div className="text-base font-medium text-gray-900 dark:text-white">
                          {callDetail.aiAgent}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                      <User className="w-6 h-6 text-blue-400 mt-1" />
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Customer Name
                        </div>
                        <div className="text-base font-medium text-gray-900 dark:text-white">
                          {callDetail.name}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                      <Phone className="w-6 h-6 text-emerald-500 mt-1" />
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Customer Number
                        </div>
                        <div className="text-base font-medium text-gray-900 dark:text-white font-mono">
                          {callDetail.phone}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                      <Volume2 className="w-6 h-6 text-orange-500 mt-1" />
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Recording Status
                        </div>
                        <div className="text-base font-medium text-gray-900 dark:text-white">
                          {callDetail.recordingStatus}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                      <Hash className="w-6 h-6 text-violet-500 mt-1" />
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Outcome
                        </div>
                        <div className="text-base font-medium text-gray-900 dark:text-white">
                          {callDetail.outcome}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm col-span-1 sm:col-span-2 lg:col-span-4">
                      <Building className="w-6 h-6 text-cyan-500 mt-1" />
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Tenant Name
                        </div>
                        <div className="text-base font-medium text-gray-900 dark:text-white">
                          {callDetail.tenant}
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
                    <button className="text-gray-400 hover:text-white transition-colors">
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "transcript" && (
              <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Transcript content will be displayed here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
