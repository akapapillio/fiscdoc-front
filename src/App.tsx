import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import Login from './scenes/login/login';
import Dashboard from './scenes/dashboard/Dashboard';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ROUTE PUBLIQUE : Indépendante, sans layout */}
          <Route path="/login" element={<Login />} />

          {/* ROUTES PRIVÉES : Verrouillées par ProtectedRoute */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/documents" element={<div><h2>Mes Documents</h2><p>Liste des documents ici...</p></div>} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;