"use client";

import { useState, useEffect, useRef } from "react";
import {
    Plus,
    MoreVertical,
    FileText,
    Link as LinkIcon,
    Upload,
    X,
    Loader2,
    Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import DashboardHeader from "@/components/DashboardHeader";

interface Document {
    id: string;
    name: string;
    type: "pdf" | "url";
    url?: string;
    status: "Processed" | "Queued" | "Failed";
}

interface KnowledgeBase {
    id: string;
    name: string;
    documentCount: number;
    documents: Document[];
}

export default function KnowledgeBasePage() {
    const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([
        {
            id: "1",
            name: "Product Documentation",
            documentCount: 5,
            documents: [
                {
                    id: "1",
                    name: "user-guide.pdf",
                    type: "pdf",
                    status: "Processed",
                },
                {
                    id: "2",
                    name: "https://docs.example.com/api",
                    type: "url",
                    url: "https://docs.example.com/api",
                    status: "Processed",
                },
                {
                    id: "3",
                    name: "faq-document.pdf",
                    type: "pdf",
                    status: "Queued",
                },
                {
                    id: "4",
                    name: "https://broken-link.com",
                    type: "url",
                    url: "https://broken-link.com",
                    status: "Failed",
                },
            ],
        },
        {
            id: "2",
            name: "Sales FAQs",
            documentCount: 12,
            documents: [
                {
                    id: "5",
                    name: "user-guide.pdf",
                    type: "pdf",
                    status: "Processed",
                },
                {
                    id: "6",
                    name: "https://docs.example.com/api",
                    type: "url",
                    url: "https://docs.example.com/api",
                    status: "Processed",
                },
                {
                    id: "7",
                    name: "faq-document.pdf",
                    type: "pdf",
                    status: "Queued",
                },
                {
                    id: "8",
                    name: "https://broken-link.com",
                    type: "url",
                    url: "https://broken-link.com",
                    status: "Failed",
                },
            ],
        },
        {
            id: "3",
            name: "Technical Support",
            documentCount: 0,
            documents: [],
        },
    ]);

    const [selectedKnowledgeBase, setSelectedKnowledgeBase] =
        useState<KnowledgeBase | null>(knowledgeBases[0]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newKnowledgeBaseName, setNewKnowledgeBaseName] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    // Add Document Modal states
    const [isAddDocumentModalOpen, setIsAddDocumentModalOpen] = useState(false);
    const [isAddUrlModalOpen, setIsAddUrlModalOpen] = useState(false);
    const [urlInput, setUrlInput] = useState("");
    const [isAddingUrl, setIsAddingUrl] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (activeDropdown) {
                setActiveDropdown(null);
            }
        };

        if (activeDropdown) {
            document.addEventListener('click', handleClickOutside);
        }

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [activeDropdown]);

    const handleCreateKnowledgeBase = async () => {
        if (!newKnowledgeBaseName.trim()) {
            toast.error("Please enter a knowledge base name");
            return;
        }

        setIsCreating(true);
        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000));

            const newKB: KnowledgeBase = {
                id: Date.now().toString(),
                name: newKnowledgeBaseName,
                documentCount: 0,
                documents: [],
            };

            setKnowledgeBases((prev) => [...prev, newKB]);
            setSelectedKnowledgeBase(newKB);
            toast.success("Knowledge base created successfully!");
            setIsCreateModalOpen(false);
            setNewKnowledgeBaseName("");
        } catch (error) {
            toast.error("Failed to create knowledge base");
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteKnowledgeBase = async (id: string) => {
        if (!confirm("Are you sure you want to delete this knowledge base?")) {
            return;
        }

        try {
            setKnowledgeBases((prev) => prev.filter((kb) => kb.id !== id));
            if (selectedKnowledgeBase?.id === id) {
                setSelectedKnowledgeBase(knowledgeBases[0] || null);
            }
            toast.success("Knowledge base deleted successfully!");
        } catch (error) {
            toast.error("Failed to delete knowledge base");
        }
        setActiveDropdown(null);
    };

    const handleDeleteDocument = async (docId: string) => {
        if (!selectedKnowledgeBase) return;

        try {
            const updatedKB = {
                ...selectedKnowledgeBase,
                documents: selectedKnowledgeBase.documents.filter(
                    (doc) => doc.id !== docId
                ),
                documentCount: selectedKnowledgeBase.documentCount - 1,
            };

            setSelectedKnowledgeBase(updatedKB);
            setKnowledgeBases((prev) =>
                prev.map((kb) => (kb.id === updatedKB.id ? updatedKB : kb))
            );
            toast.success("Document removed successfully!");
        } catch (error) {
            toast.error("Failed to remove document");
        }
    };

    const handleUploadPdfClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0 || !selectedKnowledgeBase) return;

        try {
            // Simulate file upload
            const file = files[0];
            const newDoc: Document = {
                id: Date.now().toString(),
                name: file.name,
                type: "pdf",
                status: "Queued",
            };

            const updatedKB = {
                ...selectedKnowledgeBase,
                documents: [...selectedKnowledgeBase.documents, newDoc],
                documentCount: selectedKnowledgeBase.documentCount + 1,
            };

            setSelectedKnowledgeBase(updatedKB);
            setKnowledgeBases((prev) =>
                prev.map((kb) => (kb.id === updatedKB.id ? updatedKB : kb))
            );
            setIsAddDocumentModalOpen(false);
            toast.success("PDF uploaded successfully!");
        } catch (error) {
            toast.error("Failed to upload PDF");
        }

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleAddUrl = async () => {
        if (!urlInput.trim() || !selectedKnowledgeBase) {
            toast.error("Please enter a valid URL");
            return;
        }

        setIsAddingUrl(true);
        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000));

            const newDoc: Document = {
                id: Date.now().toString(),
                name: urlInput,
                type: "url",
                url: urlInput,
                status: "Queued",
            };

            const updatedKB = {
                ...selectedKnowledgeBase,
                documents: [...selectedKnowledgeBase.documents, newDoc],
                documentCount: selectedKnowledgeBase.documentCount + 1,
            };

            setSelectedKnowledgeBase(updatedKB);
            setKnowledgeBases((prev) =>
                prev.map((kb) => (kb.id === updatedKB.id ? updatedKB : kb))
            );
            setIsAddUrlModalOpen(false);
            setIsAddDocumentModalOpen(false);
            setUrlInput("");
            toast.success("URL added successfully!");
        } catch (error) {
            toast.error("Failed to add URL");
        } finally {
            setIsAddingUrl(false);
        }
    };

    const getStatusColor = (status: Document["status"]) => {
        switch (status) {
            case "Processed":
                return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
            case "Queued":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
            case "Failed":
                return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
        }
    };

    return (
        <>
            <DashboardHeader title="Knowledge Bases" />

            <div className="flex h-[calc(100vh-120px)] bg-gray-50 dark:bg-gray-950">
                {/* Left Sidebar - Knowledge Bases List */}
                <div className="w-96 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Knowledge Bases
                            </h2>
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                New
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        {knowledgeBases.map((kb) => (
                            <div
                                key={kb.id}
                                onClick={() => setSelectedKnowledgeBase(kb)}
                                className={`relative group p-4 rounded-lg cursor-pointer transition-all ${selectedKnowledgeBase?.id === kb.id
                                    ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                                    : "bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-transparent"
                                    }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                            {kb.name}
                                        </h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            {kb.documentCount} document{kb.documentCount !== 1 ? "s" : ""}
                                        </p>
                                    </div>
                                    <div className="relative">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveDropdown(
                                                    activeDropdown === kb.id ? null : kb.id
                                                );
                                            }}
                                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                        {activeDropdown === kb.id && (
                                            <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteKnowledgeBase(kb.id);
                                                    }}
                                                    className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg flex items-center gap-2"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Panel - Documents */}
                <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-950">
                    {selectedKnowledgeBase ? (
                        <>
                            <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-8 py-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {selectedKnowledgeBase.name}
                                        </h2>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            {selectedKnowledgeBase.documentCount} document
                                            {selectedKnowledgeBase.documentCount !== 1 ? "s" : ""}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setIsAddDocumentModalOpen(true)}
                                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add Document
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8">
                                {selectedKnowledgeBase.documents.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full">
                                        <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
                                            <FileText className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                            No documents yet
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400 text-center mb-8 max-w-md">
                                            Add your first document to this knowledge base to enable
                                            AI-powered responses.
                                        </p>
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={() => setIsAddDocumentModalOpen(true)}
                                                className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border border-gray-300 dark:border-gray-600"
                                            >
                                                <Upload className="w-4 h-4" />
                                                Upload PDF
                                            </button>
                                            <button
                                                onClick={() => setIsAddUrlModalOpen(true)}
                                                className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                                            >
                                                <LinkIcon className="w-4 h-4" />
                                                Paste URL
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {selectedKnowledgeBase.documents.map((doc) => (
                                            <div
                                                key={doc.id}
                                                className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-colors group"
                                            >
                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    <div className="flex-shrink-0">
                                                        {doc.type === "pdf" ? (
                                                            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                                                                <FileText className="w-5 h-5 text-red-600 dark:text-red-400" />
                                                            </div>
                                                        ) : (
                                                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                                                                <LinkIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                            {doc.name}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span
                                                        className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
                                                            doc.status
                                                        )}`}
                                                    >
                                                        {doc.status}
                                                    </span>
                                                    <button
                                                        onClick={() => handleDeleteDocument(doc.id)}
                                                        className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-gray-500 dark:text-gray-400">
                                Select a knowledge base to view documents
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Knowledge Base Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="fixed inset-0 bg-black/50"
                        onClick={() => !isCreating && setIsCreateModalOpen(false)}
                    />
                    <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    Create Knowledge Base
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    Give your knowledge base a name to get started.
                                </p>
                            </div>
                            <button
                                onClick={() => !isCreating && setIsCreateModalOpen(false)}
                                disabled={isCreating}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Knowledge Base Name
                            </label>
                            <input
                                type="text"
                                value={newKnowledgeBaseName}
                                onChange={(e) => setNewKnowledgeBaseName(e.target.value)}
                                disabled={isCreating}
                                placeholder="e.g., Product Documentation"
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !isCreating) {
                                        handleCreateKnowledgeBase();
                                    }
                                }}
                            />
                        </div>

                        <div className="flex items-center justify-end gap-3">
                            <button
                                onClick={() => setIsCreateModalOpen(false)}
                                disabled={isCreating}
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateKnowledgeBase}
                                disabled={isCreating || !newKnowledgeBaseName.trim()}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isCreating && <Loader2 className="w-4 h-4 animate-spin" />}
                                {isCreating ? "Creating..." : "Continue"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Document Modal */}
            {isAddDocumentModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="fixed inset-0 bg-black/50"
                        onClick={() => setIsAddDocumentModalOpen(false)}
                    />
                    <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    Add Document
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    Choose how you want to add content to your knowledge base.
                                </p>
                            </div>
                            <button
                                onClick={() => setIsAddDocumentModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Upload PDF File Option */}
                            <button
                                onClick={handleUploadPdfClick}
                                className="group p-8 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 transition-all hover:bg-blue-50 dark:hover:bg-blue-900/10"
                            >
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/30 transition-colors">
                                        <Upload className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                                        Upload PDF File
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Upload a PDF to extract knowledge automatically.
                                    </p>
                                </div>
                            </button>

                            {/* Paste from URL Option */}
                            <button
                                onClick={() => {
                                    setIsAddUrlModalOpen(true);
                                }}
                                className="group p-8 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 transition-all hover:bg-blue-50 dark:hover:bg-blue-900/10"
                            >
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/30 transition-colors">
                                        <LinkIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                                        Paste from URL
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Extract content from a webpage or public link.
                                    </p>
                                </div>
                            </button>
                        </div>

                        {/* Hidden file input */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </div>
                </div>
            )}

            {/* Add URL Modal */}
            {isAddUrlModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center">
                    <div
                        className="fixed inset-0 bg-black/50"
                        onClick={() => !isAddingUrl && setIsAddUrlModalOpen(false)}
                    />
                    <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    Add URL
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    Paste the URL of the webpage you want to extract knowledge from.
                                </p>
                            </div>
                            <button
                                onClick={() => !isAddingUrl && setIsAddUrlModalOpen(false)}
                                disabled={isAddingUrl}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="mb-6">
                            <input
                                type="url"
                                value={urlInput}
                                onChange={(e) => setUrlInput(e.target.value)}
                                disabled={isAddingUrl}
                                placeholder="https://example.com/docs"
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !isAddingUrl) {
                                        handleAddUrl();
                                    }
                                }}
                            />
                        </div>

                        <div className="flex items-center justify-end gap-3">
                            <button
                                onClick={() => setIsAddUrlModalOpen(false)}
                                disabled={isAddingUrl}
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddUrl}
                                disabled={isAddingUrl || !urlInput.trim()}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isAddingUrl && <Loader2 className="w-4 h-4 animate-spin" />}
                                {isAddingUrl ? "Adding..." : "Continue"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
