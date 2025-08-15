const API_BASE = 'https://musics-system-2.onrender.com'; 

// Health check function to test backend connectivity
export async function checkBackendHealth() {
  try {
    // Try the root endpoint first
    const rootRes = await fetch(API_BASE);
    
    // Try the musics endpoint
    const musicsRes = await fetch(`${API_BASE}/musics`);
    
    if (musicsRes.ok) {
      return { status: 'healthy', message: 'Backend is responding normally' };
    } else {
      const errorText = await musicsRes.text();
      return { 
        status: 'unhealthy', 
        message: `Backend responded with ${musicsRes.status}: ${errorText}` 
      };
    }
  } catch (error) {
    return { 
      status: 'error', 
      message: `Connection failed: ${error.message}` 
    };
  }
}

// Test backend connectivity
export async function testBackendConnection() {
  try {
    const health = await checkBackendHealth();
    return health;
  } catch (error) {
    return { status: 'error', message: error.message };
  }
}

// Test musics endpoint specifically
export async function testMusicsEndpoint() {
  try {
    const res = await fetch(`${API_BASE}/musics`, { 
      method: 'GET',
      mode: 'cors'
    });
    return res.ok;
  } catch (error) {
    return false;
  }
}

// Register a new user with 'FullName'
export async function registerUser(fullname, email, password) {
  try {
    console.log('API: Attempting registration for:', email);
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        FullName: fullname,
        email,
        password,  
      }),
    });

    console.log('API: Registration response status:', res.status);
    
    let data;
    try {
      data = await res.json();
    } catch (parseError) {
      console.error('API: Failed to parse registration response:', parseError);
      throw new Error('Invalid response from server');
    }

    if (!res.ok) {
      console.error('API: Registration failed with status:', res.status, 'Data:', data);
      throw new Error(data.message || data.error || `Registration failed (${res.status})`);
    }

    console.log('API: Registration successful, response:', data);
    return data;
  } catch (error) {
    console.error('API: Registration error:', error);
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to server');
    }
    throw error;
  }
}

// Login user
export async function loginUser(email, password) {
  try {
    console.log('API: Attempting login for:', email);
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ email: email.trim(), password }),
    });

    console.log('API: Login response status:', res.status);
    
    let data;
    try {
      data = await res.json();
    } catch (parseError) {
      console.error('API: Failed to parse login response:', parseError);
      throw new Error('Invalid response from server');
    }

    if (!res.ok) {
      console.error('API: Login failed with status:', res.status, 'Data:', data);
      throw new Error(data.message || data.error || `Login failed (${res.status})`);
    }

    console.log('API: Login successful, response:', data);
    return data;
  } catch (error) {
    console.error('API: Login error:', error);
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to server');
    }
    throw error;
  }
}

// Fetch all musics from Firestore
export async function fetchMusics() {
  try {
    const res = await fetch(`${API_BASE}/musics`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('fetchMusics: API Error Response:', errorText);
      throw new Error(`HTTP ${res.status}: Failed to fetch musics - ${errorText}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    throw new Error(error.message || 'Network error');
  }
}

// Create a new music entry
export async function createMusic(token, { musicFile, thumbnailFile, title, artist, genre, duration }) {
  try {
    const formData = new FormData();
    formData.append('musicFile', musicFile);
    formData.append('thumbnailFile', thumbnailFile);
    formData.append('title', title);
    formData.append('artist', artist);
    formData.append('genre', genre);
    formData.append('duration', duration);

    const res = await fetch(`${API_BASE}/musics`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Failed to create music');
    }

    return data;
  } catch (error) {
    throw new Error(error.message || 'Network error');
  }
}

// Update a music entry
export async function updateMusic(token, id, musicData) {
  try {
    const res = await fetch(`${API_BASE}/musics/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(musicData),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Failed to update music');
    }

    return data;
  } catch (error) {
    throw new Error(error.message || 'Network error');
  }
}

// Delete a music entry
export async function deleteMusic(token, id) {
  try {
    // Validate inputs
    if (!token) {
      throw new Error('Authentication token is required');
    }
    if (!id) {
      throw new Error('Music ID is required');
    }

    const res = await fetch(`${API_BASE}/musics/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // Handle different response statuses
    if (res.status === 401) {
      throw new Error('Authentication failed. Please log in again.');
    } else if (res.status === 403) {
      throw new Error('You do not have permission to delete this music.');
    } else if (res.status === 404) {
      throw new Error('Music track not found.');
    } else if (res.status === 500) {
      throw new Error('Internal server error. Please try again later.');
    } else if (!res.ok) {
      throw new Error(`Delete failed with status: ${res.status}`);
    }

    // Try to parse response
    let data;
    try {
      data = await res.json();
    } catch (parseError) {
      // If response is not JSON, that's okay for DELETE
      console.log('Response is not JSON, which is normal for DELETE requests');
      data = { success: true };
    }

    return data;
  } catch (error) {
    throw new Error(error.message || 'Failed to delete music');
  }
}

// ===== USER MANAGEMENT API FUNCTIONS =====

// Fetch all users (Admin only)
export async function fetchUsers(token = null) {
  try {
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}/users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: Failed to fetch users`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    throw new Error(error.message || 'Network error');
  }
}

// Update a user (Admin only)
export async function updateUser(token, id, userData) {
  try {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Failed to update user');
    }

    return data;
  } catch (error) {
    throw new Error(error.message || 'Network error');
  }
}

// Delete a user (Admin only)
export async function deleteUser(token, id) {
  try {
    if (!token) {
      throw new Error('Authentication token is required');
    }
    if (!id) {
      throw new Error('User ID is required');
    }

    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (res.status === 401) {
      throw new Error('Authentication failed. Please log in again.');
    } else if (res.status === 403) {
      throw new Error('You do not have permission to delete users.');
    } else if (res.status === 404) {
      throw new Error('User not found.');
    } else if (res.status === 500) {
      throw new Error('Internal server error. Please try again later.');
    } else if (!res.ok) {
      throw new Error(`Delete failed with status: ${res.status}`);
    }

    let data;
    try {
      data = await res.json();
    } catch (parseError) {
      data = { success: true };
    }

    return data;
  } catch (error) {
    throw new Error(error.message || 'Failed to delete user');
  }
}

// ===== FAVORITES API FUNCTIONS =====

// Fetch all favorites for a user
export async function fetchUserFavorites(userId) {
  try {
    console.log('API: Fetching favorites for user:', userId);
    const res = await fetch(`${API_BASE}/favorites/users/${userId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('API: fetchUserFavorites failed with status:', res.status, 'Error:', errorText);
      throw new Error(`Failed to fetch favorites (${res.status}): ${errorText}`);
    }

    const data = await res.json();
    console.log('API: Favorites fetched successfully:', data);
    return data;
  } catch (error) {
    console.error('API: fetchUserFavorites error:', error);
    throw new Error(error.message || 'Failed to fetch favorites');
  }
}

// Add a music to favorites
export async function addToFavorites(userId, musicId) {
  try {
    console.log('API: Adding to favorites - User:', userId, 'Music:', musicId);
    const res = await fetch(`${API_BASE}/favorites`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId, musicId })
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('API: addToFavorites failed with status:', res.status, 'Error:', errorText);
      throw new Error(`Failed to add to favorites (${res.status}): ${errorText}`);
    }

    const data = await res.json();
    console.log('API: Added to favorites successfully:', data);
    return data;
  } catch (error) {
    console.error('API: addToFavorites error:', error);
    throw new Error(error.message || 'Failed to add to favorites');
  }
}

// Remove a music from favorites
export async function removeFromFavorites(userId, musicId) {
  try {
    console.log('API: Removing from favorites - User:', userId, 'Music:', musicId);
    const res = await fetch(`${API_BASE}/favorites`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId, musicId })
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('API: removeFromFavorites failed with status:', res.status, 'Error:', errorText);
      throw new Error(`Failed to remove from favorites (${res.status}): ${errorText}`);
    }

    const data = await res.json();
    console.log('API: Removed from favorites successfully:', data);
    return data;
  } catch (error) {
    console.error('API: removeFromFavorites error:', error);
    throw new Error(error.message || 'Failed to remove from favorites');
  }
}


