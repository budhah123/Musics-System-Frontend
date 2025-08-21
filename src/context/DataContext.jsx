import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchMusics, fetchUsers, fetchMusicsForSections } from '../api/api';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const [musics, setMusics] = useState([]);
  const [users, setUsers] = useState([]);
  const [sectionMusics, setSectionMusics] = useState({});
  const [loading, setLoading] = useState({
    musics: false,
    users: false,
    sections: false
  });
  const [error, setError] = useState({
    musics: null,
    users: null,
    sections: null
  });

  // Fetch all musics
  const fetchMusicsData = useCallback(async (forceRefresh = false) => {
    console.log('DataContext: fetchMusicsData called, forceRefresh:', forceRefresh);
    try {
      setLoading(prev => ({ ...prev, musics: true }));
      setError(prev => ({ ...prev, musics: null }));
      
      console.log('DataContext: Calling fetchMusics API...');
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout - API may be unreachable')), 10000)
      );
      
      const dataPromise = fetchMusics(!forceRefresh);
      const data = await Promise.race([dataPromise, timeoutPromise]);
      
      console.log('DataContext: fetchMusics API response:', data);
      
      setMusics(data);
      
      // Also update section musics when main musics are fetched
      if (data && data.length > 0) {
        console.log('DataContext: Updating section musics with', data.length, 'tracks');
        updateSectionMusics(data);
      } else {
        console.log('DataContext: No music data received or empty array');
      }
    } catch (err) {
      console.error('DataContext: Error fetching musics:', err);
      setError(prev => ({ ...prev, musics: err.message }));
      
      // If it's a network error, show a more helpful message
      if (err.message.includes('timeout') || err.message.includes('fetch')) {
        setError(prev => ({ 
          ...prev, 
          musics: 'Unable to connect to music server. Please check your internet connection and try again.' 
        }));
      }
    } finally {
      setLoading(prev => ({ ...prev, musics: false }));
      console.log('DataContext: fetchMusicsData completed');
    }
  }, []);

  // Fetch all users
  const fetchUsersData = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(prev => ({ ...prev, users: true }));
      setError(prev => ({ ...prev, users: null }));
      
      const data = await fetchUsers(null, !forceRefresh); // Use cache unless force refresh
      setUsers(data);
    } catch (err) {
      setError(prev => ({ ...prev, users: err.message }));
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(prev => ({ ...prev, users: false }));
    }
  }, []);

  // Update section musics from main musics data
  const updateSectionMusics = useCallback((musicsData) => {
    if (!musicsData || musicsData.length === 0) return;

    const totalMusics = musicsData.length;
    const sections = {
      trending: musicsData.slice(0, Math.min(6, totalMusics)),
      forYou: musicsData.slice(6, Math.min(12, totalMusics)),
      others: musicsData.slice(12)
    };
    
    setSectionMusics(sections);
  }, []);

  // Fetch section musics (optimized - uses main musics data)
  const fetchSectionMusics = useCallback(async (sections = ['trending', 'forYou', 'others']) => {
    try {
      setLoading(prev => ({ ...prev, sections: true }));
      setError(prev => ({ ...prev, sections: null }));
      
      // If we already have musics data, use it to create sections
      if (musics.length > 0) {
        updateSectionMusics(musics);
        return;
      }
      
      // Otherwise fetch fresh data
      const data = await fetchMusicsForSections(sections);
      setSectionMusics(data);
    } catch (err) {
      setError(prev => ({ ...prev, sections: err.message }));
      console.error('Failed to fetch section musics:', err);
    } finally {
      setLoading(prev => ({ ...prev, sections: false }));
    }
  }, [musics, updateSectionMusics]);

  // Refresh all data
  const refreshAllData = useCallback(async () => {
    await Promise.all([
      fetchMusicsData(true),
      fetchUsersData(true)
    ]);
  }, [fetchMusicsData, fetchUsersData]);

  // Initialize data on mount
  useEffect(() => {
    console.log('DataContext: Initializing data fetch');
    // Fetch musics data on mount
    fetchMusicsData();
  }, [fetchMusicsData]);

  // Update section musics when main musics change
  useEffect(() => {
    console.log('DataContext: Musics changed, updating sections', musics.length);
    if (musics.length > 0) {
      updateSectionMusics(musics);
    }
  }, [musics, updateSectionMusics]);

  const value = {
    // Data
    musics,
    users,
    sectionMusics,
    
    // Loading states
    loading,
    
    // Error states
    error,
    
    // Actions
    fetchMusicsData,
    fetchUsersData,
    fetchSectionMusics,
    refreshAllData,
    
    // Utility functions
    updateSectionMusics
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};
