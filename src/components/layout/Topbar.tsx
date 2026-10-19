import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Efface le token du localStorage et met à jour le contexte
    navigate('/login'); // Redirige immédiatement vers la page de connexion
  };

  return (
    <header style={styles.header}>
      <div style={styles.leftSection}>
        {/* Ici on pourra mettre un bouton menu burger sur mobile */}
        <span style={styles.brand}>FiscDoc</span>
        
        {/* On affiche la division de l'agent comme un badge */}
        {user?.affectation_active && (
          <span style={styles.divisionBadge}>
            📍 Division : {user.affectation_active.division_name}
          </span>
        )}
      </div>

      <div style={styles.rightSection}>
        {/* On affiche le nom et prénom de l'agent connecté */}
        <span style={styles.userInfo}>
          👤 {user?.profil?.first_name} {user?.profil?.last_name}
          <span style={styles.roleText}>({user?.affectation_active?.role_label})</span>
        </span>

        {/* Le bouton de déconnexion */}
        <button onClick={handleLogout} style={styles.logoutButton}>
          Déconnexion
        </button>
      </div>
    </header>
  );
}

// Les styles extraits pour garder le JSX propre
const styles: { [key: string]: React.CSSProperties } = {
  header: { 
    height: '60px', 
    backgroundColor: '#ffffff', 
    borderBottom: '1px solid #e2e8f0', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: '0 20px' 
  },
  leftSection: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '15px' 
  },
  brand: { 
    fontWeight: 'bold', 
    color: '#1f2937',
    fontSize: '18px'
  },
  divisionBadge: {
    backgroundColor: '#e0e7ff',
    color: '#4338ca',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  rightSection: { 
    display: 'flex', 
    gap: '20px', 
    alignItems: 'center' 
  },
  userInfo: {
    fontSize: '14px',
    color: '#4b5563',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  roleText: {
    fontSize: '12px',
    color: '#9ca3af',
    fontWeight: 'normal'
  },
  logoutButton: {
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 'bold',
    transition: 'background-color 0.2s'
  }
};