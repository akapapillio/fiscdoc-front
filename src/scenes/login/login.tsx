import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth(); // On récupère la fonction login depuis notre contexte

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(email, password);
      // Si le login réussit, le contexte met à jour le token et on redirige vers l'accueil
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Identifiants incorrects');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>FiscDoc</h2>
        <p style={styles.subtitle}>Espace Agent</p>

        {/* Affichage de l'erreur en cas de mauvais identifiants */}
        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email (ex: jean.dupont@test.com)</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Mot de passe (ex: motdepasse_bidon)</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              style={styles.input}
            />
          </div>

          <button type="submit" style={styles.button} disabled={isSubmitting}>
            {isSubmitting ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
        
        {/* Lien administrateur discret en bas, comme demandé */}
        <div style={styles.adminFooter}>
          <a href="/admin-login" onClick={(e) => e.preventDefault()} style={styles.adminLink}>
            Accès Administrateur
          </a>
        </div>
      </div>
    </div>
  );
}

// Styles basiques en ligne (vous pourrez les passer en CSS/Tailwind plus tard)
const styles: { [key: string]: React.CSSProperties } = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f3f4f6' },
  card: { backgroundColor: 'white', padding: '2.5rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' },
  title: { textAlign: 'center', margin: '0 0 5px 0', color: '#1f2937', fontSize: '24px' },
  subtitle: { textAlign: 'center', margin: '0 0 20px 0', color: '#6b7280', fontSize: '14px' },
  error: { backgroundColor: '#fee2e2', color: '#b91c1c', padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '14px', textAlign: 'center' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '5px' },
  label: { fontSize: '13px', fontWeight: 'bold', color: '#4b5563' },
  input: { padding: '10px', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '14px' },
  button: { padding: '10px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' },
  adminFooter: { marginTop: '25px', textAlign: 'center', borderTop: '1px solid #e5e7eb', paddingTop: '15px' },
  adminLink: { fontSize: '12px', color: '#9ca3af', textDecoration: 'none' }
};