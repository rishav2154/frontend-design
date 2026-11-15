# Centralized API Endpoint Management - Product Requirements Document

## Overview
- **Summary**: Replace scattered, hardcoded API endpoint URLs across the frontend codebase with a single centralized endpoint configuration module that acts as the single source of truth for all API calls.
- **Purpose**: Eliminate inconsistent endpoint paths (e.g. some calls use `/api/auth/login`, others use `/auth/login`), reduce duplication, fix broken helper endpoints in `api.ts`, add version control and validation, and make future endpoint changes a one-file edit.
- **Target Users**: Frontend developers maintaining the Giftoria e-commerce application.

## Goals
- Establish one module (`src/lib/endpoints.ts`) that declares every API endpoint used by the app.
- Ensure every page, component, hook, and service imports endpoints exclusively from that module — no hardcoded `/api/...` strings remain in UI code.
- Add a version identifier and runtime validation so invalid endpoint references are caught early.
- Unify HTTP request handling through `apiFetch` (JSON), `apiUpload` (multipart), and `apiRaw` (non-JSON responses), removing direct `fetch`/`axios` calls from UI files.
- Preserve all existing API call behavior (same HTTP methods, same request bodies, same auth headers).

## Non-Goals
- Changing backend endpoint paths or adding new backend routes.
- Replacing the existing JWT auth mechanism.
- Refactoring unrelated UI/styling logic.
- Migrating external SDKs (Google Identity Services, Razorpay checkout.js, Supabase, Google Maps embed).
- Fixing pre-existing bugs unrelated to endpoint centralization (e.g. the missing `/api/admin/logout` and `/api/orders/:id` backend routes will be kept as-is in the config so the frontend still calls them; they remain backend concerns).

## Background & Context
A full audit of `src/` found **26 files** making API calls using **three different patterns**:
1. `apiFetch("/api/...")` — correct, hits `https://api.thedesignhive.tech/api/...`
2. `apiFetch("/...")` (no `/api/`) — **broken**, hits `https://api.thedesignhive.tech/...` which does not match backend routes. This affects the helper objects (`apiAuth`, `apiAdmin`, `apiShop`) in `api.ts`.
3. Direct `fetch()`/`axios` with hardcoded full URLs like `https://api.thedesignhive.tech/api/...` — works but duplicates the base URL.

Backend route audit (from `design-hive-back/server.js` + `otp.js`) confirms 48 endpoints. The centralized config must mirror these exact paths, including the inconsistent ones that lack the `/api/` prefix:
- `/coupons/validate/:code`
- `/admin/orders`, `/admin/orders/:id/items`, `/admin/orders/:id/status`, `/admin/orders/:id/breakdown`

## Functional Requirements
- **FR-1**: A `src/lib/endpoints.ts` module exports an `endpoints` object containing every API endpoint the frontend uses, grouped by domain (auth, admin, products, orders, checkout, addresses, reviews, coupons, phoneCover, upload).
- **FR-2**: Endpoints that take path parameters are defined as functions (e.g. `endpoints.products.detail(id)` returns `/api/products/${id}`); static endpoints are string constants.
- **FR-3**: The module exports an `API_VERSION` string and an `API_BASE` constant derived from `VITE_API_URL` (default `https://api.thedesignhive.tech`).
- **FR-4**: A `resolveEndpoint()` helper accepts either a string endpoint or an endpoint function + args and returns the resolved path; it throws a clear error if the resolved value is not a non-empty string starting with `/`.
- **FR-5**: `api.ts` is updated so `apiFetch`, a new `apiUpload` (FormData), and a new `apiRaw` (text/html) all prepend `API_BASE` and accept a centralized endpoint reference.
- **FR-6**: All 26 calling files are refactored to import endpoints from `endpoints.ts` and pass them to the api helpers; no file contains a hardcoded API path string.

## Non-Functional Requirements
- **NFR-1**: Type safety — `endpoints` is declared `as const` so TypeScript enforces valid keys at compile time.
- **NFR-2**: Backward compatible — every refactored call produces the identical HTTP request (method, URL, headers, body) as before.
- **NFR-3**: No new runtime dependencies.

## Constraints
- **Technical**: Vite + React + TypeScript; existing `apiFetch` uses native `fetch`; `axios` is already a dependency but should be removed from UI files.
- **Dependencies**: `VITE_API_URL` env var must be respected; auth token is read from `localStorage.getItem("token")`.
- **Business**: The production base URL `https://api.thedesignhive.tech` must remain the default.

## Assumptions
- The backend endpoints listed in the audit are the current source of truth for path strings.
- Files that use `axios` (AdminDashboard, AdminProducts, OrdersHistory, ProductReviews, ReviewForm) will be migrated to `apiFetch`/`apiUpload`.
- The invoice download (`apiRaw`) and image upload (`apiUpload`) require non-JSON handling.

## Acceptance Criteria

### AC-1: Centralized endpoint module exists
- **Type**: `rule`
- **Given**: The project source tree
- **When**: Inspecting `src/lib/endpoints.ts`
- **Then**: It exports `endpoints`, `API_VERSION`, `API_BASE`, and `resolveEndpoint`; every backend endpoint used by the frontend has a corresponding entry
- **Pass Condition**: File exists, exports are present, grep for backend paths matches config
- **Evidence**: File read + grep comparison

### AC-2: No hardcoded API paths in UI files
- **Type**: `rule`
- **Given**: All `.ts`/`.tsx` files under `src/` except `lib/api.ts` and `lib/endpoints.ts`
- **When**: Searching for `"/api/`, `'/api/`, `https://api.thedesignhive.tech`, `const API =`, `const API_BASE`
- **Then**: No matches except in `lib/api.ts`, `lib/endpoints.ts`, and external SDK URLs (Google/Razorpay/Maps)
- **Pass Condition**: Grep returns zero results in UI/hooks/pages/components
- **Evidence**: Grep output

### AC-3: All HTTP calls route through centralized helpers
- **Type**: `rule`
- **Given**: All source files
- **When**: Searching for `fetch(` and `axios.`
- **Then**: Matches only appear in `lib/api.ts` (and external SDK loader `googleAuth.ts`)
- **Pass Condition**: No direct `fetch(` or `axios.` in pages/components/hooks
- **Evidence**: Grep output

### AC-4: Endpoint validation works
- **Type**: `rule`
- **Given**: The `resolveEndpoint` function
- **When**: Called with an invalid value (empty string, non-string, function returning undefined)
- **Then**: It throws an Error with a descriptive message
- **Pass Condition**: Unit check or runtime test confirms throw
- **Evidence**: Test output or manual verification

### AC-5: API behavior preserved (build passes)
- **Type**: `rule`
- **Given**: The refactored codebase
- **When**: Running `npm run build` (TypeScript compile + Vite build)
- **Then**: The build succeeds with no TypeScript errors
- **Pass Condition**: Build exit code 0
- **Evidence**: Build command output

### AC-6: Runtime smoke test of key endpoints
- **Type**: `rubric`
- **Dimension**: Endpoint resolution correctness
- **Scale**: 1-5
- **Anchors**: 1 = multiple endpoints resolve to wrong URLs; 3 = most resolve correctly; 5 = every sampled endpoint resolves to the exact backend path
- **Pass Threshold**: >= 4
- **Evidence**: Runtime check of at least 10 endpoints (static + parameterized) against expected backend paths

## Open Questions
- None; the audit is complete and the design is self-contained.
