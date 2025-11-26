// lib/phoneValidation.ts
export interface PhoneValidationResult {
    isValid: boolean;
    cleaned: string;
    error?: string;
}

export function validatePhoneNumber(phone: string): PhoneValidationResult {
    if (!phone || typeof phone !== 'string') {
        return {
            isValid: false,
            cleaned: phone || '',
            error: 'Invalid phone number format'
        };
    }

    // Remove all non-digit characters except leading +
    const cleaned = phone.replace(/[^\d+]/g, '');

    // Check if it's a valid length (7-15 digits, excluding country code indicators)
    const digitsOnly = cleaned.replace(/\D/g, '');

    if (digitsOnly.length < 7 || digitsOnly.length > 15) {
        return {
            isValid: false,
            cleaned: digitsOnly,
            error: `Phone number must be 7-15 digits (got ${digitsOnly.length})`
        };
    }

    // Basic format validation
    if (!/^[\d+][\d\s\-()]+$/.test(phone)) {
        return {
            isValid: false,
            cleaned: digitsOnly,
            error: 'Invalid phone number format'
        };
    }

    return {
        isValid: true,
        cleaned: digitsOnly
    };
}

export function detectPhoneFields(headers: string[]): string[] {
    const phonePatterns = [
        /phone/i, /mobile/i, /contact/i, /number/i, /tel/i, /cell/i, /whatsapp/i
    ];

    return headers.filter(header =>
        phonePatterns.some(pattern => pattern.test(header))
    );
}

export function extractPhoneNumbersFromCSV(data: any[], phoneField: string): string[] {
    const numbers: string[] = [];

    data.forEach(row => {
        if (row[phoneField]) {
            const validation = validatePhoneNumber(row[phoneField]);
            if (validation.isValid) {
                numbers.push(validation.cleaned);
            }
        }
    });

    return numbers;
}