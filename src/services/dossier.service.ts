// const API_URL = 'http://localhost:3000/fiscdocback/dossiers';
const API_URL = `${import.meta.env.VITE_API_URL}/dossiers`;

export const dossierService = {
  // On met à jour le type attendu pour correspondre à notre backend
  async create(token: string, payload: { dossier_type_id: number; current_division_id: number; data: any }) {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Erreur lors de la création du dossier');
    }
    return response.json();
  }, 
async getHistory(token: string, divisionId: number, search?: string, date?: string) {
    // On construit l'URL avec les filtres
    const queryParams = new URLSearchParams();
    if (search) queryParams.append('search', search);
    if (date) queryParams.append('date', date);

    const url = `${API_URL}/division/${divisionId}/history?${queryParams.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error("Erreur de récupération de l'historique");
    return response.json();
  },

  async transfer(token: string, dossierId: number, payload: { destination_division_id: number, new_status: string, comment?: string }) {
    // Adaptez la route (POST ou PATCH) selon ce que vous aviez défini dans votre contrôleur NestJS
    const response = await fetch(`${API_URL}/${dossierId}/transfer`, {
      method: 'POST', // ou 'PATCH' selon votre route
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Erreur lors du transfert');
    }
    return response.json();
  },

  // NOUVELLE MÉTHODE
  async getDossiersByDivision(token: string, divisionId: number) {
    const response = await fetch(`${API_URL}/division/${divisionId}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error("Erreur lors de la récupération des dossiers");
    return response.json();
  },
  // NOUVELLE MÉTHODE
  async getDossierCircuit(token: string, dossierId: number) {
    const response = await fetch(`${API_URL}/${dossierId}/circuit`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error("Erreur lors de la récupération du circuit");
    return response.json();
  },
  // RECHERCHE MULTICRITÈRE
  async search(token: string, filters: any) {
    const queryParams = new URLSearchParams();
    
    // On n'ajoute dans l'URL que les filtres qui ont été remplis
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        queryParams.append(key, filters[key]);
      }
    });

    const response = await fetch(`${API_URL}/search?${queryParams.toString()}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) throw new Error("Erreur lors de la recherche");
    return response.json();
  },
  
  async getDossierById(token: string, dossierId: number) {
    const response = await fetch(`${API_URL}/${dossierId}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error("Erreur lors de la récupération du dossier");
    return response.json();
  },

  async getMinisteres(token: string): Promise<string[]> {
  const res = await fetch(`${API_URL}/ministeres`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Impossible de charger les ministères");
  return res.json();
},

  async updateData(token: string, id: number, newData: any) {
    const res = await fetch(`${API_URL}/${id}/data`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ data: newData })
    });
    if (!res.ok) throw new Error("Erreur lors de la mise à jour des données");
    return res.json();
  },
};



