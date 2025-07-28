const API_BASE_URL = 'http://localhost:5000/api';

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Create headers with auth token
const createHeaders = () => {
  const token = getAuthToken();
  
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// Generic API request function
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  console.log(`Making API request to: ${url}`);
  const config: RequestInit = {
    headers: createHeaders(),
    ...options
  };

  try {
    const response = await fetch(url, config);
    console.log(`Response status: ${response.status}`);
    const data = await response.json();
    console.log(`Response data:`, data);

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Auth API
export const authAPI = {
  login: async (credentials: { username: string; password: string }) => {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    
    if (response.token) {
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    
    return response;
  },

  logout: async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
  },

  getProfile: async () => {
    return apiRequest('/auth/profile');
  }
};

// Members API
export const membersAPI = {
  getAll: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    department?: string;
    status?: string;
  } = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, value.toString());
    });
    
    return apiRequest(`/members?${queryParams}`);
  },

  getById: async (id: string) => {
    return apiRequest(`/members/${id}`);
  },

  create: async (memberData: any) => {
    return apiRequest('/members', {
      method: 'POST',
      body: JSON.stringify(memberData)
    });
  },

  update: async (id: string, memberData: any) => {
    return apiRequest(`/members/${id}`, {
      method: 'PUT',
      body: JSON.stringify(memberData)
    });
  },

  delete: async (id: string) => {
    return apiRequest(`/members/${id}`, {
      method: 'DELETE'
    });
  },

  getStats: async () => {
    return apiRequest('/members/stats/overview');
  }
};

// Events API
export const eventsAPI = {
  getAll: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  } = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, value.toString());
    });
    
    return apiRequest(`/events?${queryParams}`);
  },

  getById: async (id: string) => {
    return apiRequest(`/events/${id}`);
  },

  create: async (eventData: any) => {
    return apiRequest('/events', {
      method: 'POST',
      body: JSON.stringify(eventData)
    });
  },

  update: async (id: string, eventData: any) => {
    return apiRequest(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(eventData)
    });
  },

  delete: async (id: string) => {
    return apiRequest(`/events/${id}`, {
      method: 'DELETE'
    });
  },

  addAttendee: async (eventId: string, memberId: string) => {
    return apiRequest(`/events/${eventId}/attendees`, {
      method: 'POST',
      body: JSON.stringify({ memberId })
    });
  },

  checkInAttendee: async (eventId: string, memberId: string) => {
    return apiRequest(`/events/${eventId}/attendees/${memberId}/checkin`, {
      method: 'PUT'
    });
  }
};

// Dashboard API
export const dashboardAPI = {
  getStats: async () => {
    console.log('Calling dashboard stats API...');
    const result = await apiRequest('/dashboard/stats');
    console.log('Dashboard stats result:', result);
    return result;
  },

  getAttendanceTrend: async () => {
    console.log('Calling attendance trend API...');
    const result = await apiRequest('/dashboard/attendance-trend');
    console.log('Attendance trend result:', result);
    return result;
  }
};

// Reports API
export const reportsAPI = {
  getDepartmentDistribution: async () => {
    return apiRequest('/reports/department-distribution');
  },

  getMonthlySummary: async () => {
    return apiRequest('/reports/monthly-summary');
  },

  getTopEvents: async () => {
    return apiRequest('/reports/top-events');
  },

  getGrowthMetrics: async () => {
    return apiRequest('/reports/growth-metrics');
  }
};

// Registration Forms API
export const registrationAPI = {
  generateForm: async (formData: {
    title?: string;
    description?: string;
    maxSubmissions?: number;
    expiresInDays?: number;
  }) => {
    return apiRequest('/registration/generate', {
      method: 'POST',
      body: JSON.stringify(formData)
    });
  },

  getAllForms: async () => {
    return apiRequest('/registration/forms');
  },

  getFormDetails: async (formId: string) => {
    return apiRequest(`/registration/forms/${formId}`);
  },

  submitForm: async (formId: string, memberData: any) => {
    return apiRequest(`/registration/forms/${formId}/submit`, {
      method: 'POST',
      body: JSON.stringify(memberData)
    });
  },

  deactivateForm: async (formId: string) => {
    return apiRequest(`/registration/forms/${formId}/deactivate`, {
      method: 'PATCH'
    });
  },

  deleteForm: async (formId: string) => {
    return apiRequest(`/registration/forms/${formId}`, {
      method: 'DELETE'
    });
  }
};