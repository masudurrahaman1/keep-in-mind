const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:5000/api/admin" : "https://api.keepinmind.in/api/admin");

async function fetcher(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem("admin_token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  // Add cache-busting for GET requests to ensure fresh data
  const url = options.method === 'GET' || !options.method 
    ? `${API_BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}_t=${Date.now()}`
    : `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem("admin_token");
    window.location.href = "/login";
    return;
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Unknown error" }));
    throw new Error(error.message || "Request failed");
  }

  return response.json();
}

export const adminService = {
  login: async (credentials: any) => {
    return fetcher("/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  getStats: async () => {
    return fetcher("/stats");
  },
  
  getActivities: async () => {
    return fetcher("/activities");
  },

  getSessions: async () => {
    return fetcher("/sessions");
  },

  deleteUser: async (id: string) => {
    return fetcher(`/users/${id}`, {
      method: "DELETE"
    });
  },

  getUserById: async (id: string) => {
    return fetcher(`/users/${id}`);
  },

  revokeSession: async (id: string) => {
    return fetcher(`/sessions/${id}`, {
      method: "DELETE"
    });
  },

  seed: async () => {
    return fetcher("/seed", {
      method: "POST"
    });
  },

  getPosts: async () => {
    return fetcher("/posts");
  },

  createPost: async (data: any) => {
    return fetcher("/posts", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },

  deletePost: async (id: string) => {
    return fetcher(`/posts/${id}`, {
      method: "DELETE"
    });
  },

  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    
    const token = localStorage.getItem("admin_token");
    const response = await fetch(`${API_BASE_URL}/upload-image`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData
    });

    if (!response.ok) throw new Error("Upload failed");
    return response.json();
  }
};
