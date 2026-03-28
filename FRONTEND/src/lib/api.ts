import axios from 'axios';

const TOKEN_KEY = 'calendly_token';

const rawBase = import.meta.env.VITE_API_URL ?? '';
const baseURL = typeof rawBase === 'string' ? rawBase.replace(/\/$/, '') : '';

export const api = axios.create({
  baseURL,
  // Bearer token is sent via Authorization header; cookies are not used cross-origin.
  // withCredentials: true + Allow-Origin: * triggers a browser error — keep false for API on :5000.
  withCredentials: false,
});

function applyStoredToken() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

applyStoredToken();

export function setAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
  applyStoredToken();
}

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      setAuthToken(null);
    }
    return Promise.reject(err);
  },
);
