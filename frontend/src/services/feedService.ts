const API_URL = import.meta.env.VITE_API_URL || 'https://api.keepinmind.in/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const feedService = {
  getFeed: async () => {
    const response = await fetch(`${API_URL}/feed`);
    if (!response.ok) throw new Error('Failed to fetch global feed');
    return response.json();
  },
  
  getPost: async (id: string) => {
    const response = await fetch(`${API_URL}/feed/${id}`);
    if (!response.ok) throw new Error('Failed to fetch post');
    return response.json();
  },

  likePost: async (id: string) => {
    const response = await fetch(`${API_URL}/feed/${id}/like`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to like post');
    return response.json();
  },

  commentPost: async (id: string, text: string) => {
    const response = await fetch(`${API_URL}/feed/${id}/comments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ text })
    });
    if (!response.ok) throw new Error('Failed to post comment');
    return response.json();
  }
};
