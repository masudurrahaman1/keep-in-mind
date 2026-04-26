const API_URL = import.meta.env.VITE_API_URL || '/api';

console.log('Using API_URL:', API_URL);

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

export const loginWithFirebaseToken = async (idToken: string) => {
  const response = await fetch(`${API_URL}/auth/firebase`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token: idToken }),
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

