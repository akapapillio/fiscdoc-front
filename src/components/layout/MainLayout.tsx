import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function MainLayout() {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', backgroundColor: '#f8fafc' }}>
      <Sidebar />
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
        <Topbar />
        {/* Zone de contenu défilante */}
        <main style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
          <Outlet /> 
        </main>
      </div>
    </div>
  );
}