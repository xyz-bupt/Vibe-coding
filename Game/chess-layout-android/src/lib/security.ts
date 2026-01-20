/**
 * Security Utilities Module
 * Provides security functions for input sanitization, safe storage, and XSS prevention
 */

/**
 * Security configuration
 */
const SECURITY_CONFIG = {
  MAX_INPUT_LENGTH: 1000,
  ALLOWED_HTML_TAGS: [], // No HTML tags allowed for this application
  SANITIZE_PATTERN: /<[^>]*>/g, // Remove any HTML tags
};

/**
 * Sanitizes user input to prevent XSS attacks
 * @param input - The input string to sanitize
 * @param maxLength - Maximum allowed length (default from config)
 * @returns Sanitized string safe for rendering
 */
export function sanitizeInput(input: unknown, maxLength = SECURITY_CONFIG.MAX_INPUT_LENGTH): string {
  // Handle non-string input
  if (typeof input !== 'string') {
    return String(input ?? '');
  }

  // Truncate to max length
  let sanitized = input.slice(0, maxLength);

  // Remove any HTML tags
  sanitized = sanitized.replace(SECURITY_CONFIG.SANITIZE_PATTERN, '');

  // Escape HTML special characters
  const escapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#96;',
    '=': '&#x3D;',
  };

  return sanitized.replace(/[&<>"'/`=]/g, (char) => escapeMap[char] || char);
}

/**
 * Validates that a string contains only safe characters
 * @param input - String to validate
 * @param allowedPattern - Regex pattern of allowed characters
 * @returns true if string contains only safe characters
 */
export function validateSafeString(
  input: string,
  allowedPattern = /^[a-zA-Z0-9\u4e00-\u9fff\s\-_,.!?():]+$/
): boolean {
  return allowedPattern.test(input);
}

/**
 * Safely escapes HTML attribute values
 * @param value - The value to escape
 * @returns Escaped string safe for use in HTML attributes
 */
export function escapeHtmlAttribute(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Safe localStorage wrapper with error handling and data validation
 */
export const SecureStorage = {
  /**
   * Securely store data in localStorage
   * @param key - Storage key
   * @param value - Value to store (will be JSON serialized)
   */
  setItem<T>(key: string, value: T): boolean {
    try {
      // Validate key
      if (!validateSafeString(key, /^[a-zA-Z0-9_\-]+$/)) {
        console.error('[Security] Invalid storage key format');
        return false;
      }

      // Serialize and encrypt (base64 encoding for basic obfuscation)
      const serialized = JSON.stringify(value);
      const encoded = btoa(unescape(encodeURIComponent(serialized)));

      localStorage.setItem(key, encoded);
      return true;
    } catch (error) {
      console.error('[Security] Failed to store data:', error);
      return false;
    }
  },

  /**
   * Securely retrieve data from localStorage
   * @param key - Storage key
   * @param defaultValue - Default value if key doesn't exist or is invalid
   * @returns Retrieved value or default
   */
  getItem<T>(key: string, defaultValue?: T): T | null {
    try {
      const item = localStorage.getItem(key);

      if (item === null) {
        return defaultValue ?? null;
      }

      // Decode and deserialize
      const decoded = decodeURIComponent(escape(atob(item)));
      const parsed = JSON.parse(decoded) as T;

      return parsed;
    } catch (error) {
      console.error('[Security] Failed to retrieve data:', error);

      // Remove corrupted data
      try {
        localStorage.removeItem(key);
      } catch {}

      return defaultValue ?? null;
    }
  },

  /**
   * Remove an item from localStorage
   * @param key - Storage key
   */
  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('[Security] Failed to remove item:', error);
    }
  },

  /**
   * Clear all application data from localStorage
   * Only removes keys that start with the app prefix
   * @param prefix - Application key prefix (default: 'chess_')
   */
  clearAppData(prefix = 'chess_'): void {
    try {
      const keysToRemove: string[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(prefix)) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('[Security] Failed to clear data:', error);
    }
  },
};

/**
 * Generates a secure random token for session/CSP nonce
 * @returns Base64 encoded random token
 */
export function generateSecureToken(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
}

/**
 * Validates URL to prevent javascript: and other dangerous protocols
 * @param url - URL to validate
 * @returns true if URL is safe
 */
export function validateUrl(url: string): boolean {
  try {
    const parsed = new URL(url, window.location.origin);

    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false;
    }

    // Prevent javascript: and data: URLs
    if (url.toLowerCase().startsWith('javascript:') ||
        url.toLowerCase().startsWith('data:') ||
        url.toLowerCase().startsWith('vbscript:')) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Content Security Policy violations can be reported here
 */
export function reportCSPViolation(violation: SecurityPolicyViolationEvent): void {
  // Log CSP violations for monitoring
  console.warn('[CSP Violation]', {
    violatedDirective: violation.violatedDirective,
    effectiveDirective: violation.effectiveDirective,
    blockedURI: violation.blockedURI,
    lineNumber: violation.lineNumber,
    columnNumber: violation.columnNumber,
  });

  // In production, send to error tracking service
  if (import.meta.env.PROD) {
    // Send to monitoring service
  }
}
