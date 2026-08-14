import axios from 'axios';
import type {
  Order, OrderCreateData, OrderShiftData, Customer, CustomerProfile,
  DashboardStats, NeedsAttentionItem, ShopSettings
} from '../types';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const setAuthToken = (token: string | null) => {
  if (token) {
    API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('garments_token', token);
  } else {
    delete API.defaults.headers.common['Authorization'];
    localStorage.removeItem('garments_token');
  }
};

const storedToken = localStorage.getItem('garments_token');
if (storedToken) {
  setAuthToken(storedToken);
}

export const apiService = {
  login: async (email: string, password: string) => {
    const res = await API.post<{ access_token: string }>('/auth/login', { email, password });
    setAuthToken(res.data.access_token);
    return res.data;
  },
  getMe: async () => {
    const res = await API.get('/auth/me');
    return res.data;
  },
  getDashboardStats: async () => {
    const res = await API.get<DashboardStats>('/dashboard/stats');
    return res.data;
  },
  getNeedsAttention: async () => {
    const res = await API.get<{ attention_items: NeedsAttentionItem[] }>('/dashboard/attention');
    return res.data.attention_items;
  },
  getOrders: async (params?: { search?: string; status?: string; source?: string; courier?: string }) => {
    const res = await API.get<Order[]>('/orders', { params });
    return res.data;
  },
  getOrderById: async (id: number) => {
    const res = await API.get<Order>(`/orders/${id}`);
    return res.data;
  },
  checkDuplicateCustomer: async (phone: string) => {
    const res = await API.get<{ exists: boolean; customer?: any }>('/orders/check-duplicate', { params: { phone } });
    return res.data;
  },
  createOrder: async (data: OrderCreateData) => {
    const res = await API.post<Order>('/orders', data);
    return res.data;
  },
  shiftOrder: async (id: number, data: OrderShiftData) => {
    const res = await API.post<Order>(`/orders/${id}/shift`, data);
    return res.data;
  },
  notifyCustomer: async (id: number) => {
    const res = await API.post<Order>(`/orders/${id}/notify`);
    return res.data;
  },
  deliverOrder: async (id: number) => {
    const res = await API.post<Order>(`/orders/${id}/deliver`);
    return res.data;
  },
  deleteOrder: async (id: number) => {
    const res = await API.delete(`/orders/${id}`);
    return res.data;
  },
  getCustomers: async (search?: string) => {
    const res = await API.get<Customer[]>('/customers', { params: { search } });
    return res.data;
  },
  getCustomerProfile: async (id: number) => {
    const res = await API.get<CustomerProfile>(`/customers/${id}`);
    return res.data;
  },
  getSettings: async () => {
    const res = await API.get<ShopSettings>('/settings');
    return res.data;
  },
  updateSettings: async (settings: ShopSettings) => {
    const res = await API.put<ShopSettings>('/settings', settings);
    return res.data;
  }
};
