// Simple auth token helper using localStorage
export const setToken = (token) => {
  localStorage.setItem('authToken', token);
};

export const getToken = () => {
  return localStorage.getItem('authToken');
};

export const logout = () => {
  localStorage.removeItem('authToken');
};
