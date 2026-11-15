# Centralized API Endpoint Management - Implementation Plan

## Task 1: Create the centralized endpoint configuration module
- **Status**: `pending`
- **Priority**: high
- **Depends On**: None
- **Description**:
  - Create `src/lib/endpoints.ts` with `API_VERSION`, `API_BASE`, `endpoints` object (grouped by domain), and `resolveEndpoint()` validation helper.
  - Mirror all 48 backend endpoint paths exactly, including the non-`/api/` ones (`/coupons/validate/:code`, `/admin/orders*`).
  - Parameterized endpoints are functions; static endpoints are string constants.
  - Declare `as const` for type safety.
- **Acceptance Criteria Addressed**: AC-1, AC-4
- **Test Requirements**:
  - `rule` TR-1.1: `src/lib/endpoints.ts` exports `endpoints`, `API_VERSION`, `API_BASE`, `resolveEndpoint`. Evidence: file read.
  - `rule` TR-1.2: `resolveEndpoint("")` throws. `resolveEndpoint(() => undefined)` throws. Evidence: node test snippet output.
  - `rule` TR-1.3: Every backend path from the audit is present in `endpoints`. Evidence: grep.

## Task 2: Upgrade `src/lib/api.ts` to use centralized endpoints and add upload/raw helpers
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 1
- **Description**:
  - Rewrite `apiFetch` to accept either a string path or an endpoint function + args via `resolveEndpoint`, prepend `API_BASE`.
  - Add `apiUpload(endpoint, formData, options)` for multipart file uploads (no JSON content-type).
  - Add `apiRaw(endpoint, options)` for non-JSON responses (returns `Response.text()`).
  - Remove the broken `apiAuth`/`apiAdmin`/`apiShop` helpers (they used wrong paths); callers will use `apiFetch` with `endpoints.*` directly.
  - Keep auth token injection.
- **Acceptance Criteria Addressed**: AC-1, AC-5
- **Test Requirements**:
  - `rule` TR-2.1: `apiFetch` builds correct full URL. Evidence: code review + build.
  - `rule` TR-2.2: `apiUpload` sends FormData without JSON content-type. Evidence: code review.
  - `rule` TR-2.3: `apiRaw` returns text. Evidence: code review.

## Task 3: Refactor auth and account files
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 2
- **Description**:
  - Update `pages/Auth.tsx`, `pages/AdminLogin.tsx`, `pages/Account.tsx`, `pages/admin/AdminResetPassword.tsx`, `components/account/AddressManager.tsx`, `components/account/ProfileEditor.tsx`, `components/admin/AdminSidebar.tsx`, `components/layout/Navbar.tsx`, `hooks/useAdminAuth.ts` to use `apiFetch`/`apiRaw` + `endpoints.*`.
  - Remove hardcoded `API_BASE`, `https://api.thedesignhive.tech`, and direct `fetch`/`axios`.
- **Acceptance Criteria Addressed**: AC-2, AC-3, AC-5
- **Test Requirements**:
  - `rule` TR-3.1: No hardcoded API path strings in these files. Evidence: grep.
  - `rule` TR-3.2: No `fetch(` or `axios.` in these files. Evidence: grep.

## Task 4: Refactor admin pages
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 2
- **Description**:
  - Update `pages/admin/AdminDashboard.tsx`, `pages/admin/AdminProducts.tsx`, `pages/admin/AdminOrders.tsx`, `pages/admin/AdminCoupons.tsx`, `pages/admin/AdminUsers.tsx` to use `apiFetch`/`apiUpload` + `endpoints.*`.
  - Migrate `axios` calls to `apiFetch`/`apiUpload`.
- **Acceptance Criteria Addressed**: AC-2, AC-3, AC-5
- **Test Requirements**:
  - `rule` TR-4.1: No `axios` import or usage in admin pages. Evidence: grep.
  - `rule` TR-4.2: No hardcoded API paths. Evidence: grep.

## Task 5: Refactor shop, cart, reviews, and checkout pages
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 2
- **Description**:
  - Update `pages/Checkout.tsx`, `pages/OrdersHistory.tsx`, `pages/OrderSuccess.tsx`, `components/cart/CouponInput.tsx`, `components/reviews/ProductReviews.tsx`, `components/reviews/ReviewForm.tsx`, `hooks/useProducts.ts`, `hooks/useInvoiceDownload.ts`, `lib/uploadImage.ts`, `components/phone-cover-editor/PhoneCoverCustomizer.tsx` to use centralized helpers + endpoints.
- **Acceptance Criteria Addressed**: AC-2, AC-3, AC-5
- **Test Requirements**:
  - `rule` TR-5.1: No hardcoded API paths or direct fetch/axios in these files. Evidence: grep.

## Task 6: Run TypeScript build and verify no errors
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Tasks 1-5
- **Description**:
  - Run `npm run build` (or `tsc --noEmit` + `vite build`) and fix any type errors that arise from the refactoring.
- **Acceptance Criteria Addressed**: AC-5
- **Test Requirements**:
  - `rule` TR-6.1: `npm run build` exits with code 0. Evidence: command output.

## Task 7: Runtime endpoint resolution smoke test
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: Task 6
- **Description**:
  - Write and run a small script that resolves at least 10 endpoints (mix of static and parameterized) and asserts they equal the expected backend paths.
- **Acceptance Criteria Addressed**: AC-6
- **Test Requirements**:
  - `rubric` TR-7.1: Endpoint resolution correctness; scale 1-5; anchors 1=many wrong, 3=mostly right, 5=all correct; threshold >=4; evidence: test script output.

## Task 8: Final grep audit for any remaining hardcoded endpoints
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: Task 6
- **Description**:
  - Run final greps for hardcoded API URLs/paths and direct fetch/axios across `src/`; confirm only `lib/api.ts`, `lib/endpoints.ts`, and external SDK files contain them.
- **Acceptance Criteria Addressed**: AC-2, AC-3
- **Test Requirements**:
  - `rule` TR-8.1: Grep for `https://api.thedesignhive.tech` returns only `lib/api.ts` and `lib/endpoints.ts` (and `.env`). Evidence: grep output.
  - `rule` TR-8.2: Grep for `axios` returns no matches in `src/` (axios removed from package if unused). Evidence: grep output.
