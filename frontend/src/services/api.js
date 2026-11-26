/**
 * Centralized API service for Constellate
 * Connects to Django REST Framework backend on http://127.0.0.1:8000
 */

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export async function apiRequest(endpoint, options = {}) {
  const { token, data, method = 'GET', headers = {} } = options;

  const requestHeaders = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...headers,
  };

  if (token) {
    requestHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers: requestHeaders,
  };

  if (data && method !== 'GET') {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const result = await response.json().catch(() => null);

    if (!response.ok) {
      // Build friendly error object
      const error = new Error(result?.message || 'A celestial error occurred. Please try again.');
      error.status = response.status;
      error.data = result;
      throw error;
    }

    return result;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      const connError = new Error('Cannot connect to the Constellate API server. Please ensure the backend is running.');
      connError.status = 503;
      throw connError;
    }
    throw error;
  }
}

export const authApi = {
  signup: (payload) =>
    apiRequest('/auth/signup/', {
      method: 'POST',
      data: payload,
    }),

  signin: (payload) =>
    apiRequest('/auth/signin/', {
      method: 'POST',
      data: payload,
    }),

  getProfile: (token) =>
    apiRequest('/auth/profile/', {
      method: 'GET',
      token,
    }),

  refreshToken: (refresh) =>
    apiRequest('/auth/token/refresh/', {
      method: 'POST',
      data: { refresh },
    }),
};

export const habitsApi = {
  list: (token, { archived = false } = {}) =>
    apiRequest(`/habits/${archived ? '?archived=true' : ''}`, {
      method: 'GET',
      token,
    }),

  get: (token, id) =>
    apiRequest(`/habits/${id}/`, {
      method: 'GET',
      token,
    }),

  create: (token, payload) =>
    apiRequest('/habits/', {
      method: 'POST',
      data: payload,
      token,
    }),

  update: (token, id, payload) =>
    apiRequest(`/habits/${id}/`, {
      method: 'PATCH',
      data: payload,
      token,
    }),

  archive: (token, id) =>
    apiRequest(`/habits/${id}/archive/`, {
      method: 'POST',
      token,
    }),

  delete: (token, id) =>
    apiRequest(`/habits/${id}/`, {
      method: 'DELETE',
      token,
    }),

  checkin: (token, id, { date, note } = {}) =>
    apiRequest(`/habits/${id}/checkin/`, {
      method: 'POST',
      data: { date, note },
      token,
    }),

  uncheck: (token, id, { date } = {}) =>
    apiRequest(`/habits/${id}/uncheck/`, {
      method: 'POST',
      data: { date },
      token,
    }),
};

export const skyApi = {
  get: (token) =>
    apiRequest('/sky/', {
      method: 'GET',
      token,
    }),
};


