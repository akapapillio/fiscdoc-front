import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { dossierService } from '../../services/dossier.service';
// Import du service des divisions pour populer le menu déroulant
import { divisionService } from '../../services/division.service'; 
import BandeauTransmission from './BandeauTransmission';

export default function DossierDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token , user } = useAuth();
  console.log("🔍 Agent connecté :", user);
  
  // États de la page
  const [dossier, setDossier] = useState<any>(null);
  const [circuit, setCircuit] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // États pour la modale de transfert
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [divisions, setDivisions] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transferMessage, setTransferMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const [transferData, setTransferData] = useState({ 
    destination_division_id: '', 
    new_status: 'en_cours', 
    comment: '' 
  });

  useEffect(() => {
      const fetchData = async () => {
        if (!token || !id) return;
        try {
          // 1. On charge le dossier et le circuit
          const dossierData = await dossierService.getDossierById(token, Number(id));
          setDossier(dossierData);
          
          const circuitData = await dossierService.getDossierCircuit(token, Number(id));
          setCircuit(circuitData);

          // 2. On charge les divisions pour le formulaire de transfert
          const divisionsData = await divisionService.getAll(token);
          setDivisions(divisionsData);

        } catch (error) {
          console.error("Erreur de chargement", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }, [id, token]);

  // --- LOGIQUE DE TRANSFERT ---
  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !id || !transferData.destination_division_id) return;

    setIsSubmitting(true);
    setTransferMessage(null);

    try {
      await dossierService.transfer(token, Number(id), {
        destination_division_id: Number(transferData.destination_division_id),
        new_status: transferData.new_status,
        comment: transferData.comment
      });

      setTransferMessage({ type: 'success', text: 'Dossier transféré avec succès ! Redirection...' });
      
      // Après un transfert, on redirige l'agent vers l'accueil (car le dossier a quitté sa division)
      setTimeout(() => {
        setIsTransferModalOpen(false);
        navigate('/'); 
      }, 1500);

    } catch (error: any) {
      setTransferMessage({ type: 'error', text: error.message || 'Erreur lors du transfert' });
      setIsSubmitting(false); // On réactive le bouton seulement en cas d'erreur
    }
  };
  const handleSaveBandeau = async (newData: any) => {
    if (!token || !id) return;
    try {
      // 1. Envoi au backend
      await dossierService.updateData(token, Number(id), newData);
      
      // 2. Mise à jour instantanée de l'affichage (sans recharger la page)
      setDossier((prevDossier: any) => ({ ...prevDossier, data: newData }));
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la sauvegarde du bandeau.");
      throw error; // Renvoie l'erreur au composant pour qu'il arrête son chargement
    }
  };

  if (isLoading) return <div style={styles.loading}>Chargement du dossier...</div>;
  if (!dossier) return <div style={styles.loading}>Dossier introuvable.</div>;

  return (
    <div style={styles.container}>
      <button onClick={() => navigate('/')} style={styles.backButton}>
        ← Retour au tableau de bord
      </button>

      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>{dossier.reference}</h1>
          <span style={styles.badge}>{dossier.type}</span>
        </div>
        <div style={styles.headerRight}>
          {/* Bouton pour ouvrir la modale */}
          <button style={styles.actionBtn} onClick={() => setIsTransferModalOpen(true)}>
            Transférer
          </button>
        </div>
      </div>

      <div style={styles.grid}>
        
        {/* Colonne Gauche : Données Métier */}
        <div style={styles.mainContent}>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Contenu du dossier</h3>
            {Object.entries(dossier.data).map(([key, value]) => (
              <div key={key} style={styles.infoRow}>
                <span style={styles.labelFormated}>{key.replace(/_/g, ' ')} :</span>
                <span style={styles.valueFormated}>{String(value)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Colonne Droite : Le Circuit (Frise chronologique) */}
        <div style={styles.sideContent}>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Circuit du dossier</h3>
            
            {circuit.length === 0 ? (
              <p style={{ color: '#6b7280', fontSize: '14px' }}>Aucun mouvement enregistré.</p>
            ) : (
              <div style={styles.timeline}>
                {circuit.map((etape, index) => {
                  const isLast = index === circuit.length - 1;
                  const dateFormatee = new Date(etape.date).toLocaleString('fr-FR', {
                    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                  });

                  return (
                    <div key={etape.id} style={styles.timelineItem}>
                      <div style={{ ...styles.timeDot, backgroundColor: isLast ? '#2563eb' : '#9ca3af' }}></div>
                      {!isLast && <div style={styles.timeLineConnect}></div>}
                      
                      <div style={styles.etapeContent}>
                        <div style={styles.etapeHeader}>
                          <span style={styles.etapeAction}>{etape.action}</span>
                          <span style={styles.etapeDate}>{dateFormatee}</span>
                        </div>
                        
                        <div style={styles.etapeLocation}>
                          {etape.from_division ? (
                            <span>De <strong>{etape.from_division}</strong> vers <strong>{etape.to_division}</strong></span>
                          ) : (
                            <span>Initialisé à : <strong>{etape.to_division}</strong></span>
                          )}
                        </div>
                        
                        <div style={styles.etapeAgent}>👤 Par : {etape.agent}</div>
                        
                        {etape.comment && (
                          <div style={styles.etapeComment}>💬 "{etape.comment}"</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* LE NOUVEAU BANDEAU ADMINISTRATIF */}
      <div style={{ marginTop: '30px' }}>
        <BandeauTransmission 
          dossier={dossier} 
          onSaveData={handleSaveBandeau}
          
          /* VÉRIFICATION DU DROIT :
             On vérifie si la division actuelle de l'agent est le Secrétariat (ID 2).
             Adaptez 'division_id === 2' si l'ID de votre Secrétariat est différent ! */
          canEdit={user?.affectation_active?.division_id === 2} // id div 2 ici c est le secretariat
        />
      </div>

      {/* MODALE DE TRANSFERT */}
      {isTransferModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#1f2937' }}>
              Transférer le dossier {dossier.reference}
            </h3>

            {transferMessage && (
              <div style={transferMessage.type === 'success' ? styles.msgSuccess : styles.msgError}>
                {transferMessage.text}
              </div>
            )}

            <form onSubmit={handleTransferSubmit}>
              <div style={styles.formGroup}>
                <label style={styles.labelForm}>Destination *</label>
                <select 
                  required 
                  style={styles.inputForm}
                  value={transferData.destination_division_id}
                  onChange={(e) => setTransferData({...transferData, destination_division_id: e.target.value})}
                >
                  <option value="">Sélectionnez une division...</option>
                  {divisions.map(div => (
                    <option key={div.id} value={div.id}>{div.name}</option>
                  ))}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.labelForm}>Nouveau statut</label>
                <select 
                  style={styles.inputForm}
                  value={transferData.new_status}
                  onChange={(e) => setTransferData({...transferData, new_status: e.target.value})}
                >
                  <option value="en_cours">En cours de traitement</option>
                  <option value="en_attente">En attente de validation</option>
                  <option value="rejete">Rejeté</option>
                  <option value="cloture">Clôturé</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.labelForm}>Commentaire (Optionnel)</label>
                <textarea 
                  style={{...styles.inputForm, minHeight: '80px', resize: 'vertical'}}
                  placeholder="Instructions pour la division suivante..."
                  value={transferData.comment}
                  onChange={(e) => setTransferData({...transferData, comment: e.target.value})}
                />
              </div>

              <div style={styles.modalActions}>
                <button 
                  type="button" 
                  style={styles.cancelBtn} 
                  onClick={() => setIsTransferModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  style={styles.submitBtn}
                  disabled={isSubmitting}
                >
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
  container: { padding: '30px', maxWidth: '1100px', margin: '0 auto' },
  loading: { padding: '50px', textAlign: 'center', fontSize: '18px', color: '#6b7280' },
  backButton: { background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', marginBottom: '20px', fontSize: '14px', fontWeight: 'bold' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid #e5e7eb' },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '15px' },
  title: { margin: 0, fontSize: '28px', color: '#1f2937' },
  badge: { backgroundColor: '#e0e7ff', color: '#3730a3', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' },
  headerRight: { display: 'flex', gap: '10px' },
  actionBtn: { padding: '10px 16px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
  
  grid: { display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '30px' },
  mainContent: { display: 'flex', flexDirection: 'column', gap: '20px' },
  sideContent: { display: 'flex', flexDirection: 'column', gap: '20px' },
  card: { backgroundColor: 'white', padding: '25px', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  cardTitle: { marginTop: 0, marginBottom: '20px', color: '#111827', fontSize: '18px', borderBottom: '2px solid #f3f4f6', paddingBottom: '10px' },
  
  infoRow: { display: 'flex', marginBottom: '12px', borderBottom: '1px dashed #f3f4f6', paddingBottom: '10px' },
  labelFormated: { width: '160px', color: '#6b7280', fontSize: '14px', textTransform: 'capitalize', fontWeight: 'bold' },
  valueFormated: { flex: 1, color: '#1f2937', fontSize: '15px' },

  // Styles spécifiques au Circuit
  timeline: { display: 'flex', flexDirection: 'column', marginTop: '10px' },
  timelineItem: { position: 'relative', paddingLeft: '25px', paddingBottom: '25px' },
  timeDot: { position: 'absolute', left: 0, top: '5px', width: '10px', height: '10px', borderRadius: '50%', border: '2px solid white', boxShadow: '0 0 0 1px #d1d5db' },
  timeLineConnect: { position: 'absolute', left: '4px', top: '15px', bottom: 0, width: '2px', backgroundColor: '#e5e7eb' },
  
  etapeContent: { display: 'flex', flexDirection: 'column', gap: '4px' },
  etapeHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  etapeAction: { fontWeight: 'bold', fontSize: '14px', color: '#111827' },
  etapeDate: { fontSize: '12px', color: '#6b7280' },
  etapeLocation: { fontSize: '13px', color: '#374151', backgroundColor: '#f9fafb', padding: '4px 8px', borderRadius: '4px', display: 'inline-block', alignSelf: 'flex-start', marginTop: '4px' },
  etapeAgent: { fontSize: '12px', color: '#9ca3af', marginTop: '4px' },
  etapeComment: { fontSize: '13px', color: '#92400e', backgroundColor: '#fef3c7', padding: '8px', borderRadius: '4px', marginTop: '6px', fontStyle: 'italic' },

  // --- NOUVEAUX STYLES POUR LA MODALE ---
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalContent: { backgroundColor: 'white', padding: '30px', borderRadius: '8px', width: '100%', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' },
  formGroup: { marginBottom: '20px' },
  labelForm: { display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold', color: '#374151' },
  inputForm: { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
  
  msgSuccess: { backgroundColor: '#dcfce7', color: '#166534', padding: '12px', borderRadius: '6px', marginBottom: '20px', fontSize: '14px', fontWeight: 'bold', textAlign: 'center' },
  msgError: { backgroundColor: '#fee2e2', color: '#b91c1c', padding: '12px', borderRadius: '6px', marginBottom: '20px', fontSize: '14px', fontWeight: 'bold', textAlign: 'center' },
  
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '30px' },
  cancelBtn: { padding: '10px 16px', backgroundColor: 'white', color: '#4b5563', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
  submitBtn: { padding: '10px 16px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }
};