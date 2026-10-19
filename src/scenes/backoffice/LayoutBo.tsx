import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

export default function LayoutBo() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('bo_token');
    navigate('/bo/login');
  };

  const toggleSidebar = () => {
    setIsCollapsed(prev => !prev);
  };

  const menuItems = [
    { path: '/bo', label: 'Tableau de bord', icon: '📊' },
    { path: '/bo/employees', label: 'Gestion des Employés', icon: '👥' },
    { path: '/bo/divisions', label: 'Divisions & Rôles', icon: '🏢' },
  ];

  return (
    <div style={styles.layout}>
      {/* SIDEBAR RÉTRACTABLE */}
      <aside 
        style={{ 
          ...styles.sidebar, 
          width: isCollapsed ? '72px' : '260px',
          minWidth: isCollapsed ? '72px' : '260px',
        }}
      >
        {/* EN-TÊTE LOGO + TOGGLE */}
        <div 
          style={{
            ...styles.logoContainer,
            justifyContent: isCollapsed ? 'center' : 'space-between',
            padding: isCollapsed ? '16px 8px' : '16px 20px',
          }}
        >
          {!isCollapsed && (
            <h3 style={styles.logoTitle}>FiscDoc Admin</h3>
          )}
          <button 
            onClick={toggleSidebar}
            title={isCollapsed ? 'Déplier le menu' : 'Réduire le menu'}
            style={styles.toggleBtn}
          >
            {isCollapsed ? '❯' : '❮'}
          </button>
        </div>

        {/* NAVIGATION */}
        <nav style={styles.nav}>
          {menuItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <button 
                key={item.path}
                onClick={() => navigate(item.path)}
                title={isCollapsed ? item.label : undefined}
                style={{ 
                  ...styles.navItem, 
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                  padding: isCollapsed ? '12px 0' : '12px 16px',
                  ...(isActive ? styles.navItemActive : {}) 
                }}
              >
                <span style={styles.icon}>{item.icon}</span>
                {!isCollapsed && <span style={styles.label}>{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* ZONE PRINCIPALE */}
      <main style={styles.main}>
        {/* TOPBAR */}
        <header style={styles.topbar}>
          <div style={styles.topbarTitle}>Administration Système</div>
          <div style={styles.userMenu}>
            <span style={styles.adminBadge}>👑 Admin</span>
            <button onClick={handleLogout} style={styles.logoutBtn}>Déconnexion</button>
          </div>
        </header>

        {/* CONTENU DE LA PAGE */}
        <div style={styles.content}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  layout: { 
    display: 'flex', 
    height: '100vh', 
    backgroundColor: '#f8fafc', 
    overflow: 'hidden' 
  },
  
  // Sidebar
  sidebar: { 
    backgroundColor: '#0f172a', 
    color: 'white', 
    display: 'flex', 
    flexDirection: 'column', 
    transition: 'width 0.25s ease, min-width 0.25s ease',
    overflow: 'hidden',
    boxSizing: 'border-box',
    borderRight: '1px solid #1e293b'
  },
  logoContainer: { 
    height: '70px',
    borderBottom: '1px solid #1e293b', 
    display: 'flex',
    alignItems: 'center',
    boxSizing: 'border-box'
  },
  logoTitle: { 
    margin: 0, 
    fontSize: '18px', 
    fontWeight: 'bold', 
    letterSpacing: '0.5px', 
    color: '#f8fafc',
    whiteSpace: 'nowrap'
  },
  toggleBtn: {
    backgroundColor: '#1e293b',
    color: '#94a3b8',
    border: 'none',
    borderRadius: '6px',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'background-color 0.15s, color 0.15s'
  },
  nav: { 
    padding: '16px 8px', 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '6px' 
  },
  navItem: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '14px', 
    backgroundColor: 'transparent', 
    color: '#94a3b8', 
    border: 'none', 
    borderRadius: '8px', 
    cursor: 'pointer', 
    fontSize: '14px', 
    fontWeight: '500', 
    textAlign: 'left', 
    transition: 'all 0.15s ease',
    whiteSpace: 'nowrap',
    width: '100%'
  },
  navItemActive: { 
    backgroundColor: '#1e293b', 
    color: '#ffffff' 
  },
  icon: { 
    fontSize: '18px',
    minWidth: '24px',
    textAlign: 'center'
  },
  label: {
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  
  // Main Area
  main: { 
    flex: 1, 
    display: 'flex', 
    flexDirection: 'column', 
    overflow: 'hidden', 
    minWidth: 0 
  },
  
  // Topbar
  topbar: { 
    height: '70px', 
    backgroundColor: 'white', 
    borderBottom: '1px solid #e2e8f0', 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: '0 30px',
    boxSizing: 'border-box'
  },
  topbarTitle: { 
    fontSize: '18px', 
    fontWeight: 'bold', 
    color: '#334155' 
  },
  userMenu: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '16px' 
  },
  adminBadge: { 
    backgroundColor: '#fef3c7', 
    color: '#92400e', 
    padding: '6px 12px', 
    borderRadius: '20px', 
    fontSize: '13px', 
    fontWeight: 'bold' 
  },
  logoutBtn: { 
    backgroundColor: 'transparent', 
    border: '1px solid #cbd5e1', 
    padding: '7px 14px', 
    borderRadius: '6px', 
    cursor: 'pointer', 
    fontSize: '13px', 
    color: '#475569',
    fontWeight: '500'
  },
  
  // Content Area
  content: { 
    flex: 1, 
    padding: '30px', 
    overflowY: 'auto' 
  }
};