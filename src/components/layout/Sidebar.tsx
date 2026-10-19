import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(prev => !prev);
  };

  const navItems = [
    { to: '/', label: 'Tableau de bord', icon: '📊' },
    { to: '/dossiers/nouveau', label: 'Nouveau dossier', icon: '➕' },
    { to: '/documents', label: 'Mes Documents', icon: '📁' },
    { to: '/dossiers/list', label: 'Recherche', icon: '🔍' },
    { to: '/historique', label: 'Historique', icon: '📜' },
  ];

  return (
    <aside
      style={{
        width: isCollapsed ? '72px' : '250px',
        minWidth: isCollapsed ? '72px' : '250px',
        backgroundColor: '#1e293b',
        color: 'white',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.25s ease, min-width 0.25s ease',
        overflow: 'hidden',
        boxSizing: 'border-box'
      }}
    >
      {/* En-tête : Titre + Bouton de rétractation */}
      <div
        style={{
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between',
          borderBottom: '1px solid #334155',
          height: '64px',
          boxSizing: 'border-box'
        }}
      >
        {!isCollapsed && (
          <span style={{ fontSize: '1.3rem', fontWeight: 'bold', letterSpacing: '0.5px' }}>
            FiscDoc
          </span>
        )}

        <button
          onClick={toggleSidebar}
          title={isCollapsed ? 'Déplier le menu' : 'Réduire le menu'}
          style={{
            background: '#334155',
            color: '#f8fafc',
            border: 'none',
            borderRadius: '6px',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          {isCollapsed ? '❯' : '❮'}
        </button>
      </div>

      {/* Liens de navigation */}
      <nav style={{ display: 'flex', flexDirection: 'column', padding: '10px 8px', gap: '6px' }}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            title={isCollapsed ? item.label : undefined}
            style={({ isActive }) => ({
              color: 'white',
              textDecoration: 'none',
              padding: isCollapsed ? '10px 0' : '10px 14px',
              borderRadius: '6px',
              backgroundColor: isActive ? '#334155' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              gap: '12px',
              fontSize: '14px',
              fontWeight: isActive ? '600' : '400',
              transition: 'background-color 0.15s ease',
              whiteSpace: 'nowrap'
            })}
          >
            <span style={{ fontSize: '16px' }}>{item.icon}</span>
            {!isCollapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}