import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000/api/',
  headers: { 'Content-Type': 'application/json' },
});

export async function apiFetch<T>(endpoint: string, options?: object): Promise<T> {
  const response = await api.get(endpoint, options);
  return response.data;
}

export default api;
