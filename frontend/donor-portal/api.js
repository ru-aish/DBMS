
const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to handle API responses
const handleResponse = async (response, errorMessage) => {
  if (!response.ok) {
    try {
      const errorData = await response.json();
      throw new Error(errorData.message || errorMessage);
    } catch (e) {
      if (e.message.includes('JSON')) {
        throw new Error(`${errorMessage}. Server returned status ${response.status}`);
      }
      throw e;
    }
  }
  return response.json();
};

// Login function
window.apiLogin = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      identifier: email,
      password: password
    })
  });

  return handleResponse(response, 'Login failed');
};

// Get donation history
window.getDonationHistory = async (donorId) => {
  const response = await fetch(`${API_BASE_URL}/donor/${donorId}/donations`);
  return handleResponse(response, 'Failed to fetch donation history');
};

// Register donor
window.registerDonor = async (formData) => {
  const response = await fetch(`${API_BASE_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData)
  });

  return handleResponse(response, 'Registration failed');
};

// Donate item
window.donateItem = async (donorId, itemData) => {
  const response = await fetch(`${API_BASE_URL}/donor/${donorId}/donate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(itemData)
  });

  return handleResponse(response, 'Donation failed');
};

// Get donor profile
window.getDonorProfile = async (donorId) => {
  const response = await fetch(`${API_BASE_URL}/donor/${donorId}/profile`);
  return handleResponse(response, 'Failed to fetch profile');
};

// Update donor profile
window.updateDonorProfile = async (donorId, profileData) => {
  const response = await fetch(`${API_BASE_URL}/donor/${donorId}/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(profileData)
  });

  return handleResponse(response, 'Failed to update profile');
};

// Get donor dashboard stats
window.getDonorStats = async (donorId) => {
  const response = await fetch(`${API_BASE_URL}/donor/${donorId}/stats`);
  return handleResponse(response, 'Failed to fetch stats');
};
