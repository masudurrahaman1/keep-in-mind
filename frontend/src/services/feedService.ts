const API_URL = import.meta.env.VITE_API_URL || 'https://api.keepinmind.in/api';

export const feedService = {
  getFeed: async () => {
    const response = await fetch(`${API_URL}/feed`);
    if (!response.ok) throw new Error('Failed to fetch global feed');
    return response.json();
  }
};
