const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  token?: string;
  user?: any;
  pages?: number;
  total?: number;
}

class ApiClient {
  baseUrl: string;

  constructor() {
    this.baseUrl = API_URL;
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') return localStorage.getItem('token');
    return null;
  }

  async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>)
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${this.baseUrl}${endpoint}`, { ...options, headers });
    const data: ApiResponse<T> = await res.json();

    if (!res.ok) {
      if (res.status === 401 && typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      const errorMessage = data.message || (data as any).errors?.[0]?.msg || 'API Error';
      throw new Error(errorMessage);
    }
    return data;
  }

  get<T = any>(endpoint: string, params: Record<string, any> = {}): Promise<ApiResponse<T>> {
    const qs = new URLSearchParams(params).toString();
    return this.request<T>(`${endpoint}${qs ? '?' + qs : ''}`);
  }

  post<T = any>(endpoint: string, body: any = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) });
  }

  put<T = any>(endpoint: string, body: any = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) });
  }

  delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  async uploadFile<T = any>(endpoint: string, file: File, fieldName: string = 'image'): Promise<ApiResponse<T>> {
    const token = this.getToken();
    const formData = new FormData();
    formData.append(fieldName, file);
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      body: formData,
    });
    return res.json();
  }
}

const api = new ApiClient();
export default api;

export const login = async (email: string, password: string): Promise<ApiResponse> => {
  try {
    const data = await api.post('/auth/login', { email, password });
    if (data.success && data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  } catch (e: any) {
    // Check if error message indicates verification required
    throw e;
  }
};

export const verifyOTP = async (email: string, otp: string): Promise<ApiResponse> => {
  const data = await api.post('/auth/verify-otp', { email, otp });
  if (data.success && data.token) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  }
  return data;
};

export const resendOTP = async (email: string): Promise<ApiResponse> => {
  return await api.post('/auth/resend-otp', { email });
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

export const getUser = (): any | null => {
  if (typeof window === 'undefined') return null;
  const u = localStorage.getItem('user');
  return u ? JSON.parse(u) : null;
};

export const getAcademicYear = (): any | null => {
  if (typeof window === 'undefined') return null;
  const ay = localStorage.getItem('academicYear');
  return ay ? JSON.parse(ay) : null;
};

export const setAcademicYear = (ay: any) => {
  localStorage.setItem('academicYear', JSON.stringify(ay));
};
