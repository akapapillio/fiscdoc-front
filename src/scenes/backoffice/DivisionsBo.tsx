import React, { useState, useEffect } from 'react';
import { divisionService } from '../../services/division.service';

// Mock temporaire des niveaux en attendant d'avoir une route API GET /division-levels
const DIVISION_LEVELS = [
  { id: 1, label: 'Niveau 1 - Général (Accès Total)' },
  { id: 2, label: 'Niveau 2 - Secondaire (Accès Limité)' }
];

export default function DivisionsBo() {
  const token = localStorage.getItem('bo_token') || '';

  // --- ÉTATS ---
  const [divisions, setDivisions] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDivision, setEditingDivision] = useState<any>(null);
  
  // État du formulaire (On ne gère plus les règles une par une, mais juste le level_id)
  const [formData, setFormData] = useState({ 
    name: '', 
    code: '', 
    level_id: 2 // Secondaire par défaut
  });

  // --- CHARGEMENT DES DONNÉES ---
  const fetchDivisions = async () => {
    try {
      const data = await divisionService.getAll(token);
      setDivisions(data);
    } catch (error) {
      console.error("Erreur lors du chargement des divisions:", error);
    }
  };

  useEffect(() => {
    fetchDivisions();
    // eslint-disable-next-line
  }, []);

  // --- ACTIONS ---
  const handleOpenModal = (division: any = null) => {
    if (division) {
      setEditingDivision(division);
      setFormData({ 
        name: division.name, 
        code: division.code, 
        level_id: division.level_id || 2
      });
    } else {
      setEditingDivision(null);
      setFormData({ name: '', code: '', level_id: 2 });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDivision) {
        await divisionService.update(token, editingDivision.id, formData);
      } else {
        await divisionService.create(token, formData);
      }
      setIsModalOpen(false);
      fetchDivisions(); // On rafraîchit la liste pour voir les nouveaux droits
    } catch (error) {
      console.error("Erreur lors de l'enregistrement:", error);
      alert("Une erreur est survenue lors de l'enregistrement.");
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Attention : Supprimer une division peut casser l'historique des dossiers. Êtes-vous sûr ?")) {
      try {
        await divisionService.delete(token, id);
        fetchDivisions();
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
      }
    }
  };

  return (
    <div style={styles.container}>
      {/* En-tête */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Gestion des Divisions</h1>
          <p style={styles.subtitle}>Structure de l'organisation assignée par Niveaux (RBAC)</p>
        </div>
        <button style={styles.addBtn} onClick={() => handleOpenModal()}>
          + Nouvelle Division
        </button>
      </div>

      {/* Tableau des divisions */}
      <div style={styles.card}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Code</th>
              <th style={styles.th}>Nom de la division</th>
              <th style={styles.th}>Niveau (Privilège)</th>
              <th style={styles.th}>Droits de transfert effectifs</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {divisions.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
                  Aucune division trouvée.
                </td>
              </tr>
            ) : (
              divisions.map(div => {
                // Déduction de l'affichage des droits de transfert
                const isGeneral = div.sees_all || (div.allowed_transfers && div.allowed_transfers[0] === 'ALL');
                
                return (
                  <tr key={div.id} style={styles.tr}>
                    <td style={{...styles.td, fontWeight: 'bold'}}>{div.code}</td>
                    <td style={styles.td}>{div.name}</td>
                    <td style={styles.td}>
                      <span style={styles.levelBadge}>
                        {div.level_name || `Niveau ${div.level_id}`}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {isGeneral ? (
                        <span style={styles.badgeSuccess}>Toutes les divisions (Général)</span>
                      ) : (!div.allowed_transfers || div.allowed_transfers.length === 0) ? (
                        <span style={{ color: '#9ca3af', fontStyle: 'italic', fontSize: '13px' }}>Aucun transfert configuré pour ce niveau</span>
                      ) : (
                        <div style={styles.badgeContainer}>
                          {div.allowed_transfers.map((targetId: number) => {
                            const targetDiv = divisions.find(d => d.id === targetId);
                            return (
                              <span key={targetId} style={styles.badge}>
                                Vers : {targetDiv?.name || `ID ${targetId}`}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </td>
                    <td style={styles.td}>
                      <button style={styles.editBtn} onClick={() => handleOpenModal(div)}>Éditer</button>
                      <button style={styles.deleteBtn} onClick={() => handleDelete(div.id)}>Supprimer</button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* MODALE DE CRÉATION / ÉDITION */}
      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h2 style={{ marginTop: 0, color: '#1f2937' }}>
              {editingDivision ? 'Modifier la division' : 'Nouvelle division'}
            </h2>
            
            <form onSubmit={handleSave}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Nom de la division *</label>
                <input 
                  required 
                  style={styles.input} 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  placeholder="Ex: Direction des Ressources Humaines"
                />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Code / Sigle *</label>
                <input 
                  required 
                  style={styles.input} 
                  value={formData.code} 
                  onChange={e => setFormData({...formData, code: e.target.value})} 
                  placeholder="Ex: DRH"
                />
              </div>

              {/* SÉLECTION DU NIVEAU */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Niveau de privilège (Circuit) *</label>
                <select 
                  required 
                  style={styles.input} 
                  value={formData.level_id} 
                  onChange={e => setFormData({...formData, level_id: Number(e.target.value)})}
                >
                  <option value="">Sélectionnez un niveau...</option>
                  {DIVISION_LEVELS.map(level => (
                    <option key={level.id} value={level.id}>{level.label}</option>
                  ))}
                </select>
                <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
                  Les droits de transfert seront automatiquement hérités de ce niveau.
                </p>
              </div>

              <div style={styles.modalActions}>
                <button type="button" style={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>Annuler</button>
                <button type="submit" style={styles.saveBtn}>
                  {editingDivision ? 'Mettre à jour' : 'Créer la division'}
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
  container: { padding: '20px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' },
  title: { margin: 0, fontSize: '24px', color: '#1f2937' },
  subtitle: { margin: '5px 0 0 0', fontSize: '14px', color: '#6b7280' },
  addBtn: { padding: '10px 20px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
  
  card: { backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  th: { padding: '15px', backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb', color: '#6b7280', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase' },
  tr: { borderBottom: '1px solid #f3f4f6' },
  td: { padding: '15px', fontSize: '14px', color: '#1f2937', verticalAlign: 'middle' },
  
  levelBadge: { backgroundColor: '#f3f4f6', color: '#374151', padding: '4px 8px', borderRadius: '4px', fontSize: '13px', fontWeight: 'bold', border: '1px solid #d1d5db' },
  badgeContainer: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  badge: { padding: '4px 10px', backgroundColor: '#e0e7ff', color: '#3730a3', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' },
  badgeSuccess: { padding: '4px 10px', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' },
  
  editBtn: { padding: '6px 12px', backgroundColor: 'transparent', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: '4px', cursor: 'pointer', marginRight: '10px', fontSize: '13px', fontWeight: 'bold' },
  deleteBtn: { padding: '6px 12px', backgroundColor: 'transparent', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' },
  
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalContent: { backgroundColor: 'white', padding: '30px', borderRadius: '8px', width: '100%', maxWidth: '450px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' },
  formGroup: { marginBottom: '20px' },
  label: { display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: '#374151' },
  input: { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontSize: '14px', outline: 'none' },
  
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' },
  cancelBtn: { padding: '10px 16px', backgroundColor: 'white', color: '#4b5563', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' },
  saveBtn: { padding: '10px 16px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }
};