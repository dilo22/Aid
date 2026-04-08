AID/
├── backend/
│   ├── api/
│   │   └── index.js
│   ├── src/
│   │   ├── config/
│   │   │   └── supabase.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── organizationController.js
│   │   │   ├── paymentController.js
│   │   │   ├── sheepController.js
│   │   │   └── userController.js
│   │   ├── middlewares/
│   │   │   ├── authMiddleware.js
│   │   │   ├── errorMiddleware.js
│   │   │   ├── rateLimitMiddleware.js
│   │   │   └── roleMiddleware.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── index.js
│   │   │   ├── organizationRoutes.js
│   │   │   ├── paymentRoutes.js
│   │   │   ├── sheepRoutes.js
│   │   │   └── userRoutes.js
│   │   ├── utils/
│   │   │   └── apiError.js
│   │   ├── app.js
│   │   └── server.js
│   ├── .env
│   ├── package.json
│   ├── package-lock.json
│   └── vercel.json
│
├── frontend/
│   ├── public/
│   │   ├── favicon.svg
│   │   ├── icons.svg
│   │   └── _redirects
│   ├── src/
│   │   ├── api/
│   │   │   ├── authApi.js
│   │   │   ├── client.js
│   │   │   ├── organizationsApi.js
│   │   │   ├── paymentsApi.js
│   │   │   ├── profilesApi.js
│   │   │   ├── sheepApi.js
│   │   │   └── usersApi.js
│   │   ├── assets/
│   │   │   ├── hero.png
│   │   │   ├── react.svg
│   │   │   └── vite.svg
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── AppLayout.jsx
│   │   │   │   ├── HomeRedirect.jsx
│   │   │   │   ├── ProtectedRoute.jsx
│   │   │   │   └── PublicOnlyRoute.jsx
│   │   │   └── ui/
│   │   │       ├── Loader.jsx
│   │   │       └── StatusBadge.jsx
│   │   ├── constants/
│   │   │   └── sheep.js
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx
│   │   ├── hooks/
│   │   │   └── useSheepManagement.js
│   │   ├── lib/
│   │   │   └── supabase.js
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   ├── AdminOrganizationsManagementCard.jsx
│   │   │   │   ├── AdminOrganizationsModal.jsx
│   │   │   │   ├── AdminOrganizationsPage.jsx
│   │   │   │   ├── AdminProfilesManagementCard.jsx
│   │   │   │   ├── AdminProfilesModals.jsx
│   │   │   │   ├── AdminProfilesPage.jsx
│   │   │   │   ├── AdminSheepManagementCard.jsx
│   │   │   │   ├── AdminSheepModal.jsx
│   │   │   │   └── AdminSheepPage.jsx
│   │   │   ├── auth/
│   │   │   │   ├── ChangePasswordPage.jsx
│   │   │   │   ├── ForgotPasswordPage.jsx
│   │   │   │   ├── LoginPage.jsx
│   │   │   │   ├── RegisterPage.jsx
│   │   │   │   └── ResetPasswordPage.jsx
│   │   │   ├── fidel/
│   │   │   │   ├── ContactPage.jsx
│   │   │   │   ├── FidelDashboard.jsx
│   │   │   │   └── FidelProfilePage.jsx
│   │   │   ├── organization/
│   │   │   │   ├── OrganizationContactPage.jsx
│   │   │   │   ├── OrganizationDashboard.jsx
│   │   │   │   └── OrganizationProfilesPage.jsx
│   │   │   ├── HomePage.jsx
│   │   │   ├── NotFoundPage.jsx
│   │   │   └── PendingApprovalPage.jsx
│   │   ├── router/
│   │   │   └── index.jsx
│   │   ├── styles/
│   │   │   ├── AdminDashboard.css
│   │   │   ├── AdminOrganizations.css
│   │   │   ├── AdminOrganizationsModal.css
│   │   │   ├── AdminProfiles.css
│   │   │   ├── AdminProfilesModals.css
│   │   │   ├── AdminSheep.css
│   │   │   ├── AdminSheepCard.css
│   │   │   ├── AdminSheepModal.css
│   │   │   ├── AppLayout.css
│   │   │   ├── AuthPages.css
│   │   │   ├── ChangePasswordPage.css
│   │   │   ├── FidelPages.css
│   │   │   ├── ForgotPasswordPage.css
│   │   │   ├── HomePage.css
│   │   │   ├── Loader.css
│   │   │   ├── NotFoundPage.css
│   │   │   ├── OrganizationPages.css
│   │   │   ├── PendingApprovalPage.css
│   │   │   └── StatusBadge.css
│   │   ├── utils/
│   │   │   ├── authErrors.js
│   │   │   ├── authGuards.js
│   │   │   ├── fidelHelpers.js
│   │   │   ├── roleRedirect.js
│   │   │   └── sheepUtils.js
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env
│   ├── .gitignore
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── README.md
│   └── vite.config.js
│
├── .gitignore
├── package.json
├── vercel.json
└── SHEMA.md