const API_URL = import.meta.env.VITE_API_URL || '/api';

export const syncNotesToGoogleDrive = async (notes: any[], googleAccessToken: string, jwtToken: string) => {
  const response = await fetch(`${API_URL}/drive/sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwtToken}`,
    },
    body: JSON.stringify({ notes, googleAccessToken }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Drive sync failed');
  }

  return response.json();
};

export const fetchNotesFromGoogleDrive = async (googleAccessToken: string, jwtToken: string) => {
  const response = await fetch(`${API_URL}/drive/fetch`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwtToken}`,
    },
    body: JSON.stringify({ googleAccessToken }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Drive fetch failed');
  }

  return response.json();
};
