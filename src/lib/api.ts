// src/lib/api.ts
const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    const store = JSON.parse(localStorage.getItem('auth-storage') || '{}');
    return store?.state?.token || null;
  } catch {
    return null;
  }
};

async function request<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    // Clear auth and redirect
    localStorage.removeItem('auth-storage');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

export const api = {
  get: <T>(url: string) => request<T>(url),
  post: <T>(url: string, body: unknown) =>
    request<T>(url, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(url: string, body: unknown) =>
    request<T>(url, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(url: string, body: unknown) =>
    request<T>(url, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(url: string) => request<T>(url, { method: 'DELETE' }),
};

// Typed API functions
export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ token: string; user: any }>('/api/auth/login', { email, password }),
};

export const partiesApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get<any>(`/api/parties${qs}`);
  },
  get: (id: string) => api.get<any>(`/api/parties/${id}`),
  create: (data: any) => api.post<any>('/api/parties', data),
  update: (id: string, data: any) => api.put<any>(`/api/parties/${id}`, data),
  delete: (id: string) => api.delete<any>(`/api/parties/${id}`),
};

export const loansApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get<any>(`/api/loans${qs}`);
  },
  get: (id: string) => api.get<any>(`/api/loans/${id}`),
  create: (data: any) => api.post<any>('/api/loans', data),
  close: (id: string) => api.delete<any>(`/api/loans/${id}`),
};

export const paymentsApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get<any>(`/api/payments${qs}`);
  },
  create: (data: any) => api.post<any>('/api/payments', data),
  getReceiptUrl: (id: string) => `/api/payments/${id}/receipt`,
};

export const dashboardApi = {
  get: () => api.get<any>('/api/dashboard'),
};

export const agentsApi = {
  update: (id: string, data: any) => api.put<any>(`/api/agents`, { id, ...data }),
  delete: (id: string) => api.delete<any>(`/api/agents?id=${id}`),
  list: () => api.get<any>('/api/agents'),
  create: (data: any) => api.post<any>('/api/agents', data),
  toggle: (id: string, isActive: boolean) => api.patch<any>('/api/agents', { id, isActive }),
};

export const reportsApi = {
  get: (params: Record<string, string>) => {
    const qs = '?' + new URLSearchParams(params).toString();
    return api.get<any>(`/api/reports${qs}`);
  },
  exportExcel: (params: Record<string, string>) => {
    const qs = '?' + new URLSearchParams({ ...params, format: 'excel' }).toString();
    window.open(`/api/reports${qs}`, '_blank');
  },
};

// ─── Extended API methods ────────────────────────────────────────────────────
export const docsApi = {
  agreement: (loanId: string) => `/api/documents/agreement/${loanId}`,
  noc: (loanId: string) => `/api/documents/noc/${loanId}`,
  closure: (loanId: string) => `/api/documents/closure/${loanId}`,
  passbook: (loanId: string) => `/api/loans/${loanId}/passbook`,
};

export const reminderApi = {
  send: (partyId: string, type: string) =>
    api.post<any>(`/api/parties/${partyId}/reminder`, { type }),
};

export const agentsApiExt = {
  update: (id: string, data: any) => api.put<any>('/api/agents', { id, ...data }),
  delete: (id: string) => api.delete<any>(`/api/agents?id=${id}`),
};
