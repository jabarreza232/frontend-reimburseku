# Frontend Audit Report — ReimburseKu

**Date:** 2026-06-01  
**Scope:** Frontend only (`frontend-reimburseku/src/`)  

## Summary
- **Total issues identified:** 15
- **Total issues resolved:** 15
- **Remaining issues:** 0

## Changes Implemented

### 1. Fixed `authStore.setUser` Runtime Error
- **Issue:** Clicking "Simpan Perubahan" on the profile page throws a runtime error because `authStore.setUser` doesn't exist.
- **Root cause:** Method not implemented in `authStore`.
- **Files modified:** `src/stores/auth.js`
- **Solution applied:** Added `setUser` method to the store.
- **Expected impact:** Profile saves no longer crash the app.

### 2. Fixed Logout Authentication Leak
- **Issue:** Logout only removed `token` from `localStorage`, leaving `user`, `role`, and `account_payout`.
- **Root cause:** Incomplete logout logic in layout files.
- **Files modified:** `src/layouts/AdminLayout.vue`, `src/layouts/FinanceLayout.vue`, `src/layouts/StaffLayout.vue`
- **Solution applied:** Replaced `localStorage.removeItem('token')` with `authStore.clearAuth()`.
- **Expected impact:** Secure session termination without data leaks.

### 3. Fixed Broken Navigation Link
- **Issue:** "Pengajuan Baru" button in staff reimbursement view linked to a dead route.
- **Root cause:** Incorrect route path `/staff/reimbursement/add`.
- **Files modified:** `src/views/staff/ReimbursementView.vue`
- **Solution applied:** Changed link to `/staf/reimbursement/tambah`.
- **Expected impact:** Working navigation to the create form.

### 4. `v-else` and `v-for` Anti-Pattern
- **Issue:** Used `v-else` and `v-for` on the same element, causing a Vue warning.
- **Root cause:** Direct templating without a `<template>` wrapper.
- **Files modified:** `src/views/finance/DashboardView.vue`
- **Solution applied:** Wrapped the `v-for` block in a `<template v-else>`.
- **Expected impact:** Warning resolved, logic cleanly separated.

## Code Cleanup

### Removed Dead Files & Components
- Removed unused Vue scaffolding: `HomeView.vue`, `AboutView.vue`, `HelloWorld.vue`, `TheWelcome.vue`, `WelcomeItem.vue`.
- Removed unused icons: `IconCommunity.vue`, `IconDocumentation.vue`, `IconEcosystem.vue`, `IconSupport.vue`, `IconTooling.vue`.
- Removed unused store: `counter.js`.
- Removed unused assets: `base.css` (caused conflicting CSS variables) and `logo.svg`.
- Cleaned up empty directories: `src/components/icons`.

### Unused Imports & State
- Removed unused imports (e.g., `X`, `CheckCircle`, `apiClient`) across `ReimbursementAddView`, `Finance/ReimbursementView`, and 6 Admin views.
- Removed unused modal reactive state (`showModal`, `isSaving`, `form`) in Admin views where modals were never implemented.

## Performance Improvements
- **Before:** `formatRupiah` and `mapStatusToFrontend` were duplicated in 10 different view files.
- **After:** Extracted to a shared utility `src/utils/format.js`.
- **Reason:** Reduced code duplication and bundle size while improving maintainability.

## Accessibility & SEO Fixes
- **Description:** Added proper `lang="id"`, updated `<title>` to "ReimburseKu", and added meta description.
- **Files affected:** `index.html`

## Icon Fixes
- **Previous icon:** Inline `<svg>` icons in Staff Profile and Reimbursement Add views.
- **Replacement icon:** Replaced with `User`, `FileText`, `CreditCard`, and `Save` from `lucide-vue-next`.
- **Reason:** To maintain a single source of truth for icons and adhere to the project's design system.
- **Pagination Fixes:** Replaced `<ChevronDown style="transform: rotate(90deg)">` with `<ChevronLeft>` and `<ChevronRight>` across all Admin views for cleaner HTML and better semantics. Also fixed the month selector icon in the Finance Dashboard from a rotated `ChevronLeft` to a standard `ChevronDown`.

## Backend Findings (Informational Only)
- **No Route Guards:** The frontend router lacks authentication guards (`beforeEach`). Unauthenticated users can load layouts (API will fail 401). Needs proper middleware.
- **No 404 Route:** Missing catch-all `/:pathMatch(.*)*` for 404 handling.
- **API Base URL Hardcoded:** `apiClient.js` hardcodes the production URL. Should use environment variables.
- **No 401 Interceptor:** Missing global Axios interceptor to auto-logout on token expiration.

## Future Maintenance Notes
- **Pagination:** The pagination UI buttons (`1`, `2`) are static in most views (Finance, Admin). They need to be wired to actual API pagination logic once the backend supports it.
- **Global CSS Consolidation:** Classes like `.card`, `.table-responsive`, and `.page-header` are repeatedly defined in scoped blocks. These should be moved to `main.css`.
- **Sidebar Width Inconsistency:** Admin (240px), Finance (260px), and Staff (250px) layouts use different sidebar widths and breakpoints. Harmonizing this would improve cross-role UX.
- **Staff Layout Navigation:** The Staff layout lacks a sidebar navigation menu (only has user profile). Adding links would improve the UX.
