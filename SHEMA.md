AID/
├── backend/
│   ├── node_modules/
│   ├── src/
│   │   ├── config/
│   │   │   └── supabase.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── organizationController.js
│   │   │   ├── sheepController.js
│   │   │   └── userController.js
│   │   ├── middlewares/
│   │   │   ├── authMiddleware.js
│   │   │   ├── errorMiddleware.js
│   │   │   └── roleMiddleware.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── index.js
│   │   │   ├── organizationRoutes.js
│   │   │   ├── sheepRoutes.js
│   │   │   └── userRoutes.js
│   │   ├── utils/
│   │   │   └── apiError.js
│   │   ├── app.js
│   │   └── server.js
│   ├── .env
│   ├── package-lock.json
│   └── package.json
│
├── frontend/
│   ├── node_modules/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   │   ├── authApi.js
│   │   │   ├── client.js
│   │   │   ├── organizationsApi.js
│   │   │   ├── profilesApi.js
│   │   │   ├── sheepApi.js
│   │   │   └── usersApi.js
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── AppLayout.jsx
│   │   │   │   ├── HomeRedirect.jsx
│   │   │   │   └── ProtectedRoute.jsx
│   │   │   ├── sheep/
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
│   │   │   │   ├── AdminProfilesModal.jsx
│   │   │   │   ├── AdminProfilesPage.jsx
│   │   │   │   ├── AdminSheepManagementCard.jsx
│   │   │   │   ├── AdminSheepModal.jsx
│   │   │   │   └── AdminSheepPage.jsx
│   │   │   ├── auth/
│   │   │   │   ├── LoginPage.jsx
│   │   │   │   └── RegisterPage.jsx
│   │   │   ├── fidel/
│   │   │   │   ├── ContactPage.jsx
│   │   │   │   ├── FidelDashboard.jsx
│   │   │   │   └── FidelProfilePage.jsx
│   │   │   ├── orrganization/
│   │   │   │   └── OrganizationDashboard.jsx
                    OrganizationContactPage.jsx
                    OrganizationProfilesPage.jsx
│   │   │   ├── NotFoundPage.jsx
│   │   │   └── PendingApprovalPage.jsx
│   │   ├── router/
│   │   │   └── index.jsx
│   │   ├── styles/
│   │   │   └── admin-dashboard.css
│   │   ├── utils/
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
│   ├── package-lock.json
│   ├── package.json
│   ├── README.md
│   ├── vite.config.js
│   └── package.json
│
└── SHEMA.md