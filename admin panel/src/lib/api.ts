const API_BASE_URL = import.meta.env.VITE_API_URL || "https://api.keepinmind.in/api/admin";

async function fetcher(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem("admin_token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
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
  }
};
