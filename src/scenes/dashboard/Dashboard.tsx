import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { dossierService } from '../../services/dossier.service';

// MOCK des divisions pour le menu déroulant de la modale de transfert
// (À terme, cela viendra d'une route GET /divisions)
const MOCK_DIVISIONS = [
  { id: 1, name: 'Direction' },
  { id: 2, name: 'Secrétariat' },
  { id: 3, name: 'Accueil' }
];

export default function Dashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  // --- ÉTATS ---
  // File d'attente
  const [dossiers, setDossiers] = useState<any[]>([]);
  const [isLoadingDossiers, setIsLoadingDossiers] = useState(true);
  
  // Modale de transfert
  const [transferModal, setTransferModal] = useState<{ isOpen: boolean, dossierId: number | null }>({ isOpen: false, dossierId: null });
  const [transferData, setTransferData] = useState({ destination_division_id: '', new_status: 'en_cours', comment: '' });
  const [transferMessage, setTransferMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- CHARGEMENT DES DOSSIERS DE LA DIVISION ---
  const fetchDossiers = async () => {
    const divisionId = user?.affectation_active?.division_id;
    if (token && divisionId) {
      try {
        const data = await dossierService.getDossiersByDivision(token, divisionId);
        setDossiers(data);
      } catch (error) {
        console.error("Erreur de chargement de la file d'attente", error);
      } finally {
        setIsLoadingDossiers(false);
      }
    }
  };

  // Se déclenche à l'ouverture de la page
  useEffect(() => {
    fetchDossiers();
  }, [token, user]);

  // --- GESTIONNAIRES D'ÉVÉNEMENTS ---
  const handleAction = (action: string) => {
    if (action === 'CREATE') navigate('/dossiers/nouveau');
    else if (action === 'HISTORY') navigate('/historique');
    // Le bouton TRANSFER de la grille ouvre simplement la page de création pour l'instant
    // ou pourrait ouvrir une modale de recherche globale plus tard.
  };

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !transferModal.dossierId || !transferData.destination_division_id) return;

    setIsSubmitting(true);
    setTransferMessage(null);

    try {
      await dossierService.transfer(token, transferModal.dossierId, {
        destination_division_id: Number(transferData.destination_division_id),
        new_status: transferData.new_status,
        comment: transferData.comment
      });

      setTransferMessage({ type: 'success', text: 'Dossier transféré avec succès !' });
      
      // On recharge la liste : le dossier va disparaître instantanément de l'écran !
      fetchDossiers();

      // On ferme la modale après 1.5 secondes
      setTimeout(() => {
        setTransferModal({ isOpen: false, dossierId: null });
        setTransferMessage(null);
        setTransferData({ destination_division_id: '', new_status: 'en_cours', comment: '' }); // Reset form
      }, 1500);

    } catch (error: any) {
      setTransferMessage({ type: 'error', text: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- FONCTIONS UTILITAIRES ---
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'ouvert': return { bg: '#dcfce7', text: '#166534', label: 'Nouveau' };
      case 'en_cours': return { bg: '#fef3c7', text: '#92400e', label: 'En cours' };
      case 'cloture': return { bg: '#f3f4f6', text: '#4b5563', label: 'Clôturé' };
      default: return { bg: '#fee2e2', text: '#b91c1c', label: status };
    }
  };

  return (
    <div style={styles.container}>
      
      {/* En-tête */}
      <div style={styles.header}>
        <h1 style={styles.title}>Espace Opérationnel</h1>
        <p style={styles.subtitle}>
          Que souhaitez-vous faire aujourd'hui, {user?.profil?.first_name} ?
        </p>
      </div>

      {/* Les 3 actions principales */}
      <div style={styles.actionGrid}>
        <button style={styles.actionCard} onClick={() => handleAction('CREATE')}>
          <div style={{ ...styles.iconWrapper, backgroundColor: '#dcfce7', color: '#166534' }}>📁</div>
          <h3 style={styles.cardTitle}>Créer un dossier</h3>
          <p style={styles.cardDesc}>Enregistrer une nouvelle entrée</p>
        </button>

        <button style={styles.actionCard} onClick={() => handleAction('CREATE')}>
          <div style={{ ...styles.iconWrapper, backgroundColor: '#e0e7ff', color: '#3730a3' }}>🚀</div>
          <h3 style={styles.cardTitle}>Initier un transfert</h3>
          <p style={styles.cardDesc}>Nouvelle procédure d'envoi</p>
        </button>

        <button style={styles.actionCard} onClick={() => handleAction('HISTORY')}>
          <div style={{ ...styles.iconWrapper, backgroundColor: '#fef3c7', color: '#92400e' }}>⏱️</div>
          <h3 style={styles.cardTitle}>Historique de la division</h3>
          <p style={styles.cardDesc}>Consulter les derniers mouvements</p>
        </button>
      </div>

      {/* Corbeille d'arrivée (Dossiers en attente) */}
      <div style={styles.listSection}>
        <div style={styles.listHeader}>
          <h2 style={styles.listTitle}>
            Dossiers actuellement à : {user?.affectation_active?.division_name || 'Votre division'}
          </h2>
          <span style={styles.dossierCount}>{dossiers.length} dossier(s)</span>
        </div>

        {isLoadingDossiers ? (
          <div style={styles.emptyState}>Chargement de la file d'attente...</div>
        ) : dossiers.length === 0 ? (
          <div style={styles.emptyState}>Aucun dossier en attente dans votre division.</div>
        ) : (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Référence</th>
                  <th style={styles.th}>Type</th>
                  <th style={styles.th}>Date d'arrivée</th>
                  <th style={styles.th}>Statut</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {dossiers.map(dossier => {
                  const statusStyle = getStatusBadge(dossier.status);
                  const formattedDate = new Date(dossier.date).toLocaleDateString('fr-FR');
                  
                  return (
                    <tr key={dossier.id} style={styles.tr}>
                      <td style={{...styles.td, fontWeight: 'bold'}}>{dossier.reference}</td>
                      <td style={styles.td}>{dossier.type}</td>
                      <td style={{...styles.td, color: '#6b7280'}}>{formattedDate}</td>
                      <td style={styles.td}>
                        <span style={{ ...styles.badge, backgroundColor: statusStyle.bg, color: statusStyle.text }}>
                          {statusStyle.label}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button 
                            style={styles.openBtn} 
                            onClick={() => navigate(`/dossiers/${dossier.id}`)}
                          >
                            Ouvrir
                          </button>
                          <button 
                            style={styles.transferBtn} 
                            onClick={() => setTransferModal({ isOpen: true, dossierId: dossier.id })}
                          >
                            Transférer
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- MODALE DE TRANSFERT --- */}
      {transferModal.isOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={{ marginTop: 0, color: '#1f2937' }}>Transférer le dossier</h3>
            
            {transferMessage && (
              <div style={{ padding: '10px', marginBottom: '15px', borderRadius: '4px', backgroundColor: transferMessage.type === 'success' ? '#dcfce7' : '#fee2e2', color: transferMessage.type === 'success' ? '#166534' : '#b91c1c' }}>
                {transferMessage.text}
              </div>
            )}

            <form onSubmit={handleTransferSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label style={styles.label}>Division de destination *</label>
                <select 
                  required
                  style={styles.input}
                  value={transferData.destination_division_id}
                  onChange={(e) => setTransferData({...transferData, destination_division_id: e.target.value})}
                >
                  <option value="">Sélectionnez une division...</option>
                  {MOCK_DIVISIONS.map(div => (
                    <option key={div.id} value={div.id}>{div.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={styles.label}>Nouveau statut</label>
                <select 
                  style={styles.input}
                  value={transferData.new_status}
                  onChange={(e) => setTransferData({...transferData, new_status: e.target.value})}
                >
                  <option value="ouvert">Ouvert</option>
                  <option value="en_cours">En cours</option>
                  <option value="cloture">Clôturé</option>
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={styles.label}>Commentaire (optionnel)</label>
                <textarea 
                  style={{ ...styles.input, minHeight: '80px', resize: 'vertical' }}
                  placeholder="Raison du transfert ou instruction..."
                  value={transferData.comment}
                  onChange={(e) => setTransferData({...transferData, comment: e.target.value})}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" style={styles.cancelBtn} onClick={() => setTransferModal({ isOpen: false, dossierId: null })}>Annuler</button>
                <button type="submit" style={styles.submitBtn} disabled={isSubmitting}>
                  {isSubmitting ? 'Transfert en cours...' : 'Confirmer le transfert'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// --- STYLES ---
const styles: { [key: string]: React.CSSProperties } = {
  container: { padding: '30px', maxWidth: '1200px', margin: '0 auto' },
  header: { marginBottom: '40px' },
  title: { fontSize: '28px', color: '#1f2937', marginBottom: '8px', marginTop: 0 },
  subtitle: { fontSize: '16px', color: '#6b7280', margin: 0 },
  
  actionGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '50px' },
  actionCard: { backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '25px', textAlign: 'center', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', transition: 'box-shadow 0.2s' },
  iconWrapper: { width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', marginBottom: '10px' },
  cardTitle: { margin: 0, fontSize: '18px', color: '#1f2937' },
  cardDesc: { margin: 0, fontSize: '13px', color: '#6b7280', lineHeight: '1.4' },
  
  listSection: { backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' },
  listHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #f3f4f6', paddingBottom: '15px', marginBottom: '15px' },
  listTitle: { fontSize: '18px', color: '#374151', margin: 0 },
  dossierCount: { backgroundColor: '#f3f4f6', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', color: '#4b5563' },
  emptyState: { padding: '40px', textAlign: 'center', backgroundColor: '#f9fafb', borderRadius: '8px', color: '#9ca3af', border: '1px dashed #d1d5db' },
  
  tableContainer: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  th: { padding: '12px 15px', borderBottom: '2px solid #e5e7eb', color: '#6b7280', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase' },
  tr: { borderBottom: '1px solid #f3f4f6' },
  td: { padding: '15px', fontSize: '14px', color: '#1f2937', verticalAlign: 'middle' },
  badge: { padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' },
  openBtn: { padding: '6px 12px', backgroundColor: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' },
  transferBtn: { padding: '6px 12px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' },
  
  // Modale
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalContent: { backgroundColor: 'white', padding: '30px', borderRadius: '8px', width: '100%', maxWidth: '450px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' },
  label: { display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: '#374151' },
  input: { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontSize: '14px', outline: 'none' },
  cancelBtn: { padding: '10px 16px', backgroundColor: 'white', color: '#4b5563', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' },
  submitBtn: { padding: '10px 16px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }
};