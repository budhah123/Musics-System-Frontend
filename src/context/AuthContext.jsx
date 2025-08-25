import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { loginUser, registerUser, associateGuestSelections } from '../api/api';
import { getOrCreateDeviceId, clearDeviceId } from '../utils/deviceUtils';

// Toast notification types
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning'
};

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
  toasts: []
};

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  REGISTER_START: 'REGISTER_START',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAILURE: 'REGISTER_FAILURE',
  SET_LOADING: 'SET_LOADING',
  ADD_TOAST: 'ADD_TOAST',
  REMOVE_TOAST: 'REMOVE_TOAST'
};

// Reducer function
function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return { ...state, loading: true };
    
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false
      };
    
    case AUTH_ACTIONS.LOGIN_FAILURE:
      return { ...state, loading: false };
    
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false
      };
    
    case AUTH_ACTIONS.REGISTER_START:
      return { ...state, loading: true };
    
    case AUTH_ACTIONS.REGISTER_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false
      };
    
    case AUTH_ACTIONS.REGISTER_FAILURE:
      return { ...state, loading: false };
    
    case AUTH_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case AUTH_ACTIONS.ADD_TOAST:
      return {
        ...state,
        toasts: [...state.toasts, { ...action.payload, id: Date.now() }]
      };
    
    case AUTH_ACTIONS.REMOVE_TOAST:
      return {
        ...state,
        toasts: state.toasts.filter(toast => toast.id !== action.payload)
      };
    
    default:
      return state;
  }
}

// Create context
const AuthContext = createContext();

// Provider component
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      console.log('AuthContext: Checking authentication, token exists:', !!token);
      
      if (token) {
        try {
          // You can add a token validation API call here
          // For now, we'll assume the token is valid if it exists
          console.log('AuthContext: Token found, setting authenticated state');
          
          // Restore user state from localStorage if available
          const savedUser = localStorage.getItem('user');
          if (savedUser) {
            const user = JSON.parse(savedUser);
            dispatch({ 
              type: AUTH_ACTIONS.LOGIN_SUCCESS, 
              payload: { user, token } 
            });
          } else {
            // No saved user, stay unauthenticated
            dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
          }
          
          dispatch({ 
            type: AUTH_ACTIONS.LOGIN_SUCCESS, 
            payload: { user, token } 
          });
        } catch (error) {
          console.error('AuthContext: Token validation failed:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          dispatch({ type: AUTH_ACTIONS.LOGOUT });
        }
      } else {
        console.log('AuthContext: No token found, setting unauthenticated state');
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    };

    checkAuth();
  }, []);

  // Save token to localStorage when it changes
  useEffect(() => {
    if (state.token) {
      localStorage.setItem('token', state.token);
    } else {
      localStorage.removeItem('token');
    }
  }, [state.token]);

  // Toast functions
  const addToast = (message, type = TOAST_TYPES.INFO, duration = 5000) => {
    dispatch({
      type: AUTH_ACTIONS.ADD_TOAST,
      payload: { message, type, duration }
    });
  };

  const removeToast = (id) => {
    dispatch({
      type: AUTH_ACTIONS.REMOVE_TOAST,
      payload: id
    });
  };

  // Auth functions
  const login = async (email, password) => {
    console.log('AuthContext: Login attempt for:', email);
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });
    
    try {
      const response = await loginUser(email, password);
      
      // Handle successful login
      const user = { 
        id: response.id || response._id || response.user?.id || response.userId, 
        email: email, 
        name: response.name || response.FullName || response.user?.name || 'User' 
      };
      const token = response.token || response.accessToken || response.user?.token;
      
      // Validate that we have a proper user ID
      if (!user.id) {
        throw new Error('Invalid user ID received from server');
      }
      
      // Save user data to localStorage
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      
      // Associate guest selections if deviceId exists
      try {
        const deviceId = localStorage.getItem('deviceId');
        if (deviceId) {
          await associateGuestSelections(user.id, deviceId);
          clearDeviceId(); // Clear device ID after association
          addToast('Your previous selections have been linked to your account!', TOAST_TYPES.SUCCESS);
        }
      } catch (associateError) {
        console.error('Failed to associate guest selections:', associateError);
        // Don't fail login if association fails
      }
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, token }
      });
      
      addToast('Login successful!', TOAST_TYPES.SUCCESS);
      return { success: true };
    } catch (error) {
      console.error('AuthContext: Login failed:', error);
      dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE });
      addToast(error.message || 'Login failed', TOAST_TYPES.ERROR);
      throw error;
    }
  };

  const register = async (userData) => {
    dispatch({ type: AUTH_ACTIONS.REGISTER_START });
    
    try {
      const response = await registerUser(userData.fullname, userData.email, userData.password);
      
      // Handle successful registration
      const user = { 
        id: response.id || response._id || Math.random().toString(36).substr(2, 9), 
        email: userData.email, 
        name: userData.fullname 
      };
      const token = response.token || response.accessToken || 'default-token';
      
      // Save user data to localStorage
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      
      // Associate guest selections if deviceId exists
      try {
        const deviceId = localStorage.getItem('deviceId');
        if (deviceId) {
          await associateGuestSelections(user.id, deviceId);
          clearDeviceId(); // Clear device ID after association
          addToast('Your previous selections have been linked to your account!', TOAST_TYPES.SUCCESS);
        }
      } catch (associateError) {
        console.error('Failed to associate guest selections:', associateError);
        // Don't fail registration if association fails
      }
      
      dispatch({
        type: AUTH_ACTIONS.REGISTER_SUCCESS,
        payload: { user, token }
      });
      
      addToast('Registration successful!', TOAST_TYPES.SUCCESS);
      return { success: true };
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.REGISTER_FAILURE });
      addToast(error.message || 'Registration failed', TOAST_TYPES.ERROR);
      throw error;
    }
  };

  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
    addToast('Logged out successfully', TOAST_TYPES.INFO);
  };

  // Context value
  const value = {
    ...state,
    login,
    register,
    logout,
    addToast,
    removeToast
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
