# Security Policy

## Supported Versions

This project follows semantic versioning. Security fixes are applied to the latest minor/patch line.

| Version | Supported |
|--------:|:----------|
| Latest  | ✅        |
| Older  | ❌        |

If you are running an older version, please upgrade before reporting issues that may already be fixed.

---

## Reporting a Vulnerability

Please **do not** open public GitHub issues for security vulnerabilities.

Instead, report privately using one of the following:

1. **GitHub Security Advisories** (preferred):  
   Use the repository’s “Report a vulnerability” link if enabled.

2. **Email** (fallback):  
   Send details to: `mark.fisher3@pcc.edu`

### What to Include

- A clear description of the vulnerability and potential impact
- Steps to reproduce (proof-of-concept is helpful)
- Affected endpoints/routes/components
- Any logs, screenshots, or relevant configuration (redact secrets)
- Your suggested fix, if you have one

### Response Targets

We aim to:
- Acknowledge receipt within **72 hours**
- Provide a status update within **7 days**
- Release a fix or mitigation as soon as practical, depending on severity

---

## Coordinated Disclosure

We support responsible, coordinated disclosure:
- Please allow us time to investigate and patch before public disclosure.
- If you plan to publish, coordinate a disclosure date with us.

---

## Security Best Practices (for Contributors)

### Secrets & Credentials
- Never commit secrets, tokens, or private keys.
- Use `.env.local` for local secrets and keep `.env.example` up to date.
- Rotate any secret immediately if you suspect exposure.

### Input Validation & Output Encoding
- Treat all client input as untrusted.
- Validate server-side (e.g., Zod) and enforce authorization per request.
- Prevent XSS by avoiding `dangerouslySetInnerHTML` unless absolutely required.

### Authentication & Sessions
- Prefer **HttpOnly**, **Secure**, **SameSite** cookies for session tokens.
- Enforce CSRF protections where applicable.
- Protect privileged actions with re-auth or additional checks when appropriate.

### Dependency Hygiene
- Keep dependencies updated.
- Run:
  - `npm audit` (or `pnpm audit`)
  - Dependabot (recommended)
- Avoid adding large, unmaintained dependencies.

### Logging
- Do not log secrets or raw tokens.
- Avoid logging full request bodies in production.

---

## Security Tooling (Recommended)

- Dependabot (GitHub)
- CodeQL (GitHub)
- Secret scanning (GitHub)
- SAST/DAST as appropriate for deployment

---

## Credits

We appreciate responsible security reports and will credit reporters publicly upon request,
unless you prefer to remain anonymous.