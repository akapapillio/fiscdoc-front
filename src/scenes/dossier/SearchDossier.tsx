
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { dossierService } from '../../services/dossier.service';

export default function SearchDossiers() {
  const navigate = useNavigate();
  const { token } = useAuth();
  
  // États des filtres
  const [filters, setFilters] = useState({
    reference: '',
    status: '',
    type_id: '',
    objet: '',
    date: ''
  });

  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fonction de recherche déclenchée par le bouton
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!token) return;

    setIsLoading(true);
    try {
      const data = await dossierService.search(token, filters);
      setResults(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les 100 derniers dossiers par défaut à l'ouverture
  useEffect(() => {
    handleSearch();
    // eslint-disable-next-line
  }, [token]);

  // Fonction utilitaire pour la couleur des statuts
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'ouvert': return { bg: '#dcfce7', text: '#166534', label: 'Ouvert' };
      case 'en_cours': return { bg: '#fef3c7', text: '#92400e', label: 'En cours' };
      case 'cloture': return { bg: '#f3f4f6', text: '#4b5563', label: 'Clôturé' };
      default: return { bg: '#fee2e2', text: '#b91c1c', label: status };
    }
  };

  return (
    <div style={styles.container}>
      <button onClick={() => navigate('/')} style={styles.backButton}>← Retour au tableau de bord</button>
      
      <div style={styles.header}>
        <h1 style={styles.title}>Registre des Dossiers</h1>
        <p style={styles.subtitle}>Recherche multicritère et suivi global</p>
      </div>

      <div style={styles.layout}>
        {/* PANNEAU DES FILTRES */}
        <div style={styles.filterPanel}>
          <h3 style={styles.filterTitle}>🔍 Filtres</h3>
          
          <form onSubmit={handleSearch}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Référence (ex: DOS-)</label>
              <input 
                type="text" 
                style={styles.input} 
                placeholder="Numéro de dossier..."
                value={filters.reference}
                onChange={e => setFilters({...filters, reference: e.target.value})}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Objet du dossier</label>
              <input 
                type="text" 
                style={styles.input} 
                placeholder="Mot-clé dans l'objet..."
                value={filters.objet}
                onChange={e => setFilters({...filters, objet: e.target.value})}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Statut</label>
              <select 
                style={styles.input}
                value={filters.status}
                onChange={e => setFilters({...filters, status: e.target.value})}
              >
                <option value="">Tous les statuts</option>
                <option value="ouvert">Ouvert</option>
                <option value="en_cours">En cours</option>
                <option value="cloture">Clôturé</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Type de dossier</label>
              <select 
                style={styles.input}
                value={filters.type_id}
                onChange={e => setFilters({...filters, type_id: e.target.value})}
              >
                <option value="">Tous les types</option>
                <option value="1">Dossier Accueil</option>
                <option value="2">Demande BE</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Date de création</label>
              <input 
                type="date" 
                style={styles.input}
                value={filters.date}
                onChange={e => setFilters({...filters, date: e.target.value})}
              />
            </div>

            <button type="submit" style={styles.searchBtn} disabled={isLoading}>
              {isLoading ? 'Recherche...' : 'Appliquer les filtres'}
            </button>
            
            <button 
              type="button" 
              style={styles.resetBtn} 
              onClick={() => {
                setFilters({ reference: '', status: '', type_id: '', date: '' ,objet: ''});
                setTimeout(handleSearch, 0); // Relance la recherche avec les filtres vides
              }}
            >
              Effacer les filtres
            </button>
          </form>
        </div>

        {/* RÉSULTATS (TABLEAU) */}
        <div style={styles.resultsPanel}>
          <div style={styles.resultsHeader}>
            <span style={styles.resultsCount}>{results.length} dossier(s) trouvé(s)</span>
          </div>

          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Référence</th>
                  <th style={styles.th}>Objet</th>
                  <th style={styles.th}>Division Actuelle</th>
                  <th style={styles.th}>Date de création</th>
                  <th style={styles.th}>Statut</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {results.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={styles.emptyState}>Aucun dossier ne correspond à vos critères.</td>
                  </tr>
                ) : (
                  results.map(dossier => {
                    const statusStyle = getStatusBadge(dossier.status);
                    const formattedDate = new Date(dossier.date).toLocaleDateString('fr-FR');
                    
                    return (
                      <tr key={dossier.id} style={styles.tr}>
                        <td style={{...styles.td, fontWeight: 'bold'}}>{dossier.reference}</td>
                        <td style={styles.td}>{dossier.type}</td>
                        <td style={styles.td}>{dossier.current_division}</td>
                        <td style={{...styles.td, color: '#6b7280'}}>{formattedDate}</td>
                        <td style={styles.td}>
                          <span style={{ ...styles.badge, backgroundColor: statusStyle.bg, color: statusStyle.text }}>
                            {statusStyle.label}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <button style={styles.openBtn} onClick={() => navigate(`/dossiers/${dossier.id}`)}>
                            Ouvrir
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- STYLES ---
const styles: { [key: string]: React.CSSProperties } = {
  container: { padding: '30px', maxWidth: '1400px', margin: '0 auto' },
  backButton: { background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', marginBottom: '20px', fontSize: '14px', fontWeight: 'bold' },
  header: { marginBottom: '30px' },
  title: { fontSize: '28px', color: '#1f2937', margin: '0 0 5px 0' },
  subtitle: { fontSize: '15px', color: '#6b7280', margin: 0 },
  
  layout: { display: 'flex', gap: '25px', alignItems: 'flex-start' },
  
  // Panneau de filtres
  filterPanel: { flex: '0 0 300px', backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  filterTitle: { marginTop: 0, marginBottom: '20px', fontSize: '16px', color: '#1f2937', borderBottom: '2px solid #f3f4f6', paddingBottom: '10px' },
  formGroup: { marginBottom: '15px' },
  label: { display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '5px' },
  input: { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box' },
  searchBtn: { width: '100%', padding: '10px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' },
  resetBtn: { width: '100%', padding: '10px', backgroundColor: 'transparent', color: '#6b7280', border: '1px solid #d1d5db', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' },

  // Panneau des résultats
  resultsPanel: { flex: 1, backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' },
  resultsHeader: { padding: '15px 20px', backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' },
  resultsCount: { fontSize: '14px', fontWeight: 'bold', color: '#4b5563' },
  tableContainer: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  th: { padding: '15px 20px', borderBottom: '2px solid #e5e7eb', color: '#6b7280', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' },
  tr: { borderBottom: '1px solid #f3f4f6' },
  td: { padding: '15px 20px', fontSize: '14px', color: '#1f2937', verticalAlign: 'middle' },
  badge: { padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' },
  openBtn: { padding: '6px 14px', backgroundColor: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' },
  emptyState: { padding: '40px', textAlign: 'center', color: '#9ca3af', fontStyle: 'italic' }
};