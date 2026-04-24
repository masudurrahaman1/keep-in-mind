const API_URL = import.meta.env.VITE_API_URL || '/api';

const handleResponse = async (response: Response) => {
  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (err) {
    // If not JSON, use the raw text if available, or status text
    data = { message: text || response.statusText || 'Unknown server error' };
  }

  if (!response.ok) {
    throw data;
  }
  return data;
};

export const loginWithGoogle = async (idToken: string) => {
  const response = await fetch(`${API_URL}/auth/google`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token: idToken }),
  });

  return handleResponse(response);
};

export const loginWithEmail = async (email, password) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  
  return handleResponse(response);
};

export const registerWithEmail = async (name, email, password) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  
  return handleResponse(response);
};

export const verifyEmailOTP = async (email, code) => {
  const response = await fetch(`${API_URL}/auth/verify-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code }),
  });
  
  return handleResponse(response);
};

export const linkGoogleAccount = async (idToken: string, jwtToken: string) => {
  const response = await fetch(`${API_URL}/auth/link-google`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwtToken}`
    },
    body: JSON.stringify({ token: idToken }),
  });

  return handleResponse(response);
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

