import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { fetchUserFavorites, addToFavorites, removeFromFavorites } from '../api/api';

// Initial state
const initialState = {
  favorites: [],
  loading: false,
  error: null
};

// Action types
const FAVORITES_ACTIONS = {
  FETCH_START: 'FETCH_START',
  FETCH_SUCCESS: 'FETCH_SUCCESS',
  FETCH_FAILURE: 'FETCH_FAILURE',
  ADD_FAVORITE: 'ADD_FAVORITE',
  REMOVE_FAVORITE: 'REMOVE_FAVORITE',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Reducer function
function favoritesReducer(state, action) {
  switch (action.type) {
    case FAVORITES_ACTIONS.FETCH_START:
      return { ...state, loading: true, error: null };
    
    case FAVORITES_ACTIONS.FETCH_SUCCESS:
      return {
        ...state,
        favorites: action.payload,
        loading: false,
        error: null
      };
    
    case FAVORITES_ACTIONS.FETCH_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    
    case FAVORITES_ACTIONS.ADD_FAVORITE:
      return {
        ...state,
        favorites: [...state.favorites, action.payload],
        error: null
      };
    
    case FAVORITES_ACTIONS.REMOVE_FAVORITE:
      return {
        ...state,
        favorites: state.favorites.filter(fav => fav.musicId !== action.payload),
        error: null
      };
    
    case FAVORITES_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload };
    
    case FAVORITES_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };
    
    default:
      return state;
  }
}

// Create context
const FavoritesContext = createContext();

// Provider component
export function FavoritesProvider({ children }) {
  const [state, dispatch] = useReducer(favoritesReducer, initialState);
  const { user, isAuthenticated } = useAuth();

  // Fetch favorites when user logs in
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchFavorites();
    } else {
      // Clear favorites when user logs out
      dispatch({ type: FAVORITES_ACTIONS.FETCH_SUCCESS, payload: [] });
    }
  }, [isAuthenticated, user?.id]);

  // Fetch user favorites
  const fetchFavorites = async () => {
    if (!user?.id) return;
    
    dispatch({ type: FAVORITES_ACTIONS.FETCH_START });
    
    try {
      const data = await fetchUserFavorites(user.id);
      
      // Handle different possible response formats
      let favoritesArray = [];
      if (Array.isArray(data)) {
        favoritesArray = data;
      } else if (data && Array.isArray(data.favorites)) {
        favoritesArray = data.favorites;
      } else if (data && Array.isArray(data.data)) {
        favoritesArray = data.data;
      } else if (data && typeof data === 'object') {
        // If it's a single favorite object, wrap it in an array
        favoritesArray = [data];
      }
      
      dispatch({ type: FAVORITES_ACTIONS.FETCH_SUCCESS, payload: favoritesArray });
    } catch (error) {
      dispatch({ type: FAVORITES_ACTIONS.FETCH_FAILURE, payload: error.message });
    }
  };

  // Add music to favorites
  const addFavorite = async (musicId) => {
    if (!user?.id) {
      dispatch({ type: FAVORITES_ACTIONS.SET_ERROR, payload: 'User not authenticated' });
      return false;
    }

    try {
      const data = await addToFavorites(user.id, musicId);
      
      // Add to local state immediately for optimistic UI update
      dispatch({ type: FAVORITES_ACTIONS.ADD_FAVORITE, payload: { userId: user.id, musicId } });
      
      return true;
    } catch (error) {
      dispatch({ type: FAVORITES_ACTIONS.SET_ERROR, payload: error.message });
      return false;
    }
  };

  // Remove music from favorites
  const removeFavorite = async (musicId) => {
    if (!user?.id) {
      dispatch({ type: FAVORITES_ACTIONS.SET_ERROR, payload: 'User not authenticated' });
      return false;
    }

    try {
      const data = await removeFromFavorites(user.id, musicId);
      
      // Remove from local state immediately for optimistic UI update
      dispatch({ type: FAVORITES_ACTIONS.REMOVE_FAVORITE, payload: musicId });
      
      return true;
    } catch (error) {
      dispatch({ type: FAVORITES_ACTIONS.SET_ERROR, payload: error.message });
      return false;
    }
  };

  // Check if a music is in favorites
  const isFavorite = (musicId) => {
    return state.favorites.some(fav => fav.musicId === musicId);
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: FAVORITES_ACTIONS.CLEAR_ERROR });
  };

  // Context value
  const value = {
    ...state,
    fetchFavorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    clearError
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

// Custom hook to use favorites context
export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
