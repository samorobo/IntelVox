// app/bulk-upload/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "@/components/DashboardHeader";
import CSVPhoneImport from "@/components/CSVPhoneImport";
import { CheckCircle, ArrowLeft } from "lucide-react";
import { getTenantId } from "@/lib/utils";

type ImportStatus = "idle" | "success" | "error";

interface ImportResult {
    success: boolean;
    data?: {
        totalProcessed: number;
        validContacts: number;
        createdContacts: any[];
    };
    error?: string;
}

export default function BulkUploadPage() {
    const router = useRouter();
    const [tenantId, setTenantId] = useState<string | null>(null);
    const [importStatus, setImportStatus] = useState<ImportStatus>("idle");
    const [importResult, setImportResult] = useState<ImportResult | null>(null);

    useEffect(() => {
        // Get tenantId from localStorage on client side
        const tenantIdFromStorage = getTenantId();
        setTenantId(tenantIdFromStorage);

        if (!tenantIdFromStorage) {
            console.error("No tenantId found in localStorage");
        }
    }, []);

    if (!tenantId) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Please log in to access bulk upload.
                    </p>
                    <button
                        onClick={() => router.push("/")}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    const handleImportComplete = (result: any) => {
        setImportResult(result);
        setImportStatus("success");
    };

    const handleNewImport = () => {
        setImportStatus("idle");
        setImportResult(null);
    };

    const handleBackToContacts = () => {
        router.push("/contact-leads");
    };

    if (importStatus === "success" && importResult?.data) {
        return (
            <>
                <DashboardHeader title="Bulk Contact Import" />
                <div className="p-8">
                    <button
                        onClick={handleBackToContacts}
                        className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Contacts
                    </button>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            Import Successful!
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Successfully imported {importResult.data.validContacts} contacts.
                        </p>

                        <div className="grid grid-cols-3 gap-4 mb-6 max-w-md mx-auto">
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {importResult.data.totalProcessed}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Processed</div>
                            </div>
                            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    {importResult.data.validContacts}
                                </div>
                                <div className="text-sm text-green-600 dark:text-green-400">Imported</div>
                            </div>
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                    {importResult.data.createdContacts.length}
                                </div>
                                <div className="text-sm text-blue-600 dark:text-blue-400">Created</div>
                            </div>
                        </div>

                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={handleNewImport}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            >
                                Import More Contacts
                            </button>
                            <button
                                onClick={handleBackToContacts}
                                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                View Contacts
                            </button>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <DashboardHeader title="Bulk Contact Import" />
            <div className="p-8">
                <button
                    onClick={handleBackToContacts}
                    className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Contacts
                </button>

                <CSVPhoneImport
                    tenantId={tenantId}
                    onImportComplete={handleImportComplete}
                    onCancel={handleBackToContacts}
                />
            </div>
        </>
    );
}