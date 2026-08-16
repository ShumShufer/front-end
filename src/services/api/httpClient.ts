export class HttpClient {
  private baseUrl: string;
  private getToken?: () => string | null;

  constructor(baseUrl: string, getToken?: () => string | null) {
    this.baseUrl = baseUrl;
    this.getToken = getToken;
  }

  private headers(extra?: HeadersInit): HeadersInit {
    const token = this.getToken?.();
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...extra,
    };
  }

  private async handle<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let message = `HTTP ${response.status}`;
      try {
        const body = await response.json();
        message = body.message || message;
      } catch {}
      throw new Error(message);
    }
    if (response.status === 204) return undefined as T;
    return response.json();
  }

  async get<T>(url: string): Promise<T> {
    const res = await fetch(`${this.baseUrl}${url}`, { headers: this.headers() });
    return this.handle<T>(res);
  }

  async post<T>(url: string, data: any): Promise<T> {
    const res = await fetch(`${this.baseUrl}${url}`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(data),
    });
    return this.handle<T>(res);
  }

  async put<T>(url: string, data: any): Promise<T> {
    const res = await fetch(`${this.baseUrl}${url}`, {
      method: 'PUT',
      headers: this.headers(),
      body: JSON.stringify(data),
    });
    return this.handle<T>(res);
  }

  async patch<T>(url: string, data: any): Promise<T> {
    const res = await fetch(`${this.baseUrl}${url}`, {
      method: 'PATCH',
      headers: this.headers(),
      body: JSON.stringify(data),
    });
    return this.handle<T>(res);
  }

  async delete<T>(url: string): Promise<T> {
    const res = await fetch(`${this.baseUrl}${url}`, {
      method: 'DELETE',
      headers: this.headers(),
    });
    return this.handle<T>(res);
  }

  async upload<T>(url: string, formData: FormData): Promise<T> {
    const token = this.getToken?.();
    const res = await fetch(`${this.baseUrl}${url}`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: formData, // don't set Content-Type — browser sets multipart boundary
    });
    return this.handle<T>(res);
  }
}

