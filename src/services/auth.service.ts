const API_URL = 'http://localhost:3000/auth';

export const authService = {
  async login(email: string, password: string) {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      throw new Error('Identifiants invalides');
    }
    return response.json(); // Retourne { access_token, message }
  },

  async getMe(token: string) {
    const response = await fetch(`${API_URL}/me`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (!response.ok) {
      throw new Error('Token invalide ou expiré');
    }
    return response.json(); // Retourne { profil, roles_systemes, affectation_active }
  }
};