export const BACKEND = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

// Helper to call backend endpoints with optional token
export async function apiFetch(path, options = {}, token) {
  const url = path.startsWith('http') ? path : `${BACKEND}${path.startsWith('/') ? '' : '/'}${path}`;
  const headers = options.headers || {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(url, { ...options, headers });
  return res;
}

const api = { BACKEND, apiFetch };
export default api;
