src/
├── api/                   # Configuration Axios et appels d'API
│   ├── axiosClient.js     # Instance Axios avec baseURL et intercepteurs (JWT, etc.)
│   ├── authApi.js         # Endpoints login, register, etc.
│   ├── frontApi.js        # Endpoints publics (articles, produits, etc.)
│   └── backofficeApi.js   # Endpoints admin (gestion utilisateurs, etc.)
│
├── layouts/               # Les "coquilles" visuelles
│   ├── FrontLayout.jsx    # Header public, Footer, Barre de navigation
│   └── AdminLayout.jsx    # Sidebar admin, Topbar, contenu
│
├── pages/
│   ├── front/             # Pages Front-Office
│   │   ├── Home.jsx
│   │   ├── About.jsx
│   │   └── Login.jsx
│   └── admin/             # Pages Back-Office
│       ├── Dashboard.jsx
│       ├── Users.jsx
│       └── Settings.jsx
│
├── components/            # Composants réutilisables (Button, Input, Modal, Table...)
│
├── routes/                # Configuration des routes et guards
│   ├── ProtectedRoute.jsx # Bloque l'accès si non admin / non connecté
│   └── AppRoutes.jsx      # Définition des URL
│
├── App.jsx
└── main.jsx