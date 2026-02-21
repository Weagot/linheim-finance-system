import axios from 'axios';

const API_BASE_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3001/api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authApi = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  },

  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/register', { name, email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  },

  async getCurrentUser(): Promise<{ user: User }> {
    const { data } = await api.get<{ user: User }>('/auth/me');
    return data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  getUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  },
};

// Companies API
export const companiesApi = {
  async getAll() {
    const { data } = await api.get('/companies');
    return data.companies;
  },

  async create(data: any) {
    const { data: company } = await api.post('/companies', data);
    return company.company;
  },

  async update(id: string, data: any) {
    const { data: company } = await api.put(`/companies/${id}`, data);
    return company.company;
  },

  async delete(id: string) {
    const { data } = await api.delete(`/companies/${id}`);
    return data;
  },
};

// Transactions API
export const transactionsApi = {
  async getAll() {
    const { data } = await api.get('/transactions');
    return data.transactions;
  },

  async create(data: any) {
    const { data: transaction } = await api.post('/transactions', data);
    return transaction.transaction;
  },

  async update(id: string, data: any) {
    const { data: transaction } = await api.put(`/transactions/${id}`, data);
    return transaction.transaction;
  },

  async delete(id: string) {
    const { data } = await api.delete(`/transactions/${id}`);
    return data;
  },
};

// Invoices API
export const invoicesApi = {
  async getAll() {
    const { data } = await api.get('/invoices');
    return data.invoices;
  },

  async create(data: any) {
    const { data: invoice } = await api.post('/invoices', data);
    return invoice.invoice;
  },

  async update(id: string, data: any) {
    const { data: invoice } = await api.put(`/invoices/${id}`, data);
    return invoice.invoice;
  },

  async delete(id: string) {
    const { data } = await api.delete(`/invoices/${id}`);
    return data;
  },
};

// Reports API
export const reportsApi = {
  async getProfitLoss() {
    const { data } = await api.get('/reports/profit-loss');
    return data;
  },

  async getCashFlow() {
    const { data } = await api.get('/reports/cash-flow');
    return data;
  },

  async getCompanySummary() {
    const { data } = await api.get('/reports/company-summary');
    return data.summary;
  },
};

export default api;
