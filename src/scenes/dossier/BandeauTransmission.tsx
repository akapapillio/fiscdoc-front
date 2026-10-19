import React, { useState } from 'react';

// Constantes pour générer le tableau proprement
const DESTINATIONS = [
  { group: 'BAAF', span: 2, items: ['COMPTA', 'PERS'] },
  { group: 'CELLULE', span: 1, items: ['COMM'] },
  { group: 'CIR', span: 2, items: ['ASSIST.', 'MAINT.'] },
  { group: 'DIV.EB', span: 2, items: ['EB', 'RFM'] },
  { group: 'DIV.FLEPN', span: 3, items: ['FL', 'EPN', 'LOG'] },
  { group: 'DIV PE', span: 2, items: ['GAR', 'CPT MAT.'] },
  { group: 'SECRETARIAT', span: 1, items: ['AUTRES'] }
];

const URGENCES_COL1 = ['POUR ATTRIBUTION', 'POUR INFORMATION', 'M\'EN PARLER', 'POUR AVIS', 'POUR PROCEDURE'];
const URGENCES_COL2 = ['POUR ARCHIVE/CLASSEMENT', 'ME RAPPELER', 'POUR LECTURE TOURNANTE', 'GARDER EN INSTANCE', 'AUTRES OBSERVATIONS'];

interface BandeauProps {
  dossier: any;
  onSaveData: (newData: any) => Promise<void>;
  canEdit: Boolean ; 
}

export default function BandeauTransmission({ dossier, onSaveData , canEdit }: BandeauProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // État local basé sur le JSON du dossier (s'il existe, sinon vide)
  const [formData, setFormData] = useState({
    expediteur: dossier.data?.ministere || '',
    contact: dossier.data?.contact || '',
    destinations: dossier.data?.destinations || [] as string[],
    urgences: dossier.data?.urgences || [] as string[],
    consignes: dossier.data?.consignes || ''
  });

  const toggleSelection = (field: 'destinations' | 'urgences', item: string) => {
    if (!isEditing) return;
    setFormData(prev => {
      const list = prev[field];
      if (list.includes(item)) {
        return { ...prev, [field]: list.filter((i: string) => i !== item) };
      } else {
        return { ...prev, [field]: [...list, item] }; // Sélectionner
      }
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // On fusionne les anciennes données du dossier avec les données du bandeau
      const updatedData = { ...dossier.data, ...formData };
      await onSaveData(updatedData);
      setIsEditing(false);
    } catch (error) {
      alert("Erreur lors de la sauvegarde.");
    } finally {
      setIsSaving(false);
    }
  };

  // Fonction pour déterminer le style d'une cellule cliquable
  const getCellStyle = (field: 'destinations' | 'urgences', item: string) => {
    const isSelected = formData[field].includes(item);
    if (isSelected) return { ...styles.cell, ...styles.cellSelected, cursor: isEditing ? 'pointer' : 'default' };
    return { ...styles.cell, cursor: isEditing ? 'pointer' : 'default' };
  };

  // Formatage de la date de création du dossier
  const dateArrivee = new Date(dossier.created_at || new Date()).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'short', year: 'numeric'
  }).toUpperCase();

  return (
    <div style={styles.container}>
      <div style={styles.headerBar}>
        <h3 style={styles.title}>Fiche de Transmission (Bandeau)</h3>
        {!isEditing ? (
          /* LE BOUTON N'APPARAÎT QUE SI canEdit EST TRUE */
          canEdit && (
            <button style={styles.editBtn} onClick={() => setIsEditing(true)}> Modifier le bandeau</button>
          )
        ) : (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button style={styles.cancelBtn} onClick={() => setIsEditing(false)}>Annuler</button>
            <button style={styles.saveBtn} onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Enregistrement...' : '💾 Enregistrer'}
            </button>
          </div>
        )}
      </div>

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <tbody>
            {/* LIGNE 1 : ARRIVEE */}
            <tr>
              <th colSpan={2} style={styles.th}>ARRIVEE N°</th>
              <td colSpan={6} style={{...styles.td, textAlign: 'center', fontSize: '18px', fontWeight: 'bold', color: '#b91c1c'}}>
                {dossier.reference || dossier.id}
              </td>
              <th colSpan={5} style={styles.th}>DU : {dateArrivee}</th>
            </tr>

            {/* LIGNE 2 & 3 : EXPEDITEUR / CONTACT */}
            <tr>
              <th colSpan={2} style={styles.th}>EXPEDITEUR</th>
              <td colSpan={11} style={styles.td}>
                {isEditing ? (
                  <input style={styles.input} value={formData.expediteur} onChange={e => setFormData({...formData, expediteur: e.target.value})} placeholder="Nom du Ministère ou entité..." />
                ) : (
                  <strong>{formData.expediteur || '---'}</strong>
                )}
              </td>
            </tr>
            <tr>
              <th colSpan={2} style={styles.th}>CONTACT</th>
              <td colSpan={11} style={styles.td}>
                {isEditing ? (
                  <input style={styles.input} value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} placeholder="Numéro de téléphone ou email..." />
                ) : (
                  <strong>{formData.contact || '---'}</strong>
                )}
              </td>
            </tr>

            {/* LIGNE 4 : ENTÊTES DES DIVISIONS */}
            <tr>
              {DESTINATIONS.map((dest, idx) => (
                <th key={idx} colSpan={dest.span} style={{...styles.th, textAlign: 'center', backgroundColor: '#e5e7eb'}}>
                  {dest.group}
                </th>
              ))}
            </tr>

            {/* LIGNE 5 : SOUS-DIVISIONS CLICABLES */}
            <tr>
              {DESTINATIONS.map(dest => 
                dest.items.map(item => (
                  <td 
                    key={item} 
                    style={getCellStyle('destinations', item)} 
                    onClick={() => toggleSelection('destinations', item)}
                    title={isEditing ? "Cliquer pour sélectionner/désélectionner" : ""}
                  >
                    {item}
                  </td>
                ))
              )}
            </tr>

            {/* LIGNE 6 : URGENT */}
            <tr>
              <th colSpan={13} style={{...styles.th, textAlign: 'center', backgroundColor: '#fef2f2', color: '#b91c1c', letterSpacing: '2px', cursor: isEditing ? 'pointer' : 'default'}} onClick={() => toggleSelection('urgences', 'URGENT')}>
                {formData.urgences.includes('URGENT') ? '⚠️ URGENT (SÉLECTIONNÉ) ⚠️' : 'URGENT'}
              </th>
            </tr>

            {/* LIGNES 7 à 11 : ACTIONS & CONSIGNES */}
            {URGENCES_COL1.map((urg1, index) => {
              const urg2 = URGENCES_COL2[index];
              return (
                <tr key={index}>
                  <td colSpan={4} style={getCellStyle('urgences', urg1)} onClick={() => toggleSelection('urgences', urg1)}>
                    {urg1}
                  </td>
                  <td colSpan={4} style={getCellStyle('urgences', urg2)} onClick={() => toggleSelection('urgences', urg2)}>
                    {urg2}
                  </td>
                  {/* Le textarea prend les 5 colonnes restantes et fusionne sur 5 lignes (rowSpan=5) */}
                  {index === 0 && (
                    <td colSpan={5} rowSpan={5} style={{...styles.td, verticalAlign: 'top', backgroundColor: '#fdf8f6'}}>
                      <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>AUTRES CONSIGNES</div>
                      {isEditing ? (
                        <textarea 
                          style={styles.textarea} 
                          value={formData.consignes} 
                          onChange={e => setFormData({...formData, consignes: e.target.value})}
                          placeholder="(manuscrit) À présenter au..."
                        />
                      ) : (
                        <div style={{ whiteSpace: 'pre-wrap', fontStyle: 'italic', color: '#4b5563' }}>
                          {formData.consignes || 'Aucune consigne particulière.'}
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- STYLES ---
const styles: { [key: string]: React.CSSProperties } = {
  container: { marginTop: '20px', backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' },
  headerBar: { backgroundColor: '#f8fafc', padding: '15px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title: { margin: 0, fontSize: '16px', color: '#1e293b' },
  editBtn: { padding: '8px 12px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', color: '#334155' },
  cancelBtn: { padding: '8px 12px', backgroundColor: 'white', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', color: '#64748b' },
  saveBtn: { padding: '8px 12px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  
  tableWrapper: { padding: '20px', overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', border: '2px solid #1e293b', fontSize: '13px', fontFamily: 'Arial, sans-serif' },
  
  th: { border: '1px solid #1e293b', padding: '10px', textAlign: 'left', backgroundColor: '#f1f5f9', color: '#0f172a' },
  td: { border: '1px solid #1e293b', padding: '10px', color: '#1e293b' },
  
  // Style pour les cellules cliquables par défaut
  cell: { border: '1px solid #1e293b', padding: '10px', textAlign: 'center', transition: 'all 0.2s', userSelect: 'none' },
  
  // LE FAMEUX EFFET "BRILLER" QUAND SÉLECTIONNÉ
  cellSelected: { 
    backgroundColor: '#fef08a', // Jaune vif
    fontWeight: 'bold', 
    color: '#854d0e',
    boxShadow: 'inset 0px 0px 0px 2px #ca8a04' // Bordure intérieure jaune foncé
  },
  
  input: { width: '100%', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px', boxSizing: 'border-box' },
  textarea: { width: '100%', height: '120px', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', boxSizing: 'border-box', resize: 'vertical' }
};