const API_URL = 'http://localhost:3000/fiscdocback/employees';

export const employeeService = {
  async getAll(token: string) {
    const res = await fetch(API_URL, { headers: { 'Authorization': `Bearer ${token}` } });
    return res.json();
  },
  async create(token: string, data: any) {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async update(token: string, id: number, data: any) {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(data)
    });
    return res.json();
  }
};