import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import Login from './scenes/login/login';
import Dashboard from './scenes/dashboard/Dashboard';
import CreateDossier from './scenes/dossier/CreateDossier';
import DivisionHistory from './scenes/history/DivisionHistory';
import DossierDetail from './scenes/dossier/DossierDetail';
import SearchDossiers from './scenes/dossier/SearchDossier';

// --- Imports Back-Office ---
import LayoutBo from './scenes/backoffice/LayoutBo';
import LoginBo from './scenes/login/loginBo';
import DivisionsBo from './scenes/backoffice/DivisionsBo';
import EmployeesBo from './scenes/backoffice/EmployeesBo';
// import BandeauTransmission from './scenes/dossier/BandeauTransmission';

// --- Gardien de route pour le BO ---
const ProtectedRouteBo = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('bo_token');
  if (!token) return <Navigate to="/bo/login" replace />;
  // Il faut retourner children sous forme de fragment pour éviter les erreurs de type
  return <>{children}</>; 
};
// Composant d'accueil temporaire pour le BO
const DashboardBo = () => <h2>Bienvenue dans le Back-Office FiscDoc</h2>;

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ROUTES PUBLIQUES : Indépendantes, sans layout */}
          <Route path="/login" element={<Login />} />
          <Route path="/bo/login" element={<LoginBo />} /> {/* <-- Login Admin */}
          {/* <Route path="/test-bandeau" element={<BandeauTransmission />} /> */}

          {/* ROUTES PRIVÉES FRONT-OFFICE (Employés) : Verrouillées par ProtectedRoute */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dossiers/nouveau" element={<CreateDossier />} />
              <Route path="/documents" element={<div><h2>Mes Documents</h2>...</div>} />
              <Route path="/historique" element={<DivisionHistory />} />
              <Route path="/dossiers/list" element={<SearchDossiers />} /> 
              <Route path="/dossiers/:id" element={<DossierDetail />} />
            </Route>
          </Route>

          {/* ROUTES PRIVÉES BACK-OFFICE (Admin) : Verrouillées par ProtectedRouteBo */}
          <Route path="/bo" element={<ProtectedRouteBo><LayoutBo /></ProtectedRouteBo>}>
            {/* Le 'index' indique la route par défaut quand on tape juste /bo */}
            <Route index element={<DashboardBo />} />
            <Route path="divisions" element={<DivisionsBo />} />
            <Route path="employees" element={<EmployeesBo />} />
          </Route>

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;