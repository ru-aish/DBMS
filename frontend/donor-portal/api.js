const API_BASE_URL = 'http://localhost:3000/api';

export const login = async (email, password) => {
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

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Login failed');
  }

  return response.json();
};

export const getDonationHistory = async (donorId) => {
  const response = await fetch(`${API_BASE_URL}/donor/${donorId}/donations`);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch donation history');
  }

  return response.json();
};
