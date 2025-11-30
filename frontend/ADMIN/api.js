// ===================================================================
// BDSM - Admin Portal API Service Layer
// ===================================================================
// This file provides all API calls for the admin frontend
// Base URL configured for local development
// ===================================================================

const API_BASE_URL = 'http://localhost:3000/api';

// Helper function to handle API responses
async function handleResponse(response) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || 'Something went wrong');
  }
  return response.json();
}

// Helper function to get stored admin data
function getAdminData() {
  const adminData = localStorage.getItem('adminData');
  return adminData ? JSON.parse(adminData) : null;
}

// Helper function to save admin data
function saveAdminData(data) {
  localStorage.setItem('adminData', JSON.stringify(data));
}

// Helper function to clear admin data (logout)
function clearAdminData() {
  localStorage.removeItem('adminData');
}

// ===================================================================
// AUTHENTICATION APIs
// ===================================================================

const AuthAPI = {
  // Admin login
  async login(email, password) {
    const response = await fetch(`${API_BASE_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await handleResponse(response);
    saveAdminData(data);
    return data;
  },

  // Logout
  logout() {
    clearAdminData();
  },

  // Check if logged in
  isAuthenticated() {
    return getAdminData() !== null;
  },

  // Get current admin
  getCurrentAdmin() {
    return getAdminData();
  }
};

// ===================================================================
// DASHBOARD APIs
// ===================================================================

const DashboardAPI = {
  // Get dashboard statistics and data
  async getDashboard() {
    const response = await fetch(`${API_BASE_URL}/admin/dashboard`);
    return handleResponse(response);
  }
};

// ===================================================================
// DONORS APIs
// ===================================================================

const DonorsAPI = {
  // Get all donors with pagination and filters
  async getDonors({ page = 1, limit = 10, status = '', institution = '', search = '' } = {}) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(status && { status }),
      ...(institution && { institution }),
      ...(search && { search })
    });

    const response = await fetch(`${API_BASE_URL}/admin/donors?${params}`);
    return handleResponse(response);
  },

  // Get single donor details
  async getDonor(donorId) {
    const response = await fetch(`${API_BASE_URL}/donor/${donorId}/profile`);
    return handleResponse(response);
  }
};

// ===================================================================
// COMMUNITIES/INSTITUTIONS APIs
// ===================================================================

const CommunitiesAPI = {
  // Get all communities with pagination and filters
  async getCommunities({ page = 1, limit = 10, type = '', verification_status = '', search = '' } = {}) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(type && { type }),
      ...(verification_status && { verification_status }),
      ...(search && { search })
    });

    const response = await fetch(`${API_BASE_URL}/admin/communities?${params}`);
    return handleResponse(response);
  },

  // Verify/Reject community
  async updateVerificationStatus(communityId, status, notes = '') {
    const admin = getAdminData();
    const response = await fetch(`${API_BASE_URL}/admin/communities/${communityId}/verify`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        verification_status: status,
        admin_id: admin.admin_id,
        verification_notes: notes
      })
    });
    return handleResponse(response);
  }
};

// ===================================================================
// REQUESTS APIs
// ===================================================================

const RequestsAPI = {
  // Get all requests with pagination and filters
  async getRequests({ page = 1, limit = 10, status = '', search = '' } = {}) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(status && { status }),
      ...(search && { search })
    });

    const response = await fetch(`${API_BASE_URL}/admin/requests?${params}`);
    return handleResponse(response);
  },

  // Approve/Reject request
  async updateRequestStatus(requestId, status, options = {}) {
    const admin = getAdminData();
    const response = await fetch(`${API_BASE_URL}/admin/requests/${requestId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status,
        admin_id: admin.admin_id,
        ...options
      })
    });
    return handleResponse(response);
  },

  // Approve request
  async approveRequest(requestId) {
    return this.updateRequestStatus(requestId, 'approved');
  },

  // Reject request
  async rejectRequest(requestId, reason) {
    return this.updateRequestStatus(requestId, 'rejected', { rejection_reason: reason });
  },

  // Mark as in fulfillment
  async markInFulfillment(requestId) {
    return this.updateRequestStatus(requestId, 'in_fulfillment');
  },

  // Mark as completed
  async markCompleted(requestId) {
    return this.updateRequestStatus(requestId, 'completed');
  }
};

// ===================================================================
// ITEMS APIs
// ===================================================================

const ItemsAPI = {
  // Get all items with pagination and filters
  async getItems({ page = 1, limit = 10, category = '', condition = '', stock_status = '', search = '' } = {}) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(category && { category }),
      ...(condition && { condition }),
      ...(stock_status && { stock_status }),
      ...(search && { search })
    });

    const response = await fetch(`${API_BASE_URL}/admin/items?${params}`);
    return handleResponse(response);
  },

  // Update item status
  async updateItemStatus(itemId, status) {
    const response = await fetch(`${API_BASE_URL}/admin/items/${itemId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return handleResponse(response);
  }
};

// ===================================================================
// DISTRIBUTIONS APIs
// ===================================================================

const DistributionsAPI = {
  // Get all distributions with pagination and filters
  async getDistributions({ page = 1, limit = 10, status = '', search = '' } = {}) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(status && { status }),
      ...(search && { search })
    });

    const response = await fetch(`${API_BASE_URL}/admin/distributions?${params}`);
    return handleResponse(response);
  },

  // Update distribution status
  async updateDistributionStatus(distributionId, status) {
    const response = await fetch(`${API_BASE_URL}/admin/distributions/${distributionId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return handleResponse(response);
  }
};

// ===================================================================
// PROFILE APIs
// ===================================================================

// ===================================================================
// RECIPIENTS APIs
// ===================================================================

const RecipientsAPI = {
  // Get recipients with filters (pending/verified/rejected)
  async getRecipients(params = {}) {
    const queryParams = new URLSearchParams({
      page: params.page || 1,
      limit: params.limit || 10,
      status: params.status || 'pending',
      ...(params.search && { search: params.search })
    });
    
    const response = await fetch(`${API_BASE_URL}/admin/recipients?${queryParams}`);
    return handleResponse(response);
  },

  // Approve recipient application
  async approveRecipient(recipientId) {
    const admin = getAdminData();
    if (!admin) throw new Error('Not authenticated');

    const response = await fetch(`${API_BASE_URL}/admin/recipients/${recipientId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminId: admin.admin_id })
    });
    return handleResponse(response);
  },

  // Reject recipient application
  async rejectRecipient(recipientId, reason) {
    const admin = getAdminData();
    if (!admin) throw new Error('Not authenticated');

    const response = await fetch(`${API_BASE_URL}/admin/recipients/${recipientId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminId: admin.admin_id, reason })
    });
    return handleResponse(response);
  }
};

// ===================================================================
// PROFILE APIs
// ===================================================================

const ProfileAPI = {
  // Get admin profile
  async getProfile() {
    const admin = getAdminData();
    if (!admin) throw new Error('Not authenticated');
    
    const response = await fetch(`${API_BASE_URL}/admin/${admin.admin_id}/profile`);
    return handleResponse(response);
  },

  // Update admin profile
  async updateProfile(data) {
    const admin = getAdminData();
    if (!admin) throw new Error('Not authenticated');

    const response = await fetch(`${API_BASE_URL}/admin/${admin.admin_id}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  }
};

// ===================================================================
// Export all APIs
// ===================================================================

window.AdminAPI = {
  Auth: AuthAPI,
  Dashboard: DashboardAPI,
  Donors: DonorsAPI,
  Communities: CommunitiesAPI,
  Requests: RequestsAPI,
  Recipients: RecipientsAPI,
  Items: ItemsAPI,
  Distributions: DistributionsAPI,
  Profile: ProfileAPI
};

// Also export individual APIs for convenience
window.AuthAPI = AuthAPI;
window.RecipientsAPI = RecipientsAPI;
window.DashboardAPI = DashboardAPI;
window.DonorsAPI = DonorsAPI;
window.CommunitiesAPI = CommunitiesAPI;
window.RequestsAPI = RequestsAPI;
window.ItemsAPI = ItemsAPI;
window.DistributionsAPI = DistributionsAPI;
window.ProfileAPI = ProfileAPI;

console.log('✅ Admin API Service Layer loaded successfully');
