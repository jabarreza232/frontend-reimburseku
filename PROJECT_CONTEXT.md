# Project Context & Developer Guidelines

This document provides essential context and background information for the `ReimburseKu` project. It is intended for future AI agents, developers, and collaborators to understand the project's purpose, architecture, and coding standards.

## 1. Project Overview
**ReimburseKu** is a Web-based Reimbursement Management System developed as a "Kerja Praktek" (Practical Work/Internship) project. It digitizes and streamlines the process of employee expense claims.
The system caters to three primary roles:
1.  **Staff:** Can submit reimbursement requests, update their profiles, and track the status of their claims.
2.  **Finance:** Responsible for reviewing claims, managing company deposits (petty cash/operational funds), approving valid requests, and uploading proof of transfer/payment.
3.  **Admin:** Oversees the entire system, managing master data (Employees, Categories, Providers, Roles) and monitoring system activity logs.

## 2. Technical Architecture
The application is strictly separated into a modern decoupled architecture:
*   **Backend (API):** Built with Laravel (PHP). It provides secure, RESTful endpoints protected by Sanctum token-based authentication. The backend is responsible for business logic, role-based access control (RBAC), and database operations.
*   **Frontend (SPA):** Built with Vue 3 (Composition API) and Vite. It consumes the Laravel API. State is managed via Pinia (e.g., holding the authentication token), and routing is handled by Vue Router.

## 3. Coding Standards & Naming Conventions
To maintain consistency, any future modifications must adhere to the following established patterns:
*   **Language:** The UI is predominantly in Indonesian to serve local users, while variables, file names, API endpoints, and code structures use English for standard software development practices.
*   **API Abstraction:** All HTTP requests must be routed through `src/api/apiClient.js` (for Axios configuration/interceptors) and abstracted as methods inside `src/api/ApiService.js`. Do not make direct Axios calls inside `.vue` components.
*   **Styling:** The project utilizes Vanilla CSS without heavy UI libraries like Tailwind or Bootstrap. Any new components should follow the existing custom CSS classes for a modern, compact, and professional dashboard aesthetic. Avoid over-engineering the CSS.
*   **Simplicity:** Code should be easy to read and functionally robust. Avoid deep nesting or overly complex abstractions if a simpler, direct approach works perfectly.

## 4. Context for Future Agents
*   **Do Not Mutate Backend:** When working on the frontend repository (`frontend-reimburseku`), do not attempt to alter the backend repository (`backend-api-reimburseku`) unless explicitly instructed. If the frontend requires a structural change from the API, document it in `BACKEND_SYNC_ISSUES.md`.
*   **Authentication:** The app relies on a Bearer token. Ensure that any new API methods respect the interceptor logic in `apiClient.js`.
*   **File Uploads:** Endpoints that require file uploads (like `saveReimbursement` or `actionApproveOrReject`) must explicitly declare `headers: { 'Content-Type': 'multipart/form-data' }` in `ApiService.js`.
