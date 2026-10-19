import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// --- MOCK DE L'HISTORIQUE ---
// (À terme, cela viendra d'une route backend GET /divisions/:id/history)
const MOCK_HISTORY = [
  { 
    id: 101, 
    reference: 'DOS-2026-0005', 
    action: 'CREATION', 
    date: '22/09/2026 08:30', 
    agent: 'Jean Dupont',
    description: 'Dossier créé initialement à l\'Accueil',
    currentDivision: 'Accueil'
  },
  { 
    id: 100, 
    reference: 'DOS-2026-0004', 
    action: 'TRANSFERT', 
    date: '21/09/2026 15:45', 
    agent: 'Jean Dupont',
    description: 'Transféré vers : Secrétariat',
    currentDivision: 'Direction'
  },
  { 
    id: 99, 
    reference: 'DOS-2026-0003', 
    action: 'CLOTURE', 
    date: '21/09/2026 11:12', 
    agent: 'Alice Martin',
    description: 'Dossier marqué comme résolu',
    currentDivision: 'Archives'
  }
];

export default function DivisionHistory() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // États pour gérer la recherche et la pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Fonction pour donner une couleur selon le type d'action
  const getActionColor = (action: string) => {
    switch(action) {
      case 'CREATION': return { bg: '#dcfce7', text: '#166534' };
      case 'TRANSFERT': return { bg: '#e0e7ff', text: '#3730a3' };
      case 'CLOTURE': return { bg: '#fef3c7', text: '#92400e' };
      default: return { bg: '#f3f4f6', text: '#4b5563' };
    }
  };

  // Simulation de chargement de la page suivante
  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => setIsLoadingMore(false), 1000); // Faux délai de 1 seconde
  };

  return (
    <div style={styles.wrapper}>
      {/* Bouton retour */}
      <button onClick={() => navigate('/')} style={styles.backButton}>
        ← Retour à l'espace
      </button>

      <div style={styles.container}>
        
        {/* En-tête */}
        <div style={styles.header}>
          <h2 style={styles.title}>Historique de la division</h2>
          <p style={styles.subtitle}>
            Activité récente pour : <strong>{user?.affectation_active?.division_name}</strong>
          </p>
        </div>

        {/* Barre de filtres */}
        <div style={styles.filtersContainer}>
          <input 
            type="text" 
            placeholder="🔍 Chercher une référence (ex: DOS-2026...)" 
            style={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <input 
            type="date" 
            style={styles.dateInput}
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>

        {/* Frise chronologique (Timeline) */}
        <div style={styles.timeline}>
          {MOCK_HISTORY.map((item) => {
            const colors = getActionColor(item.action);
            return (
              <div key={item.id} style={styles.timelineItem}>
                {/* Le petit point bleu sur la ligne */}
                <div style={styles.timeDot}></div>
                
                {/* La carte de l'événement */}
                <div style={styles.eventCard}>
                  
                  <div style={styles.eventHeader}>
                    <span style={styles.reference}>{item.reference}</span>
                    <span style={{ ...styles.badge, backgroundColor: colors.bg, color: colors.text }}>
                      {item.action}
                    </span>
                  </div>
                  
                  <p style={styles.eventDesc}>{item.description}</p>
                  
                  {/* LOCALISATION ACTUELLE */}
                  <div style={styles.currentLocation}>
                    📍 Actuellement à : <strong>{item.currentDivision}</strong>
                  </div>

                  <div style={styles.eventFooter}>
                    <span>👤 Par : {item.agent}</span>
                    <span>🕒 {item.date}</span>
                  </div>
                  
                </div>
              </div>
            );
          })}
        </div>

        {/* Bouton de pagination */}
        <div style={styles.paginationContainer}>
          <button style={styles.loadMoreBtn} onClick={handleLoadMore} disabled={isLoadingMore}>
            {isLoadingMore ? 'Chargement...' : 'Afficher les actions précédentes ↓'}
          </button>
        </div>

      </div>
    </div>
  );
}

// --- STYLES ---
const styles: { [key: string]: React.CSSProperties } = {
  wrapper: { maxWidth: '800px', margin: '0 auto', paddingTop: '20px', paddingBottom: '40px' },
  backButton: { background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', marginBottom: '15px', fontSize: '14px', padding: 0, fontWeight: 'bold' },
  container: { backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
  
  header: { borderBottom: '1px solid #e5e7eb', paddingBottom: '15px', marginBottom: '25px' },
  title: { marginTop: 0, color: '#1f2937', marginBottom: '5px', fontSize: '24px' },
  subtitle: { margin: 0, color: '#6b7280', fontSize: '15px' },
  
  filtersContainer: { display: 'flex', gap: '15px', marginBottom: '30px', backgroundColor: '#f9fafb', padding: '15px', borderRadius: '6px', border: '1px solid #e5e7eb' },
  searchInput: { flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '14px', outline: 'none' },
  dateInput: { padding: '10px', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '14px', outline: 'none', color: '#4b5563' },
  
  timeline: { display: 'flex', flexDirection: 'column', gap: '20px', borderLeft: '2px solid #e5e7eb', marginLeft: '10px', paddingLeft: '25px' },
  timelineItem: { position: 'relative' },
  timeDot: { position: 'absolute', left: '-32px', top: '15px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#2563eb', border: '2px solid white' },
  
  eventCard: { backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '15px', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' },
  eventHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  reference: { fontWeight: 'bold', color: '#111827', fontSize: '16px' },
  badge: { padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' },
  eventDesc: { margin: '0 0 12px 0', color: '#4b5563', fontSize: '14px', lineHeight: '1.5' },
  
  currentLocation: { backgroundColor: '#eff6ff', color: '#1e40af', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', marginBottom: '15px', display: 'inline-block', border: '1px solid #bfdbfe' },
  
  eventFooter: { display: 'flex', justifyContent: 'space-between', color: '#9ca3af', fontSize: '13px', borderTop: '1px dashed #e5e7eb', paddingTop: '10px' },
  
  paginationContainer: { marginTop: '30px', textAlign: 'center', borderTop: '1px solid #e5e7eb', paddingTop: '25px' },
  loadMoreBtn: { padding: '10px 24px', backgroundColor: 'white', color: '#374151', border: '1px solid #d1d5db', borderRadius: '20px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', transition: 'background-color 0.2s' }
};