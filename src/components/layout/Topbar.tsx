export default function Topbar() {
  return (
    <header style={{ height: '60px', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px' }}>
      <div>
        {/* Ici on pourra mettre un bouton menu burger sur mobile */}
        <span>Bienvenue sur Fiscdoc</span>
      </div>
      <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
        <span>👤 Mon Profil</span>
      </div>
    </header>
  );
}