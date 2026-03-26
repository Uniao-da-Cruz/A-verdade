import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
});

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    localStorage.setItem("vigilia_token", token);
    return;
  }

  delete api.defaults.headers.common.Authorization;
  localStorage.removeItem("vigilia_token");
};

const storedToken = localStorage.getItem("vigilia_token");
if (storedToken) {
  setAuthToken(storedToken);
}
