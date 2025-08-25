// Device ID management utilities for guest users

// Generate a unique device ID
export const generateDeviceId = () => {
  // Generate a random string for device ID
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2);
  return `device_${timestamp}_${randomStr}`;
};

// Get or create device ID from localStorage
export const getOrCreateDeviceId = () => {
  let deviceId = localStorage.getItem('deviceId');
  
  if (!deviceId) {
    deviceId = generateDeviceId();
    localStorage.setItem('deviceId', deviceId);
  }
  
  return deviceId;
};

// Check if user is a guest (no userId in localStorage)
export const isGuestUser = () => {
  const user = localStorage.getItem('user');
  return !user;
};

// Get user ID from localStorage
export const getUserId = () => {
  const user = localStorage.getItem('user');
  if (user) {
    try {
      const userData = JSON.parse(user);
      return userData.id || userData.userId;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }
  return null;
};

// Clear device ID (useful after login when associating selections)
export const clearDeviceId = () => {
  localStorage.removeItem('deviceId');
};

// Get user info from localStorage
export const getUserInfo = () => {
  const user = localStorage.getItem('user');
  if (user) {
    try {
      return JSON.parse(user);
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }
  return null;
};
