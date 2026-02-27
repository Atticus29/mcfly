# Threat Model

## 1. System Overview

This application is a Next.js web application using:

- Next.js (App Router)
- Node.js runtime
- PostgreSQL database
- Hosted on Vercel (or similar)
- Authentication via [NextAuth/Auth.js/etc.]

The app provides:
- User authentication
- CRUD operations on user-owned resources
- Public and private routes

---

## 2. Assets to Protect

### Primary Assets
- User account data
- Authentication tokens (JWT/session cookies)
- Database contents
- API secrets / environment variables

### Secondary Assets
- Application availability
- Usage analytics integrity

---

## 3. Trust Boundaries

- Browser ↔ Server (public internet)
- Server ↔ Database
- Server ↔ Third-party APIs
- Build pipeline ↔ Deployment target

---

## 4. Threat Actors

- Anonymous internet users
- Authenticated malicious users
- Automated bots
- Compromised third-party services
- Supply chain attacks (npm dependencies)

---

## 5. Attack Surfaces

- API routes (`/api/*`)
- Server Actions
- Form submissions
- Authentication callbacks
- File uploads (if applicable)
- Third-party integrations
- Environment variables

---

## 6. Common Threat Categories (STRIDE)

### Spoofing
- Stolen session cookies
- Forged JWT tokens

Mitigation:
- HttpOnly + Secure cookies
- Proper session expiration
- JWT signature verification

---

### Tampering
- Modified request bodies
- Client-side bypass of validation

Mitigation:
- Server-side validation (Zod or similar)
- Never trust client input
- Authorization checks on every data access

---

### Repudiation
- User denies performing an action

Mitigation:
- Server-side logging
- Audit logs for sensitive actions

---

### Information Disclosure
- Leaking secrets in client bundles
- Returning internal errors in API responses

Mitigation:
- Never expose server secrets to client components
- Use proper error handling
- Ensure only `NEXT_PUBLIC_*` vars are client-visible

---

### Denial of Service
- API flooding
- Expensive database queries

Mitigation:
- Rate limiting
- Query limits & pagination
- Caching where appropriate

---

### Elevation of Privilege
- Accessing resources not owned by user

Mitigation:
- Always check resource ownership server-side
- Use role-based access checks

---

## 7. Sensitive Areas to Revisit Before Production

- Authentication flow
- Session storage
- File upload handling
- Input validation completeness
- Dependency audit (`npm audit`)
- CORS configuration
- Rate limiting configuration

---

## 8. Open Questions

- Do we need 2FA?
- Do we need IP-based rate limiting?
- Do we need encryption at rest beyond DB default?
- Do we log sensitive actions?

---

## 9. Last Review Date

YYYY-MM-DD