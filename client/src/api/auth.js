const API_URL = '/api/auth';
const POLICY_URL = '/api/policies';
const COMPANY_URL = '/api/companies';
const CUSTOMER_URL = '/api/customers';

const getToken = () => localStorage.getItem('token');
const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
};

const setAuth = (data) => {
  if (!data || !data.token) {
    throw new Error('Invalid response from server. Please try again.');
  }
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data));
  return data;
};

const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

const parseResponse = async (res) => {
  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  if (res.status === 401) {
    if (getToken()) {
      clearAuth();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    throw new Error(data?.message || 'Session expired. Please log in again.');
  }
  if (!res.ok) {
    const msg = data?.message || 'Something went wrong. Please try again.';
    throw new Error(msg);
  }
  if (data === null) {
    throw new Error('Empty response from server.');
  }
  return data;
};

const makeRequester = (base) => async (url, options = {}) => {
  const token = getToken();
  let res;
  try {
    res = await fetch(`${base}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
      ...options,
    });
  } catch {
    throw new Error('Network error. Make sure the server is running.');
  }
  return parseResponse(res);
};

const request = makeRequester(API_URL);
const requestPolicy = makeRequester(POLICY_URL);
const requestCompany = makeRequester(COMPANY_URL);
const requestCustomer = makeRequester(CUSTOMER_URL);

// Auth
export const register = (userData) => request('/register', {
  method: 'POST',
  body: JSON.stringify(userData),
}).then(setAuth);

export const login = (credentials) => request('/login', {
  method: 'POST',
  body: JSON.stringify(credentials),
}).then(setAuth);

export const getProfile = () => request('/profile');
export const updateProfile = (userData) => request('/profile', {
  method: 'PUT',
  body: JSON.stringify(userData),
}).then(data => {
  localStorage.setItem('user', JSON.stringify({ ...getUser(), ...data }));
  return data;
});

// Admin: users
export const getUsers = () => request('/users');
export const createUser = (userData) => request('/users', {
  method: 'POST',
  body: JSON.stringify(userData),
});
export const bulkCreateUsers = (rows) => request('/users/bulk', {
  method: 'POST',
  body: JSON.stringify({ rows }),
});
export const updateUser = (id, userData) => request(`/users/${id}`, {
  method: 'PUT',
  body: JSON.stringify(userData),
});
export const deleteUser = (id) => request(`/users/${id}`, {
  method: 'DELETE',
});

// Policies
export const applyPolicy = (policyData) => requestPolicy('/', {
  method: 'POST',
  body: JSON.stringify(policyData),
});
export const getMyPolicies = () => requestPolicy('/mine');
export const getAllPolicies = () => requestPolicy('/');
export const updatePolicy = (id, policyData) => requestPolicy(`/${id}`, {
  method: 'PUT',
  body: JSON.stringify(policyData),
});
export const deletePolicy = (id) => requestPolicy(`/${id}`, {
  method: 'DELETE',
});
export const bulkCreatePolicies = (rows) => requestPolicy('/bulk', {
  method: 'POST',
  body: JSON.stringify({ rows }),
});

// Companies
export const getCompanies = () => requestCompany('/');
export const createCompany = (companyData) => requestCompany('/', {
  method: 'POST',
  body: JSON.stringify(companyData),
});
export const updateCompany = (id, companyData) => requestCompany(`/${id}`, {
  method: 'PUT',
  body: JSON.stringify(companyData),
});
export const deleteCompany = (id) => requestCompany(`/${id}`, {
  method: 'DELETE',
});
export const bulkCreateCompanies = (rows) => requestCompany('/bulk', {
  method: 'POST',
  body: JSON.stringify({ rows }),
});

// Customers (agent's client list)
export const getCustomers = () => requestCustomer('/');
export const getMyCustomer = () => requestCustomer('/me');
export const createCustomer = (customerData) => requestCustomer('/', {
  method: 'POST',
  body: JSON.stringify(customerData),
});
export const updateCustomer = (id, customerData) => requestCustomer(`/${id}`, {
  method: 'PUT',
  body: JSON.stringify(customerData),
});
export const deleteCustomer = (id) => requestCustomer(`/${id}`, {
  method: 'DELETE',
});
export const bulkCreateCustomers = (rows) => requestCustomer('/bulk', {
  method: 'POST',
  body: JSON.stringify({ rows }),
});

export const logout = () => {
  clearAuth();
};

export const isAuthenticated = () => !!getToken();
export const isAdmin = () => getUser()?.role === 'admin';
export { getUser };
