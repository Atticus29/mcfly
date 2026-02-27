# ADR 0001: Initial Architecture Choice

## Status
Accepted

## Context

We are building a web application with:

- Authenticated users
- Server-side rendering
- API endpoints
- Database-backed data

We need:

- Strong SEO support
- Server + client rendering flexibility
- Good developer experience
- Scalable deployment

---

## Decision

We will use:

- Next.js (App Router)
- TypeScript
- MongoDb
- NextAuth (Auth.js) for authentication
- Deployed to Vercel

We will use:

- Server Components by default
- Client Components only where necessary
- Server Actions for mutations
- API routes only when required

---

## Rationale

- Next.js provides hybrid rendering and good DX.
- App Router supports server-first architecture.
- TypeScript improves maintainability.
- MongoDb is mature and widely supported.

---

## Alternatives Considered

### 1. Separate frontend + backend (e.g., React + FastAPI)
Rejected due to:
- Increased deployment complexity
- Extra authentication surface

### 2. Pure SPA with client-side API calls
Rejected due to:
- SEO limitations
- Increased client complexity

---

## Consequences

### Positive
- Unified full-stack codebase
- Strong type safety
- Easy deployment
- Good performance defaults

### Negative
- Tied to Node runtime
- Requires careful separation of server/client logic

---

## Review Trigger

Revisit if:
- We need extreme horizontal scaling
- We adopt microservices
- Authentication requirements change significantly