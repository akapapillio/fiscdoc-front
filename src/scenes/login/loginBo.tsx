import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function LoginBo() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (credentials.username === 'admin' && credentials.password === 'admin') {
      localStorage.setItem('bo_token', 'fake-admin-token');
      navigate('/bo');
    } else {
      setError('Identifiants incorrects .');
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>FiscDoc | Administration</h2>
          <p style={styles.subtitle}>Accès réservé au Back-Office</p>
        </div>
        
        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Identifiant Admin</label>
            <input 
              type="text" 
              style={styles.input}
              value={credentials.username}
              onChange={e => setCredentials({...credentials, username: e.target.value})}
              required
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Mot de passe</label>
            <input 
              type="password" 
              style={styles.input}
              value={credentials.password}
              onChange={e => setCredentials({...credentials, password: e.target.value})}
              required
            />
          </div>
          <button type="submit" style={styles.button}>Se connecter au BO</button>
        </form>

        {/* Pied de carte avec lien vers l'espace agent */}
        <div style={styles.footer}>
          <span style={styles.footerText}>Agent standard ?</span>
          <Link to="/login" style={styles.footerLink}>
            ← Retour à l'espace Agent
          </Link>
        </div>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  page: { 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh', 
    backgroundColor: '#0f172a' 
  },
  card: { 
    backgroundColor: 'white', 
    padding: '36px', 
    borderRadius: '12px', 
    width: '100%', 
    maxWidth: '400px', 
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25), 0 8px 10px -6px rgba(0, 0, 0, 0.2)' 
  },
  header: { 
    textAlign: 'center', 
    marginBottom: '28px' 
  },
  title: { 
    margin: '0 0 8px 0', 
    color: '#0f172a', 
    fontSize: '22px', 
    fontWeight: '700' 
  },
  subtitle: { 
    margin: 0, 
    color: '#64748b', 
    fontSize: '14px' 
  },
  error: { 
    backgroundColor: '#fee2e2', 
    color: '#b91c1c', 
    padding: '10px 12px', 
    borderRadius: '6px', 
    marginBottom: '20px', 
    fontSize: '13px', 
    textAlign: 'center',
    border: '1px solid #fecaca'
  },
  form: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '18px' 
  },
  inputGroup: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '6px' 
  },
  label: { 
    fontSize: '13px', 
    fontWeight: '600', 
    color: '#334155' 
  },
  input: { 
    padding: '10px 12px', 
    borderRadius: '6px', 
    border: '1px solid #cbd5e1', 
    outline: 'none', 
    fontSize: '14px',
    boxSizing: 'border-box',
    width: '100%'
  },
  button: { 
    marginTop: '6px',
    padding: '12px', 
    backgroundColor: '#2563eb', 
    color: 'white', 
    border: 'none', 
    borderRadius: '6px', 
    fontSize: '15px', 
    fontWeight: '600', 
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  footer: {
    marginTop: '26px',
    paddingTop: '18px',
    borderTop: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px'
  },
  footerText: {
    fontSize: '12px',
    color: '#94a3b8'
  },
  footerLink: {
    fontSize: '13px',
    color: '#2563eb',
    textDecoration: 'none',
    fontWeight: '500'
  }
};