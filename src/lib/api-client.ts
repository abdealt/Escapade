// src/lib/api-client.ts
import { supabase } from '../supabase-client';

interface APIRequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  endpoint: string;
  body?: any;
  params?: Record<string, string>;
  select?: string;
}

class SupabaseAPIClient {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor() {
    this.baseUrl = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1`;
    this.headers = {
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    };
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const { data: { session } } = await supabase.auth.getSession();
    const authHeaders = { ...this.headers };
    
    if (session?.access_token) {
      authHeaders['Authorization'] = `Bearer ${session.access_token}`;
    }
    
    return authHeaders;
  }

  private buildUrl(endpoint: string, params?: Record<string, string>, select?: string): string {
    const url = new URL(`${this.baseUrl}/${endpoint}`);
    
    if (select) {
      url.searchParams.append('select', select);
    }
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }
    
    return url.toString();
  }

  async request<T>({ method, endpoint, body, params, select }: APIRequestOptions): Promise<T> {
    const url = this.buildUrl(endpoint, params, select);
    const headers = await this.getAuthHeaders();

    const config: RequestInit = {
      method,
      headers,
    };

    if (body && method !== 'GET') {
      config.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
      }

      // Pour les DELETE, il n'y a pas de contenu à retourner
      if (method === 'DELETE') {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Méthodes utilitaires
  async get<T>(endpoint: string, params?: Record<string, string>, select?: string): Promise<T> {
    return this.request<T>({ method: 'GET', endpoint, params, select });
  }

  async post<T>(endpoint: string, body: any, select?: string): Promise<T> {
    return this.request<T>({ method: 'POST', endpoint, body, select });
  }

  async put<T>(endpoint: string, body: any, params?: Record<string, string>, select?: string): Promise<T> {
    return this.request<T>({ method: 'PUT', endpoint, body, params, select });
  }

  async patch<T>(endpoint: string, body: any, params?: Record<string, string>, select?: string): Promise<T> {
    return this.request<T>({ method: 'PATCH', endpoint, body, params, select });
  }

  async delete<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    return this.request<T>({ method: 'DELETE', endpoint, params });
  }
}

export const apiClient = new SupabaseAPIClient();