// src/lib/api.js
const BASE_URL = ''; // kosong karena kita panggil /api/... langsung (same origin)

export async function apiFetch(endpoint, options = {}) {
  // Ambil token dari localStorage (hanya di client-side)
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    let data;
    try {
      data = await response.json();
    } catch {
      data = {};
    }

    if (!response.ok) {
      throw new Error(data.message || `Error ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`API error di ${endpoint}:`, error);
    throw error; // biar bisa ditangkap di component dengan try/catch
  }
}

// Helper biar lebih singkat dipakai
export const get = (endpoint) => apiFetch(endpoint, { method: 'GET' });
export const post = (endpoint, body) => apiFetch(endpoint, { method: 'POST', body: JSON.stringify(body) });
export const put = (endpoint, body) => apiFetch(endpoint, { method: 'PUT', body: JSON.stringify(body) });