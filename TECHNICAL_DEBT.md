# NatengHub — Technical Debt & Future Improvements

## 1. Security Hardening (Completed)

- [x] Patch all IDOR vulnerabilities in API routes
- [x] Remove admin self-registration privilege escalation
- [x] Add Zod validation to all POST/PUT/PATCH handlers
- [x] Replace `any` types with proper TypeScript types
- [x] Add standardized error handling
- [x] Remove guest checkout path (require authentication for orders)
- [x] Add authentication to all admin routes
- [x] Prevent password field leaks in API responses
- [x] Add ownership checks to PATCH/DELETE endpoints

---

## 2. Performance Optimizations

### 2.1 Database Queries
- [ ] **N+1 Query Elimination**: Audit and optimize Prisma `include` chains in orders, products, and listings.
- [ ] **Connection Pooling**: Configure Prisma connection pool for high-concurrency scenarios.
- [ ] **Read Replicas**: Use Neon read replicas for analytics/admin dashboards.
- [ ] **Query Caching**: Implement Redis caching for frequently accessed data (products, listings).

### 2.2 API Response Times
- [ ] **Response Compression**: Enable gzip/brotli compression on Vercel edge.
- [ ] **Image Optimization**: Use Next.js `Image` component with Vercel Blob for automatic resizing.
- [ ] **Pagination**: Implement cursor-based pagination for large datasets (orders, messages).

### 2.3 Frontend Performance
- [ ] **Code Splitting**: Lazy-load heavy admin dashboard components.
- [ ] **Bundle Analysis**: Run `@next/bundle-analyzer` to identify large dependencies.
- [ ] **SSR/SSG Strategy**: Static-generate public pages (product listings) where possible.

---

## 3. Scalability Bottlenecks

### 3.1 Current Limitations
- [ ] **File Uploads**: Vercel Blob is fine for MVP but consider S3/R2 for multi-region.
- [ ] **WebSocket Scaling**: If real-time chat is added, consider Pusher or Ably.
- [ ] **Rate Limiting**: Current in-memory rate limiter doesn't work across serverless instances. Migrate to Redis-based rate limiting.
- [ ] **Session Store**: JWT in cookies is stateless but can't be invalidated server-side. Consider Redis session store for immediate revocation.

### 3.2 Database Scaling
- [ ] **Indexing Strategy**: Add indexes on frequently queried fields (`userId`, `orderId`, `status`, `createdAt`).
- [ ] **Partitioning**: Partition `AnalyticsEvent` and `AuditLog` tables by date.
- [ ] **Archival**: Archive old orders (>1 year) to cold storage.

---

## 4. Code Quality & Maintainability

### 4.1 Testing
- [ ] **Unit Tests**: Add Jest tests for `lib/marketplace-rules.ts`, `lib/validation.ts`, `lib/api-error.ts`.
- [ ] **Integration Tests**: Add Playwright or Vitest tests for critical API routes.
- [ ] **E2E Tests**: Automate user flows (register → list → order → deliver).
- [ ] **Security Tests**: Add Semgrep to CI pipeline to catch future IDOR/privilege escalation bugs.

### 4.2 Observability
- [ ] **Structured Logging**: Send logs to Datadog / Sentry for production debugging.
- [ ] **Error Tracking**: Integrate Sentry for frontend + backend error tracking.
- [ ] **APM**: Use Vercel Analytics + Speed Insights for performance monitoring.
- [ ] **Health Checks**: Add `/api/health` with detailed component checks (DB, Blob, Redis).

### 4.3 Developer Experience
- [ ] **TypeScript Strict Mode**: Enable `strict: true` in `tsconfig.json`.
- [ ] **Husky + lint-staged**: Run ESLint + Prettier on pre-commit.
- [ ] **Zod Schema Co-location**: Move schemas closer to route handlers or use barrel exports.
- [ ] **API Documentation**: Add OpenAPI/Swagger docs for all endpoints.

---

## 5. Feature Enhancements

### 5.1 Marketplace Features
- [ ] **Product Reviews & Ratings**: Allow buyers to rate farmers/bulkBuyers.
- [ ] **Advanced Search**: Full-text search with filters (price range, location, rating).
- [ ] **Order Tracking**: Real-time GPS tracking for delivery.
- [ ] **Payment Integration**: GCash / PayMongo payment gateway.
- [ ] **Inventory Alerts**: Notify sellers when listings run low.
- [ ] **Bulk Order Requests**: Buyers can request bulk pricing from sellers.

### 5.2 Admin Features
- [ ] **Dashboard Widgets**: Customizable admin dashboard with drag-and-drop widgets.
- [ ] **CSV Export**: Export users, orders, products to CSV.
- [ ] **Bulk Actions**: Bulk ban/unban, bulk product deletion.
- [ ] **Role Management**: Create custom roles with granular permissions.

### 5.3 User Experience
- [ ] **Onboarding Wizard**: Multi-step onboarding for new users.
- [ ] **Profile Verification**: ID verification for farmers and bulkBuyers.
- [ ] **Multi-language**: i18n support (English, Filipino, Ilocano).
- [ ] **Mobile App**: React Native or PWA for mobile-first experience.

---

## 6. Infrastructure & DevOps

### 6.1 CI/CD
- [ ] **GitHub Actions**: Automated lint, test, build on every PR.
- [ ] **Preview Deployments**: Vercel preview URLs for every PR.
- [ ] **Database Migrations**: Run `prisma migrate deploy` in CI before deployment.

### 6.2 Security
- [ ] **Dependency Auditing**: Run `npm audit` + `snyk` in CI.
- [ ] **Secret Scanning**: Use GitGuardian or `truffleHog` to prevent secret leaks.
- [ ] **CORS Hardening**: Restrict CORS origins in production.
- [ ] **CSP Headers**: Add Content-Security-Policy headers.

### 6.3 Monitoring
- [ ] **Uptime Monitoring**: Use UptimeRobot or Pingdom.
- [ ] **Database Monitoring**: Neon dashboard + query performance insights.
- [ ] **Error Budgets**: Define SLOs (99.9% uptime, <200ms p95 latency).

---

## 7. Known Issues & Risks

| Issue | Severity | Mitigation |
|-------|----------|------------|
| In-memory rate limiter doesn't scale across serverless | Medium | Migrate to Redis |
| JWT tokens can't be invalidated before expiry | Low | Implement refresh token rotation |
| No automated tests for critical paths | High | Add Jest + Playwright |
| Prisma client singleton may cause connection leaks in serverless | Medium | Use `prisma.$disconnect()` in edge runtime |
| No input sanitization for HTML content (XSS risk) | Medium | Use DOMPurify or similar library |

---

## 8. Roadmap

| Quarter | Focus Area |
|---------|-----------|
| Q1 2025 | Security hardening, testing, CI/CD |
| Q2 2025 | Payment integration, order tracking, mobile responsiveness |
| Q3 2025 | Advanced search, reviews/ratings, inventory management |
| Q4 2025 | Multi-language, mobile app, analytics enhancements |

</parameter>
<task_progress>
- [x] Explore API routes structure
- [x] Examine lib/types.ts
- [x] Review Prisma schema
- [x] Review middleware
- [x] Create comprehensive plan
- [x] Create lib/validation-schemas.ts
- [x] Create lib/api-error.ts
- [x] Phase 1: Patch all IDOR/Privilege Escalation vulnerabilities
- [x] Phase 2: Add Zod validation & standardize error handling
- [x] Phase 3: Create ARCHITECTURE.md
- [x] Phase 3: Create TECHNICAL_DEBT.md
- [ ] Phase 4: Run lint, build, and git commit/push
</task_progress>
</write_to_file>