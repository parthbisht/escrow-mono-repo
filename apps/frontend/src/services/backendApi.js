const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3000/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload?.error?.message || payload?.message || `Request failed with status ${response.status}`);
  }

  return response.json();
}

export const backendApi = {
  listEscrows: ({ page = 1, limit = 20 } = {}) => request(`/escrows?page=${page}&limit=${limit}`),
  getEscrowById: (escrowId) => request(`/escrows/${escrowId}`),
  getEscrowsByWallet: (wallet) => request(`/escrows/address/${wallet}`),
  syncEscrows: (payload = {}) =>
    request('/sync', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
};
