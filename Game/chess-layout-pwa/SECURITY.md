# Security Policy

## Security Overview

This PWA chess application follows security best practices for Progressive Web Apps and Single Page Applications.

## Security Measures Implemented

### 1. Content Security Policy (CSP)

The application implements a strict CSP through:
- Meta tags in `index.html`
- Server headers in `vite.config.ts`

**CSP Rules:**
- `default-src 'self'` - Only allow resources from same origin
- `script-src 'self' 'unsafe-inline' 'unsafe-eval'` - Scripts from same origin only
- `style-src 'self' 'unsafe-inline'` - Styles from same origin only
- `img-src 'self' data: https:` - Images from same origin or HTTPS
- `object-src 'none'` - Block plugins (Flash, Java, etc.)
- `base-uri 'self'` - Restrict base URL
- `form-action 'self'` - Restrict form submissions
- `frame-ancestors 'none'` - Prevent clickjacking
- `upgrade-insecure-requests` - Force HTTPS

### 2. HTTP Security Headers

The following security headers are configured:

| Header | Value | Purpose |
|--------|-------|---------|
| X-Content-Type-Options | nosniff | Prevent MIME sniffing |
| X-Frame-Options | DENY | Prevent clickjacking |
| X-XSS-Protection | 1; mode=block | Legacy XSS protection |
| Referrer-Policy | strict-origin-when-cross-origin | Control referrer information |
| Permissions-Policy | geolocation=(), microphone=(), camera=() | Disable unnecessary features |
| Strict-Transport-Security | max-age=31536000; includeSubDomains | Enforce HTTPS |

### 3. Input Sanitization

User input is sanitized using `/src/lib/security.ts`:
- HTML tag removal
- HTML entity encoding
- Length validation
- Whitelist-based character validation

### 4. Secure Storage

LocalStorage operations use the `SecureStorage` wrapper:
- Base64 encoding for basic obfuscation
- Error handling for corrupted data
- Input validation for storage keys
- Automatic cleanup of corrupted entries

### 5. Service Worker Security

- Only registered in production environment
- Uses `updateViaCache: 'none'` to ensure fresh updates
- Proper scope restrictions
- Controlled cache strategies

### 6. Dependency Management

- Regular security audits with `npm audit`
- Automatic dependency updates via Dependabot (recommended)
- .npmrc configured for strict peer dependencies
- Package.json includes audit scripts

## Security Best Practices

### Development

1. Never commit sensitive data (API keys, tokens)
2. Use environment variables for configuration
3. Keep dependencies updated
4. Run `npm audit` regularly
5. Review code changes for security implications

### Production Deployment

1. Serve over HTTPS only
2. Implement proper CSP headers at server level
3. Enable Subresource Integrity (SRI) for external CDN resources
4. Use security-focused hosting (Vercel, Netlify, Cloudflare)
5. Enable HTTP/2 or HTTP/3
6. Configure proper CORS if needed

## Reporting Vulnerabilities

If you discover a security vulnerability, please:

1. Do not create a public issue
2. Send details to the project maintainers privately
3. Include steps to reproduce
4. Allow time for the issue to be fixed before disclosure

## Security Checklist

- [x] Content Security Policy implemented
- [x] XSS protection (input sanitization)
- [x] CSRF protection (same-origin policy)
- [x] Clickjacking protection (X-Frame-Options)
- [x] HTTPS enforcement
- [x] Secure storage implementation
- [x] Dependency vulnerability scanning
- [x] Service Worker security
- [x] Debug logs removed from production
- [x] Error handling doesn't leak sensitive information
