import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { dossierService } from '../../services/dossier.service';

// --- MOCK DES TYPES DE DOSSIERS ---
const MOCK_DOSSIER_TYPES = [
  {
    id: 1,
    name: 'Demande BE',
    schema: [
      { key: 'objet', label: 'Objet', type: 'text', required: true },
      { key: 'ministere', label: 'Ministère', type: 'text', required: true },
      { key: 'ref_ministere', label: 'Référence Ministère', type: 'number', required: true }
    ]
  },
  {
    id: 2,
    name: 'Autre',
    schema: [
      { key: 'info_1_autre', label: 'Autre info 1', type: 'text', required: true },
      { key: 'info_2_autre', label: 'Autre info 2', type: 'text', required: true }
    ]
  }
];

export default function CreateDossier() {
  const navigate = useNavigate();
  const { token, user } = useAuth();

  // ID de la division Secrétariat cible pour le transfert
  const SECRETARIAT_DIVISION_ID = 2;

  // 1. "Demande BE" (id: 1) est sélectionné par défaut
  const [selectedTypeId, setSelectedTypeId] = useState<number | ''>(1);
  const [formData, setFormData] = useState<Record<string, any>>({});

  // États de cycle de vie
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [createdDossier, setCreatedDossier] = useState<{ id: number; reference_code: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  //ministere 
  const [ministeresList, setMinisteresList] = useState<string[]>([]);

  useEffect(() => {
    if (!token) return;
    dossierService.getMinisteres(token)
      .then(data => setMinisteresList(data))
      .catch(err => console.error("Erreur chargement ministères :", err));
  }, [token]);

  const activeType = MOCK_DOSSIER_TYPES.find(t => t.id === selectedTypeId);

  const handleInputChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTypeId(Number(e.target.value));
    setFormData({});
    setErrorMsg(null);
  };

  // 2. Déclenchement formulaire -> Affichage Pop-up de confirmation
  const handlePreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setShowConfirmModal(true);
  };

// Validation finale dans la modale -> Appel API
  const handleConfirmCreate = async () => {
    if (!selectedTypeId || !token || !user) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const payload = {
        dossier_type_id: selectedTypeId,
        current_division_id: user.affectation_active?.division_id,
        data: formData
      };

      const response = await dossierService.create(token, payload);

      setShowConfirmModal(false);

      // CORRECTION ICI : on prend bien en compte response.dossierId
      const newId = response.dossierId || response.id || response.dossier_id;

      setCreatedDossier({
        id: Number(newId),
        reference_code: response.reference_code
      });
    } catch (error: any) {
      setErrorMsg(error.message || 'Erreur lors de la création du dossier.');
      setShowConfirmModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTransferToSecretariat = async () => {
    if (!token || !createdDossier?.id) {
      alert("Identifiant du dossier manquant pour le transfert.");
      return;
    }
    
    setIsTransferring(true);

    try {
      await dossierService.transfer(token, createdDossier.id, {
        destination_division_id: SECRETARIAT_DIVISION_ID,
        new_status: 'en_cours',
        comment: 'Transmis au Secrétariat après enregistrement initial à l\'accueil'
      });

      // Redirection immédiate vers les détails du dossier transféré
      navigate(`/dossiers/${createdDossier.id}`);
    } catch (error: any) {
      alert(error.message || 'Erreur lors du transfert vers le Secrétariat');
      setIsTransferring(false);
    }
  };

  const handleResetForm = () => {
    setCreatedDossier(null);
    setFormData({});
    setSelectedTypeId(1); // Retour sur Demande BE
    setErrorMsg(null);
  };

  // --- ÉCRAN SUCCÈS ---
// --- ÉCRAN SUCCÈS ---
  if (createdDossier) {
    // Condition : réservé aux agents de la division Accueil
    const isAgentAccueil = 
      user?.affectation_active?.division_name?.toLowerCase().includes('accueil') ||
      user?.affectation_active?.division_id === 1; // Remplacez 1 par l'ID exact si besoin

    return (
      <div style={styles.container}>
        <div style={styles.successCard}>
          <div style={styles.successIcon}>✓</div>
          <h2 style={styles.successTitle}>Dossier créé avec succès !</h2>
          <p style={styles.successSubtitle}>
            Référence officielle : <strong style={{ color: '#166534' }}>{createdDossier.reference_code}</strong>
          </p>

          <div style={styles.successActions}>
            {/* LE BOUTON N'EST VISIBLE QUE POUR L'ACCUEIL */}
            {isAgentAccueil && (
              <button
                style={styles.primaryActionBtn}
                onClick={handleTransferToSecretariat}
                disabled={isTransferring}
              >
                {isTransferring ? 'Transfert en cours...' : '➡️ Transférer au Secrétariat'}
              </button>
            )}

            <div style={styles.secondaryActions}>
              <button
                style={styles.outlineBtn}
                onClick={() => navigate(`/dossiers/${createdDossier.id}`)}
              >
                Consulter la fiche
              </button>
              <button
                style={styles.outlineBtn}
                onClick={handleResetForm}
              >
                Créer un nouveau dossier
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- FORMULAIRE PRINCIPAL ---
  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Nouveau Dossier</h2>

      {errorMsg && (
        <div style={styles.alertError}>
          {errorMsg}
        </div>
      )}

      <form onSubmit={handlePreSubmit} style={styles.form}>
        {/* ÉTAPE 1 : Type de dossier */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>Type de dossier *</label>
          <select value={selectedTypeId} onChange={handleTypeChange} style={styles.input} required>
            <option value="" disabled>-- Sélectionnez un type --</option>
            {MOCK_DOSSIER_TYPES.map(type => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>
        </div>

        {/* ÉTAPE 2 : Champs dynamiques */}
        {activeType && (
          <div style={styles.dynamicSection}>
            <h3 style={styles.sectionTitle}>Informations spécifiques ({activeType.name})</h3>

            {activeType.schema.map(field => (
              <div key={field.key} style={styles.inputGroup}>
                <label style={styles.label}>
                  {field.label} {field.required && '*'}
                </label>
                <input
                  type={field.type}
                  style={styles.input}
                  required={field.required}
                  list={field.key === 'ministere' ? 'ministeres-datalist' : undefined}
                  value={formData[field.key] ?? ''}
                  onChange={(e) => handleInputChange(field.key, e.target.value)}
                  placeholder={field.key === 'ministere' ? 'Tapez ou sélectionnez un ministère...' : ''}
                />
                {/* Datalist injectée une fois dans le formulaire */}
                {field.key === 'ministere' && (
                  <datalist id="ministeres-datalist">
                    {ministeresList.map((m, idx) => (
                      <option key={idx} value={m} />
                    ))}
                  </datalist>
                )}
              </div>
            ))}
          </div>
        )}

        <button type="submit" style={styles.submitBtn} disabled={!selectedTypeId || isSubmitting}>
          Enregistrer le dossier
        </button>
      </form>

      {/* MODALE POP-UP DE VALIDATION */}
      {showConfirmModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={styles.modalTitle}>Confirmer la création</h3>
            <p style={{ color: '#4b5563', fontSize: '14px', marginBottom: '14px' }}>
              Vérifiez les données du dossier avant de le valider :
            </p>

            <div style={styles.summaryBox}>
              <div style={styles.summaryRow}>
                <span style={styles.summaryLabel}>Type :</span>
                <strong>{activeType?.name}</strong>
              </div>
              {activeType?.schema.map(field => (
                <div key={field.key} style={styles.summaryRow}>
                  <span style={styles.summaryLabel}>{field.label} :</span>
                  <span>{formData[field.key] ? String(formData[field.key]) : '---'}</span>
                </div>
              ))}
            </div>

            <div style={styles.modalActions}>
              <button
                type="button"
                style={styles.cancelBtn}
                onClick={() => setShowConfirmModal(false)}
                disabled={isSubmitting}
              >
                Corriger
              </button>
              <button
                type="button"
                style={styles.submitBtnModal}
                onClick={handleConfirmCreate}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Création en cours...' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: { backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', maxWidth: '650px', margin: '0 auto' },
  title: { marginTop: 0, color: '#1f2937', marginBottom: '20px' },
  alertError: { padding: '12px', borderRadius: '6px', marginBottom: '20px', fontSize: '14px', fontWeight: '500', backgroundColor: '#fee2e2', color: '#b91c1c' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  dynamicSection: { backgroundColor: '#f9fafb', padding: '20px', borderRadius: '6px', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: '15px' },
  sectionTitle: { margin: '0 0 10px 0', fontSize: '15px', color: '#4b5563', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: 'bold', color: '#374151' },
  input: { padding: '10px', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '14px' },
  submitBtn: { padding: '12px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' },

  // Modale de confirmation
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalContent: { backgroundColor: 'white', padding: '24px', borderRadius: '8px', width: '100%', maxWidth: '480px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' },
  modalTitle: { margin: '0 0 10px 0', fontSize: '18px', color: '#111827' },
  summaryBox: { backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' },
  summaryRow: { display: 'flex', gap: '10px' },
  summaryLabel: { width: '140px', color: '#6b7280', fontWeight: 'bold' },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' },
  cancelBtn: { padding: '8px 16px', backgroundColor: 'white', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', color: '#4b5563' },
  submitBtnModal: { padding: '8px 16px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },

  // Écran de succès
  successCard: { textAlign: 'center', padding: '20px 0' },
  successIcon: { width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#dcfce7', color: '#15803d', fontSize: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', fontWeight: 'bold' },
  successTitle: { margin: '0 0 8px 0', fontSize: '22px', color: '#111827' },
  successSubtitle: { margin: '0 0 24px 0', fontSize: '15px', color: '#4b5563' },
  successActions: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' },
  primaryActionBtn: { padding: '12px 24px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', minWidth: '260px' },
  secondaryActions: { display: 'flex', gap: '12px' },
  outlineBtn: { padding: '8px 16px', backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', color: '#374151' }
};