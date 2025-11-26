// components/CSVPhoneImport.tsx
"use client";

import { useState, useRef } from "react";
import Papa from "papaparse";
import axiosClient from "@/lib/axiosClient"; // Use axiosClient instead of axios
import { validatePhoneNumber, detectPhoneFields } from "@/lib/phoneValidation";
import { Upload, X, Check, AlertCircle, Download, Edit, Save } from "lucide-react";

interface CSVPhoneImportProps {
    tenantId: string;
    onImportComplete?: (results: any) => void;
    onCancel?: () => void;
}

interface ContactPreview {
    id: string;
    number: string;
    name?: string;
    isValid: boolean;
    error?: string;
    isEdited?: boolean;
}

export default function CSVPhoneImport({ tenantId, onImportComplete, onCancel }: CSVPhoneImportProps) {
    const [step, setStep] = useState<"upload" | "preview" | "processing">("upload");
    const [csvData, setCsvData] = useState<any[]>([]);
    const [phoneFields, setPhoneFields] = useState<string[]>([]);
    const [selectedPhoneField, setSelectedPhoneField] = useState<string>("");
    const [contacts, setContacts] = useState<ContactPreview[]>([]);
    const [editingContact, setEditingContact] = useState<string | null>(null);
    const [editValue, setEditValue] = useState<string>("");
    const [uploadStats, setUploadStats] = useState({
        total: 0,
        valid: 0,
        invalid: 0
    });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            complete: (results) => {
                if (results.errors.length > 0) {
                    alert("Error parsing CSV: " + results.errors[0].message);
                    return;
                }

                const data = results.data as any[];
                const detectedPhoneFields = detectPhoneFields(results.meta.fields || []);

                if (detectedPhoneFields.length === 0) {
                    alert("No phone number fields detected in CSV. Please ensure your CSV has columns like 'phone', 'mobile', 'contact', etc.");
                    return;
                }

                setCsvData(data);
                setPhoneFields(detectedPhoneFields);
                setSelectedPhoneField(detectedPhoneFields[0]);
                setStep("preview");

                // Auto-extract phone numbers from first detected field
                extractPhoneNumbers(detectedPhoneFields[0], data);
            },
            error: (error) => {
                alert("Error reading CSV file: " + error.message);
            }
        });
    };

    const extractPhoneNumbers = (field: string, data: any[]) => {
        const phoneNumbers: ContactPreview[] = [];

        data.forEach((row, index) => {
            if (row[field]) {
                const validation = validatePhoneNumber(row[field]);
                phoneNumbers.push({
                    id: `contact-${index}`,
                    number: validation.cleaned || row[field],
                    name: row.name || row.Name || row.NAME || `Contact ${index + 1}`,
                    isValid: validation.isValid,
                    error: validation.error
                });
            }
        });

        setContacts(phoneNumbers);
        updateStats(phoneNumbers);
    };

    const updateStats = (contactList: ContactPreview[]) => {
        setUploadStats({
            total: contactList.length,
            valid: contactList.filter(c => c.isValid).length,
            invalid: contactList.filter(c => !c.isValid).length
        });
    };

    const handleFieldChange = (field: string) => {
        setSelectedPhoneField(field);
        extractPhoneNumbers(field, csvData);
    };

    const startEditing = (contact: ContactPreview) => {
        setEditingContact(contact.id);
        setEditValue(contact.number);
    };

    const saveEdit = (contactId: string) => {
        const updatedContacts = contacts.map(contact => {
            if (contact.id === contactId) {
                const validation = validatePhoneNumber(editValue);
                return {
                    ...contact,
                    number: validation.cleaned,
                    isValid: validation.isValid,
                    error: validation.error,
                    isEdited: true
                };
            }
            return contact;
        });

        setContacts(updatedContacts);
        updateStats(updatedContacts);
        setEditingContact(null);
        setEditValue("");
    };

    const cancelEdit = () => {
        setEditingContact(null);
        setEditValue("");
    };

    const removeContact = (contactId: string) => {
        const updatedContacts = contacts.filter(contact => contact.id !== contactId);
        setContacts(updatedContacts);
        updateStats(updatedContacts);
    };

    const handleImport = async () => {
        setStep("processing");

        const validContacts = contacts
            .filter(contact => contact.isValid)
            .map(contact => ({
                name: contact.name,
                number: contact.number,
                tenantId,
                consent: true,
                status: "on_hold" as const
            }));

        try {
            // Use axiosClient instead of direct axios
            const response = await axiosClient.post(`/api/tenants/${tenantId}/contacts/bulk`, {
                contacts: validContacts
            });

            if (onImportComplete) {
                onImportComplete(response.data);
            }
        } catch (error: any) {
            console.error("Error importing contacts:", error);

            // Better error message
            let errorMessage = "Failed to import contacts. Please try again.";
            if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
                errorMessage = "Cannot connect to server. Please make sure the backend is running.";
            } else if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            }

            alert(errorMessage);
            setStep("preview");
        }
    };

    const downloadSampleCSV = () => {
        const sampleData = [
            { name: "John Doe", phone: "+1 (555) 123-4567", mobile: "08012345678" },
            { name: "Jane Smiths", phone: "+44 7700 900123", mobile: "07098765432" },
            { name: "Bob Johnson", phone: "234-801-234-5678", mobile: "08123456789" }
        ];

        const csv = Papa.unparse(sampleData);
        const blob = new Blob([csv], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "sample_contacts.csv";
        a.click();
        window.URL.revokeObjectURL(url);
    };

    if (step === "processing") {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Importing Contacts
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        Processing {uploadStats.valid} contacts...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Import Contacts from CSV
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Upload a CSV file containing phone numbers. We'll automatically detect and validate them.
                </p>
            </div>

            <div className="p-6">
                {step === "upload" && (
                    <div className="text-center">
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 mb-6">
                            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                Upload CSV File
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                Supports .csv files with columns like "phone", "mobile", "contact number", etc.
                            </p>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                                accept=".csv"
                                className="hidden"
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                            >
                                Choose File
                            </button>
                        </div>

                        <div className="text-left bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                                CSV Format Requirements:
                            </h4>
                            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                                <li>Include columns with phone numbers (names: phone, mobile, contact, etc.)</li>
                                <li>Phone numbers can be in any common format</li>
                                <li>Include a "name" column for contact names (optional)</li>
                                <li>File should be UTF-8 encoded</li>
                            </ul>

                            <button
                                onClick={downloadSampleCSV}
                                className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm mt-3"
                            >
                                <Download className="w-4 h-4" />
                                Download Sample CSV
                            </button>
                        </div>
                    </div>
                )}

                {step === "preview" && (
                    <div className="space-y-6">
                        {/* Field Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Select Phone Number Field:
                            </label>
                            <select
                                value={selectedPhoneField}
                                onChange={(e) => handleFieldChange(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {phoneFields.map(field => (
                                    <option key={field} value={field}>{field}</option>
                                ))}
                            </select>
                        </div>

                        {/* Statistics */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {uploadStats.total}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
                            </div>
                            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    {uploadStats.valid}
                                </div>
                                <div className="text-sm text-green-600 dark:text-green-400">Valid</div>
                            </div>
                            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                                    {uploadStats.invalid}
                                </div>
                                <div className="text-sm text-red-600 dark:text-red-400">Invalid</div>
                            </div>
                        </div>

                        {/* Contacts List */}
                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700">
                                <h4 className="font-medium text-gray-900 dark:text-white">
                                    Contact Preview ({contacts.length} entries)
                                </h4>
                            </div>

                            <div className="max-h-96 overflow-y-auto">
                                {contacts.map((contact) => (
                                    <div
                                        key={contact.id}
                                        className={`px-4 py-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0 ${
                                            contact.isValid ? 'bg-white dark:bg-gray-800' : 'bg-red-50 dark:bg-red-900/10'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3 flex-1">
                                                <div className="flex-shrink-0">
                                                    {contact.isValid ? (
                                                        <Check className="w-5 h-5 text-green-500" />
                                                    ) : (
                                                        <AlertCircle className="w-5 h-5 text-red-500" />
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-gray-900 dark:text-white truncate">
                                                            {contact.name}
                                                        </span>
                                                        {contact.isEdited && (
                                                            <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                                                                Edited
                                                            </span>
                                                        )}
                                                    </div>

                                                    {editingContact === contact.id ? (
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <input
                                                                type="text"
                                                                value={editValue}
                                                                onChange={(e) => setEditValue(e.target.value)}
                                                                className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                                placeholder="Enter phone number"
                                                            />
                                                            <button
                                                                onClick={() => saveEdit(contact.id)}
                                                                className="p-1 text-green-600 hover:text-green-700"
                                                            >
                                                                <Save className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={cancelEdit}
                                                                className="p-1 text-gray-600 hover:text-gray-700"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <code className={`text-sm font-mono ${
                                                                contact.isValid
                                                                    ? 'text-gray-600 dark:text-gray-400'
                                                                    : 'text-red-600 dark:text-red-400'
                                                            }`}>
                                                                {contact.number}
                                                            </code>
                                                            {!contact.isValid && (
                                                                <span className="text-xs text-red-600 dark:text-red-400">
                                                                    {contact.error}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {contact.isValid && editingContact !== contact.id && (
                                                    <button
                                                        onClick={() => startEditing(contact)}
                                                        className="p-1 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                                                        title="Edit number"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => removeContact(contact.id)}
                                                    className="p-1 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                                                    title="Remove contact"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-between items-center">
                            <button
                                onClick={() => setStep("upload")}
                                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                            >
                                Back to Upload
                            </button>

                            <div className="flex gap-3">
                                {onCancel && (
                                    <button
                                        onClick={onCancel}
                                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                )}
                                <button
                                    onClick={handleImport}
                                    disabled={uploadStats.valid === 0}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                                >
                                    Import {uploadStats.valid} Contacts
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}