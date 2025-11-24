/**
 * Get tenant ID from localStorage
 * @returns The tenant ID if available, or null if not found
 * Safe to use in client-side code only
 */
export function getTenantId(): string | null {
  // Ensure we're on the client side
  if (typeof window === "undefined") {
    return null;
  }
  try {
    return localStorage.getItem("tenantId");
  } catch (error) {
    console.error("Error accessing localStorage:", error);
    return null;
  }
}

/**
 * Get tenant ID from localStorage or throw an error
 * Useful when tenantId is required for an operation
 * @returns The tenant ID
 * @throws Error if tenantId is not found
 * Safe to use in client-side code only
 */
export function getTenantIdOrThrow(): string {
  // Ensure we're on the client side
  if (typeof window === "undefined") {
    throw new Error("Cannot access tenantId on server side. Please ensure this is called from client-side code.");
  }
  
  const tenantId = getTenantId();
  if (!tenantId) {
    throw new Error("Tenant ID not found. Please log in again.");
  }
  return tenantId;
}

