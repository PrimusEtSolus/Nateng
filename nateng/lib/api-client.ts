// API utility functions for marketplace operations

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export interface ApiOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: any;
}

async function apiCall(endpoint: string, options: ApiOptions = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers: any = {
    'Content-Type': 'application/json',
  };

  const config: RequestInit = {
    method: options.method || 'GET',
    headers,
    ...(options.body && { body: JSON.stringify(options.body) }),
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || `API error: ${response.status}`);
  }

  return response.json();
}

// Products API
export const productsAPI = {
  getAll: () => apiCall('/api/products'),
  getById: (id: number) => apiCall(`/api/products/${id}`),
  create: (data: any) => apiCall('/api/products', { method: 'POST', body: data }),
  update: (id: number, data: any) => apiCall(`/api/products/${id}`, { method: 'PATCH', body: data }),
  delete: (id: number) => apiCall(`/api/products/${id}`, { method: 'DELETE' }),
};

// Listings API
export const listingsAPI = {
  getAll: (filters?: { sellerId?: number; productId?: number; available?: boolean }) => {
    const params = new URLSearchParams();
    if (filters?.sellerId) params.append('sellerId', filters.sellerId.toString());
    if (filters?.productId) params.append('productId', filters.productId.toString());
    if (filters?.available !== undefined) params.append('available', filters.available.toString());
    return apiCall(`/api/listings${params.toString() ? `?${params}` : ''}`);
  },
  getById: (id: number) => apiCall(`/api/listings/${id}`),
  create: (data: any) => apiCall('/api/listings', { method: 'POST', body: data }),
  update: (id: number, data: any) => apiCall(`/api/listings/${id}`, { method: 'PATCH', body: data }),
  delete: (id: number) => apiCall(`/api/listings/${id}`, { method: 'DELETE' }),
};

// Orders API
export const ordersAPI = {
  getAll: (filters?: { buyerId?: number; sellerId?: number; status?: string }) => {
    const params = new URLSearchParams();
    if (filters?.buyerId) params.append('buyerId', filters.buyerId.toString());
    if (filters?.sellerId) params.append('sellerId', filters.sellerId.toString());
    if (filters?.status) params.append('status', filters.status);
    return apiCall(`/api/orders${params.toString() ? `?${params}` : ''}`);
  },
  getById: (id: number) => apiCall(`/api/orders/${id}`),
  create: (data: any) => apiCall('/api/orders', { method: 'POST', body: data }),
  updateStatus: (id: number, status: string) => apiCall(`/api/orders/${id}`, { method: 'PATCH', body: { status } }),
  delete: (id: number) => apiCall(`/api/orders/${id}`, { method: 'DELETE' }),
};

// Users API
export const usersAPI = {
  getAll: (role?: string) => {
    const params = role ? `?role=${role}` : '';
    return apiCall(`/api/users${params}`);
  },
  getById: (id: number) => apiCall(`/api/users/${id}`),
  create: (data: any) => apiCall('/api/users', { method: 'POST', body: data }),
  update: (id: number, data: any) => apiCall(`/api/users/${id}`, { method: 'PATCH', body: data }),
  delete: (id: number) => apiCall(`/api/users/${id}`, { method: 'DELETE' }),
  getByRole: (role: string) => apiCall(`/api/users?role=${role}`),
};
