// "use client";

// import { useState, useEffect } from "react";
// import { Search, Plus, Eye, Edit, PhoneIncoming, PhoneOutgoing, X, Loader2 } from "lucide-react";
// import toast from "react-hot-toast";
// import axios from "axios";

// interface Campaign {
//   id: string;
//   name: string;
//   type: "Inbound" | "Outbound";
//   aiAgent: string;
//   startDate: string;
//   endDate: string;
//   status: "Active" | "Scheduled" | "Completed" | "Paused";
// }

// interface AIAgent {
//   id: string;
//   name: string;
// }

// interface Contact {
//   id: string;
//   name: string;
// }

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
// const TENANT_ID = "cmhqjnjb50004vkiolo5br0qd";
// const CONTACT_API_BASE_URL = `http://localhost:8000/contact/${TENANT_ID}/`;

// export default function CampaignsPage() {
//   const [campaigns, setCampaigns] = useState<Campaign[]>([
//     { id: "1", name: "Q4 Lead Generation", type: "Outbound", aiAgent: "GPT-4 Sales", startDate: "1/14/2024", endDate: "3/30/2024", status: "Active" },
//     { id: "2", name: "Customer Support Automation", type: "Inbound", aiAgent: "Claude Support", startDate: "1/31/2024", endDate: "12/30/2024", status: "Active" },
//     { id: "3", name: "Product Launch Outreach", type: "Outbound", aiAgent: "Gemini Marketing", startDate: "3/14/2024", endDate: "4/14/2024", status: "Scheduled" },
//     { id: "4", name: "Survey Collection", type: "Inbound", aiAgent: "GPT-3.5 Survey", startDate: "12/31/2023", endDate: "1/30/2024", status: "Completed" },
//     { id: "5", name: "Email Warmup Campaign", type: "Outbound", aiAgent: "Claude Email", startDate: "2/9/2024", endDate: "3/14/2024", status: "Paused" },
//   ]);

//   const [aiAgents, setAiAgents] = useState<AIAgent[]>([]);
//   const [contacts, setContacts] = useState<Contact[]>([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
//   const [campaignType, setCampaignType] = useState<"inbound" | "outbound" | null>(null);
//   const [submitting, setSubmitting] = useState(false);
//   const [formData, setFormData] = useState<any>({ 
//     name: "", 
//     aiAgent: "", 
//     startDate: "", 
//     endDate: "", 
//     description: "", 
//     contactList: "" 
//   });
//   const [formErrors, setFormErrors] = useState<any>({});

//   const itemsPerPage = 5;

//   useEffect(() => {
//     const fetchAIAgents = async () => {
//       try {
//         const response = await axios.get(`${API_BASE_URL}agents`);
//         setAiAgents(response.data);
//       } catch (error) {
//         console.error("Error fetching AI agents:", error);
//       }
//     };
//     fetchAIAgents();
//   }, []);

//   useEffect(() => {
//     const fetchContacts = async () => {
//       try {
//         const response = await axios.get(CONTACT_API_BASE_URL);
//         setContacts(response.data);
//       } catch (error) {
//         console.error("Error fetching contacts:", error);
//       }
//     };
//     fetchContacts();
//   }, []);

//   const filteredCampaigns = campaigns.filter((campaign) => 
//     campaign.name.toLowerCase().includes(searchTerm.toLowerCase())
//   );
  
//   const totalPages = Math.ceil(filteredCampaigns.length / itemsPerPage);
//   const currentCampaigns = filteredCampaigns.slice(
//     (currentPage - 1) * itemsPerPage, 
//     currentPage * itemsPerPage
//   );

//   const getStatusColor = (status: Campaign["status"]) => {
//     const colors = {
//       Active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
//       Scheduled: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
//       Completed: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
//       Paused: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
//     };
//     return colors[status];
//   };

//   const handleCloseModal = () => {
//     if (!submitting) {
//       setIsCreateModalOpen(false);
//       setCampaignType(null);
//       setFormData({ name: "", aiAgent: "", startDate: "", endDate: "", description: "", contactList: "" });
//       setFormErrors({});
//     }
//   };

//   const validateForm = (): boolean => {
//     const errors: any = {};
//     if (!formData.name.trim()) errors.name = "Campaign name is required";
//     if (!formData.aiAgent) errors.aiAgent = campaignType === "inbound" ? "AI Agent is required" : "AI Model is required";
//     if (!formData.startDate) errors.startDate = "Start date is required";
//     if (!formData.endDate) errors.endDate = "End date is required";
//     if (!formData.description.trim()) errors.description = "Description is required";
//     if (campaignType === "outbound" && !formData.contactList) errors.contactList = "Contact list is required";
//     setFormErrors(errors);
//     return Object.keys(errors).length === 0;
//   };

//   const handleCreateCampaign = async () => {
//     if (!validateForm()) return;
    
//     try {
//       setSubmitting(true);
//       const newCampaign: Campaign = {
//         id: Date.now().toString(),
//         name: formData.name,
//         type: campaignType === "inbound" ? "Inbound" : "Outbound",
//         aiAgent: aiAgents.find((a) => a.id === formData.aiAgent)?.name || "",
//         startDate: new Date(formData.startDate).toLocaleDateString(),
//         endDate: new Date(formData.endDate).toLocaleDateString(),
//         status: "Scheduled",
//       };
      
//       setCampaigns((prev) => [newCampaign, ...prev]);
//       toast.success(`${campaignType === "inbound" ? "Inbound" : "Outbound"} campaign created successfully!`);
//       handleCloseModal();
//     } catch (error) {
//       toast.error("Failed to create campaign");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
//       <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 py-6">
//         <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
//           Campaign Management
//         </h1>
//         <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
//           View and manage all inbound and outbound AI campaigns.
//         </p>
//       </div>

//       <div className="p-8">
//         <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
//           <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
//             <div className="relative">
//               <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//               <input
//                 type="text"
//                 placeholder="Search campaigns..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>
            
//             <button
//               onClick={() => setIsCreateModalOpen(true)}
//               className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
//             >
//               <Plus className="w-4 h-4" />
//               Create Campaign
//             </button>
//           </div>

//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead>
//                 <tr className="border-b border-gray-200 dark:border-gray-700">
//                   <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">
//                     Campaign Name
//                   </th>
//                   <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">
//                     Type
//                   </th>
//                   <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">
//                     AI Agent / Model
//                   </th>
//                   <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">
//                     Start Date
//                   </th>
//                   <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">
//                     End Date
//                   </th>
//                   <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">
//                     Status
//                   </th>
//                   <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {currentCampaigns.map((campaign) => (
//                   <tr
//                     key={campaign.id}
//                     className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
//                   >
//                     <td className="py-4 px-6 text-sm font-medium text-gray-900 dark:text-white">
//                       {campaign.name}
//                     </td>
//                     <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
//                       <span className="inline-flex items-center gap-1">
//                         {campaign.type === "Inbound" ? (
//                           <PhoneIncoming className="w-4 h-4 text-blue-600" />
//                         ) : (
//                           <PhoneOutgoing className="w-4 h-4 text-purple-600" />
//                         )}
//                         {campaign.type}
//                       </span>
//                     </td>
//                     <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
//                       {campaign.aiAgent}
//                     </td>
//                     <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
//                       {campaign.startDate}
//                     </td>
//                     <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
//                       {campaign.endDate}
//                     </td>
//                     <td className="py-4 px-6">
//                       <span
//                         className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
//                           campaign.status
//                         )}`}
//                       >
//                         ● {campaign.status}
//                       </span>
//                     </td>
//                     <td className="py-4 px-6">
//                       <div className="flex items-center gap-2">
//                         <button
//                           className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
//                           title="View campaign"
//                         >
//                           <Eye className="w-4 h-4" />
//                         </button>
//                         <button
//                           className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
//                           title="Edit campaign"
//                         >
//                           <Edit className="w-4 h-4" />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-center gap-2">
//             <button
//               onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
//               disabled={currentPage === 1}
//               className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               ← Previous
//             </button>
//             {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
//               <button
//                 key={page}
//                 onClick={() => setCurrentPage(page)}
//                 className={`px-3 py-1 text-sm rounded ${
//                   currentPage === page
//                     ? "bg-blue-600 text-white"
//                     : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
//                 }`}
//               >
//                 {page}
//               </button>
//             ))}
//             <button
//               onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
//               disabled={currentPage === totalPages}
//               className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               Next →
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Create Campaign Modal */}
//       {isCreateModalOpen && (
//         <div className="fixed inset-0 z-50 overflow-y-auto">
//           <div
//             className="fixed inset-0 bg-black/30 backdrop-blur-sm"
//             onClick={handleCloseModal}
//           ></div>

//           <div className="flex min-h-full items-center justify-center p-4">
//             <div
//               className="relative bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl"
//               onClick={(e) => e.stopPropagation()}
//             >
//               {!campaignType ? (
//                 <>
//                   <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
//                     <div>
//                       <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
//                         Create New Campaign
//                       </h3>
//                       <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
//                         Choose the type of campaign you want to create
//                       </p>
//                     </div>
//                     <button
//                       onClick={handleCloseModal}
//                       className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
//                     >
//                       <X className="w-5 h-5" />
//                     </button>
//                   </div>

//                   <div className="px-6 py-8">
//                     <div className="grid grid-cols-2 gap-4">
//                       <button
//                         onClick={() => setCampaignType("inbound")}
//                         className="flex flex-col items-center justify-center p-8 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all group"
//                       >
//                         <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
//                           <PhoneIncoming className="w-8 h-8 text-blue-600 dark:text-blue-400" />
//                         </div>
//                         <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
//                           Inbound Campaign
//                         </h4>
//                         <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
//                           Handle incoming calls and messages
//                         </p>
//                       </button>

//                       <button
//                         onClick={() => setCampaignType("outbound")}
//                         className="flex flex-col items-center justify-center p-8 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all group"
//                       >
//                         <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4 group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
//                           <PhoneOutgoing className="w-8 h-8 text-purple-600 dark:text-purple-400" />
//                         </div>
//                         <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
//                           Outbound Campaign
//                         </h4>
//                         <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
//                           Reach out to contacts proactively
//                         </p>
//                       </button>
//                     </div>
//                   </div>
//                 </>
//               ) : (
//                 <>
//                   <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
//                     <div>
//                       <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
//                         Create {campaignType === "inbound" ? "Inbound" : "Outbound"} Campaign
//                       </h3>
//                       <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
//                         Fill in the details for your new campaign
//                       </p>
//                     </div>
//                     <button
//                       onClick={handleCloseModal}
//                       disabled={submitting}
//                       className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 disabled:opacity-50"
//                     >
//                       <X className="w-5 h-5" />
//                     </button>
//                   </div>

//                   <div className="px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                         Campaign Name <span className="text-red-500">*</span>
//                       </label>
//                       <input
//                         type="text"
//                         value={formData.name}
//                         onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                         disabled={submitting}
//                         className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${
//                           formErrors.name ? "border-red-500" : "border-gray-300 dark:border-gray-600"
//                         }`}
//                         placeholder="Enter campaign name"
//                       />
//                       {formErrors.name && (
//                         <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>
//                       )}
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                         {campaignType === "inbound" ? "AI Agent" : "AI Model"} <span className="text-red-500">*</span>
//                       </label>
//                       <select
//                         value={formData.aiAgent}
//                         onChange={(e) => setFormData({ ...formData, aiAgent: e.target.value })}
//                         disabled={submitting}
//                         className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${
//                           formErrors.aiAgent ? "border-red-500" : "border-gray-300 dark:border-gray-600"
//                         }`}
//                       >
//                         <option value="">Select {campaignType === "inbound" ? "AI agent" : "AI agent"}</option>
//                         {aiAgents.map((agent) => (
//                           <option key={agent.id} value={agent.id}>
//                             {agent.name}
//                           </option>
//                         ))}
//                       </select>
//                       {formErrors.aiAgent && (
//                         <p className="mt-1 text-sm text-red-500">{formErrors.aiAgent}</p>
//                       )}
//                     </div>

//                     <div className="grid grid-cols-2 gap-4">
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                           Start Date <span className="text-red-500">*</span>
//                         </label>
//                         <input
//                           type="date"
//                           value={formData.startDate}
//                           onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
//                           disabled={submitting}
//                           className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${
//                             formErrors.startDate ? "border-red-500" : "border-gray-300 dark:border-gray-600"
//                           }`}
//                           placeholder="dd/mm/yyyy"
//                         />
//                         {formErrors.startDate && (
//                           <p className="mt-1 text-sm text-red-500">{formErrors.startDate}</p>
//                         )}
//                       </div>

//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                           End Date <span className="text-red-500">*</span>
//                         </label>
//                         <input
//                           type="date"
//                           value={formData.endDate}
//                           onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
//                           disabled={submitting}
//                           className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${
//                             formErrors.endDate ? "border-red-500" : "border-gray-300 dark:border-gray-600"
//                           }`}
//                           placeholder="dd/mm/yyyy"
//                         />
//                         {formErrors.endDate && (
//                           <p className="mt-1 text-sm text-red-500">{formErrors.endDate}</p>
//                         )}
//                       </div>
//                     </div>

//                     {campaignType === "outbound" && (
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                           Contact List <span className="text-red-500">*</span>
//                         </label>
//                         <select
//                           value={formData.contactList}
//                           onChange={(e) => setFormData({ ...formData, contactList: e.target.value })}
//                           disabled={submitting}
//                           className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${
//                             formErrors.contactList ? "border-red-500" : "border-gray-300 dark:border-gray-600"
//                           }`}
//                         >
//                           <option value="">Select contact list</option>
//                           {contacts.map((contact) => (
//                             <option key={contact.id} value={contact.id}>
//                               {contact.name}
//                             </option>
//                           ))}
//                         </select>
//                         {formErrors.contactList && (
//                           <p className="mt-1 text-sm text-red-500">{formErrors.contactList}</p>
//                         )}
//                       </div>
//                     )}

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                         Description <span className="text-red-500">*</span>
//                       </label>
//                       <textarea
//                         value={formData.description}
//                         onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//                         disabled={submitting}
//                         rows={4}
//                         className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:opacity-50 ${
//                           formErrors.description ? "border-red-500" : "border-gray-300 dark:border-gray-600"
//                         }`}
//                         placeholder="Enter campaign description"
//                       />
//                       {formErrors.description && (
//                         <p className="mt-1 text-sm text-red-500">{formErrors.description}</p>
//                       )}
//                     </div>
//                   </div>

//                   <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
//                     <button
//                       onClick={() => setCampaignType(null)}
//                       disabled={submitting}
//                       className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
//                     >
//                       Back
//                     </button>
//                     <button
//                       onClick={handleCreateCampaign}
//                       disabled={submitting}
//                       className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
//                     >
//                       {submitting ? (
//                         <>
//                           <Loader2 className="w-4 h-4 animate-spin" />
//                           Please wait...
//                         </>
//                       ) : (
//                         "Create Campaign"
//                       )}
//                     </button>
//                   </div>
//                 </>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }






"use client";

import { useState, useEffect } from "react";
import { Search, Plus, Eye, Edit, PhoneIncoming, PhoneOutgoing, X, Loader2, Calendar, TrendingUp, Users, Phone } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

interface Campaign {
  id: string;
  name: string;
  type: "Inbound" | "Outbound";
  aiAgent: string;
  aiAgentId: string;
  startDate: string;
  endDate: string;
  status: "Active" | "Scheduled" | "Completed" | "Paused";
  description?: string;
  contactListId?: string;
  totalCalls?: number;
  contactsReached?: number;
  conversionRate?: string;
}

interface AIAgent {
  id: string;
  name: string;
}

interface Contact {
  id: string;
  name: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const TENANT_ID = "cmhqjnjb50004vkiolo5br0qd";
const CONTACT_API_BASE_URL = `http://localhost:8000/contact/${TENANT_ID}/`;

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    { id: "1", name: "Q4 Lead Generation", type: "Outbound", aiAgent: "GPT-4 Sales", aiAgentId: "agent1", startDate: "1/14/2024", endDate: "3/30/2024", status: "Active", description: "This campaign is designed to engage with potential customers.", totalCalls: 1247, contactsReached: 892, conversionRate: "24.3%" },
    { id: "2", name: "Customer Support", type: "Inbound", aiAgent: "Claude Support", aiAgentId: "agent2", startDate: "1/31/2024", endDate: "12/30/2024", status: "Active", description: "Automated support.", totalCalls: 2156, contactsReached: 1987, conversionRate: "31.5%" },
  ]);

  const [aiAgents, setAiAgents] = useState<AIAgent[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [campaignType, setCampaignType] = useState<"inbound" | "outbound" | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [viewCampaign, setViewCampaign] = useState<Campaign | null>(null);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [formData, setFormData] = useState<any>({ name: "", aiAgent: "", startDate: "", endDate: "", description: "", contactList: "" });
  const [formErrors, setFormErrors] = useState<any>({});

  const itemsPerPage = 5;

  useEffect(() => {
    axios.get(`${API_BASE_URL}agents`).then(res => setAiAgents(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    axios.get(CONTACT_API_BASE_URL).then(res => setContacts(res.data)).catch(console.error);
  }, []);

  const filteredCampaigns = campaigns.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalPages = Math.ceil(filteredCampaigns.length / itemsPerPage);
  const currentCampaigns = filteredCampaigns.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getStatusColor = (status: Campaign["status"]) => ({
    Active: "bg-green-100 text-green-800",
    Scheduled: "bg-yellow-100 text-yellow-800",
    Completed: "bg-purple-100 text-purple-800",
    Paused: "bg-gray-100 text-gray-800",
  }[status]);

  const handleCloseModal = () => {
    if (!submitting) {
      setIsCreateModalOpen(false);
      setCampaignType(null);
      setEditingCampaign(null);
      setFormData({ name: "", aiAgent: "", startDate: "", endDate: "", description: "", contactList: "" });
      setFormErrors({});
    }
  };

  const handleEditCampaign = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setCampaignType(campaign.type.toLowerCase() as "inbound" | "outbound");
    setFormData({
      name: campaign.name,
      aiAgent: campaign.aiAgentId,
      startDate: campaign.startDate ? new Date(campaign.startDate).toISOString().split('T')[0] : "",
      endDate: campaign.endDate ? new Date(campaign.endDate).toISOString().split('T')[0] : "",
      description: campaign.description || "",
      contactList: campaign.contactListId || "",
    });
    setIsCreateModalOpen(true);
  };

  const validateForm = () => {
    const errors: any = {};
    if (!formData.name.trim()) errors.name = "Required";
    if (!formData.aiAgent) errors.aiAgent = "Required";
    if (!formData.startDate) errors.startDate = "Required";
    if (!formData.endDate) errors.endDate = "Required";
    if (!formData.description.trim()) errors.description = "Required";
    if (campaignType === "outbound" && !formData.contactList) errors.contactList = "Required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateCampaign = async () => {
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      if (editingCampaign) {
        setCampaigns(prev => prev.map(c => c.id === editingCampaign.id ? {
          ...editingCampaign,
          name: formData.name,
          aiAgent: aiAgents.find(a => a.id === formData.aiAgent)?.name || "",
          aiAgentId: formData.aiAgent,
          startDate: new Date(formData.startDate).toLocaleDateString(),
          endDate: new Date(formData.endDate).toLocaleDateString(),
          description: formData.description,
          contactListId: formData.contactList,
        } : c));
        toast.success("Campaign updated!");
      } else {
        setCampaigns(prev => [{
          id: Date.now().toString(),
          name: formData.name,
          type: campaignType === "inbound" ? "Inbound" : "Outbound",
          aiAgent: aiAgents.find(a => a.id === formData.aiAgent)?.name || "",
          aiAgentId: formData.aiAgent,
          startDate: new Date(formData.startDate).toLocaleDateString(),
          endDate: new Date(formData.endDate).toLocaleDateString(),
          status: "Scheduled",
          description: formData.description,
          contactListId: formData.contactList,
          totalCalls: 0,
          contactsReached: 0,
          conversionRate: "0%",
        }, ...prev]);
        toast.success("Campaign created!");
      }
      handleCloseModal();
    } catch (error) {
      toast.error("Failed");
    } finally {
      setSubmitting(false);
    }
  };



    return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 py-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Campaign Management</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">View and manage all inbound and outbound AI campaigns.</p>
      </div>

      <div className="p-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search campaigns..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
              <Plus className="w-4 h-4" />Create Campaign
            </button>
          </div>

          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">Campaign Name</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">Type</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">AI Agent</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">Start Date</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">End Date</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">Status</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentCampaigns.map((campaign) => (
                <tr key={campaign.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="py-4 px-6 text-sm font-medium text-gray-900 dark:text-white">{campaign.name}</td>
                  <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
                    <span className="inline-flex items-center gap-1">
                      {campaign.type === "Inbound" ? <PhoneIncoming className="w-4 h-4 text-blue-600" /> : <PhoneOutgoing className="w-4 h-4 text-purple-600" />}
                      {campaign.type}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">{campaign.aiAgent}</td>
                  <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">{campaign.startDate}</td>
                  <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">{campaign.endDate}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>● {campaign.status}</span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setViewCampaign(campaign)} className="p-1.5 text-gray-600 hover:text-blue-600"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => handleEditCampaign(campaign)} className="p-1.5 text-gray-600 hover:text-blue-600"><Edit className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
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

      {/* View Modal - Slides up from bottom */}
      {viewCampaign && (
        <div className="fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black/50" onClick={() => setViewCampaign(null)}></div>
          <div className="fixed bottom-0 left-0 right-0 animate-slide-up">
            <div className="bg-gray-900 text-white rounded-t-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gray-900 border-b border-gray-700 px-8 py-6 flex justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{viewCampaign.name}</h2>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${viewCampaign.type === "Inbound" ? "bg-blue-900/50 text-blue-300" : "bg-purple-900/50 text-purple-300"}`}>{viewCampaign.type} Campaign</span>
                </div>
                <button onClick={() => setViewCampaign(null)} className="text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>
              </div>
              <div className="px-8 py-6">
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <div className="flex items-center gap-3 mb-2"><Calendar className="w-5 h-5 text-blue-400" /><h3 className="text-sm text-gray-400">Duration</h3></div>
                    <p className="text-lg font-semibold">{viewCampaign.startDate} - {viewCampaign.endDate}</p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <div className="flex items-center gap-3 mb-2"><Users className="w-5 h-5 text-purple-400" /><h3 className="text-sm text-gray-400">AI Agent</h3></div>
                    <p className="text-lg font-semibold">{viewCampaign.aiAgent}</p>
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <div className="flex items-center gap-2 mb-2"><Phone className="w-4 h-4 text-blue-400" /><p className="text-sm text-gray-400">Total Calls</p></div>
                    <p className="text-2xl font-bold">{viewCampaign.totalCalls?.toLocaleString() || 0}</p>
                    <p className="text-xs text-green-400 mt-1">+17% from last week</p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <div className="flex items-center gap-2 mb-2"><Users className="w-4 h-4 text-purple-400" /><p className="text-sm text-gray-400">Contacts Reached</p></div>
                    <p className="text-2xl font-bold">{viewCampaign.contactsReached?.toLocaleString() || 0}</p>
                    <p className="text-xs text-green-400 mt-1">+7.1% reach rate</p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <div className="flex items-center gap-2 mb-2"><TrendingUp className="w-4 h-4 text-green-400" /><p className="text-sm text-gray-400">Conversion Rate</p></div>
                    <p className="text-2xl font-bold">{viewCampaign.conversionRate || "0%"}</p>
                    <p className="text-xs text-green-400 mt-1">+2.2% improvement</p>
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-3">Campaign Description</h3>
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <p className="text-gray-300">{viewCampaign.description || "No description available."}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={handleCloseModal}></div>
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
              {!campaignType ? (
                <>
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create New Campaign</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Choose the type of campaign</p>
                    </div>
                    <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-500"><X className="w-5 h-5" /></button>
                  </div>
                  <div className="px-6 py-8">
                    <div className="grid grid-cols-2 gap-4">
                      <button onClick={() => setCampaignType("inbound")} className="flex flex-col items-center p-8 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 group">
                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200"><PhoneIncoming className="w-8 h-8 text-blue-600" /></div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Inbound Campaign</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">Handle incoming calls</p>
                      </button>
                      <button onClick={() => setCampaignType("outbound")} className="flex flex-col items-center p-8 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 group">
                        <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4 group-hover:bg-purple-200"><PhoneOutgoing className="w-8 h-8 text-purple-600" /></div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Outbound Campaign</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">Reach out proactively</p>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{editingCampaign ? "Update" : "Create"} {campaignType === "inbound" ? "Inbound" : "Outbound"} Campaign</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Fill in the details</p>
                    </div>
                    <button onClick={handleCloseModal} disabled={submitting} className="text-gray-400 hover:text-gray-500"><X className="w-5 h-5" /></button>
                  </div>
                  <div className="px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Campaign Name <span className="text-red-500">*</span></label>
                      <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} disabled={submitting} className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.name ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`} placeholder="Enter campaign name" />
                      {formErrors.name && <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{campaignType === "inbound" ? "AI Agent" : "AI Model"} <span className="text-red-500">*</span></label>
                      <select value={formData.aiAgent} onChange={(e) => setFormData({ ...formData, aiAgent: e.target.value })} disabled={submitting} className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.aiAgent ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`}>
                        <option value="">Select AI agent</option>
                        {aiAgents.map(agent => <option key={agent.id} value={agent.id}>{agent.name}</option>)}
                      </select>
                      {formErrors.aiAgent && <p className="mt-1 text-sm text-red-500">{formErrors.aiAgent}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date <span className="text-red-500">*</span></label>
                        <input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} disabled={submitting} className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.startDate ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`} />
                        {formErrors.startDate && <p className="mt-1 text-sm text-red-500">{formErrors.startDate}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date <span className="text-red-500">*</span></label>
                        <input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} disabled={submitting} className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.endDate ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`} />
                        {formErrors.endDate && <p className="mt-1 text-sm text-red-500">{formErrors.endDate}</p>}
                      </div>
                    </div>
                    {campaignType === "outbound" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact List <span className="text-red-500">*</span></label>
                        <select value={formData.contactList} onChange={(e) => setFormData({ ...formData, contactList: e.target.value })} disabled={submitting} className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.contactList ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`}>
                          <option value="">Select contact list</option>
                          {contacts.map(contact => <option key={contact.id} value={contact.id}>{contact.name}</option>)}
                        </select>
                        {formErrors.contactList && <p className="mt-1 text-sm text-red-500">{formErrors.contactList}</p>}
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description <span className="text-red-500">*</span></label>
                      <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} disabled={submitting} rows={4} className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${formErrors.description ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`} placeholder="Enter description" />
                      {formErrors.description && <p className="mt-1 text-sm text-red-500">{formErrors.description}</p>}
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                    <button onClick={() => setCampaignType(null)} disabled={submitting} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50">Back</button>
                    <button onClick={handleCreateCampaign} disabled={submitting} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400">
                      {submitting ? <><Loader2 className="w-4 h-4 animate-spin" />Please wait...</> : editingCampaign ? "Update Campaign" : "Create Campaign"}
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