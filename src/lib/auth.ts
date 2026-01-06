export const auth = {
  setToken: (token: string) => localStorage.setItem('token', token),
  getToken: () => (typeof window !== 'undefined' ? localStorage.getItem('token') : null),
  logout: () => localStorage.removeItem('token'),
  isLoggedIn: () => !!(typeof window !== 'undefined' ? localStorage.getItem('token') : null),
};
