import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute() {
  const { user, isLoading } = useAuth();

  // On évite un clignotement vers /login le temps de vérifier le token
  if (isLoading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Vérification de la session...</div>;
  }

  // Si on a un user, on affiche les routes enfants (Outlet), sinon on redirige
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}