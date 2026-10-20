import React, { useState, useEffect } from 'react';
import { employeeService } from '../../services/employee.service';
import { divisionService } from '../../services/division.service';

const MOCK_ROLES = [
  { id: 1, label: 'Administrateur Système' },
  { id: 2, label: 'Employé / Agent Standard' },
  // { id: 4, label: 'Agent d\'accueil' },
  { id: 3, label: 'Chef de division' }
];

export default function EmployeesBo() {
  const token = localStorage.getItem('bo_token') || '';
  
  const [employees, setEmployees] = useState<any[]>([]);
  const [divisions, setDivisions] = useState<any[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  
  // NOUVEAU : État pour gérer le message d'erreur
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    first_name: '', last_name: '', email: '', matricule: '', password: '', is_active: true,
    division_id: '', role_id: ''
  });

  const fetchData = async () => {
    try {
      const [empData, divData] = await Promise.all([
        employeeService.getAll(token),
        divisionService.getAll(token)
      ]);
      setEmployees(empData);
      setDivisions(divData);
    } catch (error) {
      console.error("Erreur lors du chargement :", error);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, []);

  const handleOpenModal = (employee: any = null) => {
    setErrorMessage(null); // On efface les erreurs précédentes à l'ouverture
    if (employee) {
      setEditingEmployee(employee);
      setFormData({
        first_name: employee.first_name, 
        last_name: employee.last_name, 
        email: employee.email, 
        matricule: employee.matricule || '',
        password: '',
        is_active: employee.is_active,
        division_id: employee.active_assignment?.division_id || '',
        role_id: employee.active_assignment?.role_id || ''
      });
    } else {
      setEditingEmployee(null);
      setFormData({ 
        first_name: '', last_name: '', email: '', matricule: '', 
        password: '', is_active: true, division_id: '', role_id: '' 
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
      e.preventDefault();
      setErrorMessage(null); // On réinitialise l'erreur

      try {
        if (editingEmployee) {
          await employeeService.update(token, editingEmployee.id, formData);
        } else {
          await employeeService.create(token, formData);
        }
        setIsModalOpen(false);
        fetchData(); // Rafraîchir le tableau
      } catch (error: any) {
        console.error("Erreur d'enregistrement :", error);
        
        // LA CORRECTION EST ICI : on lit directement error.message
        if (error && error.message) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage("Erreur lors de l'enregistrement de l'employé. Veuillez vérifier votre connexion.");
        }
      }
    };

  const getDivisionName = (divId: number) => divisions.find(d => d.id === divId)?.name || 'Non assigné';
  const getRoleName = (roleId: number) => MOCK_ROLES.find(r => r.id === roleId)?.label || 'Aucun rôle';

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Gestion des Employés</h1>
          <p style={styles.subtitle}>Comptes utilisateurs et affectations (Divisions & Rôles)</p>
        </div>
        <button style={styles.addBtn} onClick={() => handleOpenModal()}>+ Nouvel Employé</button>
      </div>

      <div style={styles.card}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Matricule</th>
              <th style={styles.th}>Agent</th>
              <th style={styles.th}>Affectation Actuelle</th>
              <th style={styles.th}>Statut</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>Aucun agent trouvé.</td></tr>
            ) : (
              employees.map(emp => (
                <tr key={emp.id} style={styles.tr}>
                  <td style={{...styles.td, fontWeight: 'bold'}}>{emp.matricule || '---'}</td>
                  <td style={styles.td}>
                    <div>{emp.first_name} {emp.last_name}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{emp.email}</div>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.assignmentBadge}>
                      🏢 {getDivisionName(emp.active_assignment?.division_id)}
                    </div>
                    <div style={{ fontSize: '12px', color: '#4b5563', marginTop: '4px' }}>
                      👑 {getRoleName(emp.active_assignment?.role_id)}
                    </div>
                  </td>
                  <td style={styles.td}>
                    <span style={emp.is_active ? styles.statusActive : styles.statusInactive}>
                      {emp.is_active ? 'Actif' : 'Désactivé'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <button style={styles.editBtn} onClick={() => handleOpenModal(emp)}>Éditer</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h2 style={{ marginTop: 0, color: '#1f2937' }}>
              {editingEmployee ? 'Modifier l\'employé' : 'Nouvel employé'}
            </h2>
            
            {/* NOUVEAU : Affichage conditionnel de la bannière d'erreur */}
            {errorMessage && (
              <div style={styles.errorBanner}>
                <strong>⚠️ Erreur : </strong> {errorMessage}
              </div>
            )}
            
            <form onSubmit={handleSave}>
              <div style={styles.formGrid}>
                <div style={styles.formSection}>
                  <h4 style={styles.sectionTitle}>Identité & Connexion</h4>
                  
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{...styles.formGroup, flex: 1}}>
                      <label style={styles.label}>Prénom *</label>
                      <input required style={styles.input} value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} />
                    </div>
                    <div style={{...styles.formGroup, flex: 1}}>
                      <label style={styles.label}>Nom *</label>
                      <input required style={styles.input} value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} />
                    </div>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Email *</label>
                    <input required type="email" style={styles.input} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Mot de passe {editingEmployee && '(Laisser vide pour ne pas changer)'}</label>
                    <input type="password" required={!editingEmployee} style={styles.input} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder={editingEmployee ? "********" : "Créer un mot de passe"} />
                  </div>
                  
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Matricule RH</label>
                    <input style={styles.input} value={formData.matricule} onChange={e => setFormData({...formData, matricule: e.target.value})} />
                  </div>
                  
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '10px', fontSize: '14px' }}>
                    <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} />
                    Compte actif (autorisé à se connecter)
                  </label>
                </div>

                <div style={styles.formSection}>
                  <h4 style={styles.sectionTitle}>Affectation Active</h4>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 15px 0' }}>Définit où travaille l'agent et ses droits métiers.</p>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Division *</label>
                    <select required style={styles.input} value={formData.division_id} onChange={e => setFormData({...formData, division_id: e.target.value})}>
                      <option value="">Sélectionnez une division...</option>
                      {divisions.map(div => <option key={div.id} value={div.id}>{div.name}</option>)}
                    </select>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Rôle fonctionnel *</label>
                    <select required style={styles.input} value={formData.role_id} onChange={e => setFormData({...formData, role_id: e.target.value})}>
                      <option value="">Sélectionnez un rôle...</option>
                      {MOCK_ROLES.map(role => <option key={role.id} value={role.id}>{role.label}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div style={styles.modalActions}>
                <button type="button" style={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>Annuler</button>
                <button type="submit" style={styles.saveBtn}>Enregistrer l'agent</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

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
  
  assignmentBadge: { backgroundColor: '#e0e7ff', color: '#3730a3', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', display: 'inline-block' },
  statusActive: { backgroundColor: '#dcfce7', color: '#166534', padding: '4px 8px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' },
  statusInactive: { backgroundColor: '#fee2e2', color: '#b91c1c', padding: '4px 8px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' },
  
  editBtn: { padding: '6px 12px', backgroundColor: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' },
  
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalContent: { backgroundColor: 'white', padding: '30px', borderRadius: '8px', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' },
  
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '20px' },
  formSection: { backgroundColor: '#f9fafb', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb' },
  sectionTitle: { margin: '0 0 15px 0', color: '#1f2937', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px' },
  
  formGroup: { marginBottom: '15px' },
  label: { display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: '#374151' },
  input: { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontSize: '14px', outline: 'none' },
  
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #e5e7eb', paddingTop: '20px' },
  cancelBtn: { padding: '10px 16px', backgroundColor: 'white', color: '#4b5563', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' },
  saveBtn: { padding: '10px 16px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' },

  // NOUVEAU STYLE : Bannière d'erreur
  errorBanner: { backgroundColor: '#fee2e2', color: '#b91c1c', padding: '12px', borderRadius: '6px', marginBottom: '20px', border: '1px solid #f87171', fontSize: '14px' }
};