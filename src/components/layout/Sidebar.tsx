import { Link } from 'react-router-dom';

export default function Sidebar() {
  return (
    <aside style={{ width: '250px', backgroundColor: '#1e293b', color: 'white', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '20px', fontSize: '1.5rem', fontWeight: 'bold', borderBottom: '1px solid #334155' }}>
        Fiscdoc
      </div>
      <nav style={{ display: 'flex', flexDirection: 'column', padding: '10px' }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none', padding: '10px', margin: '5px 0', borderRadius: '5px', backgroundColor: '#334155' }}>
          Tableau de bord
        </Link>
        <Link to="/documents" style={{ color: 'white', textDecoration: 'none', padding: '10px', margin: '5px 0' }}>
          Mes Documents
        </Link>
      </nav>
    </aside>
  );
}