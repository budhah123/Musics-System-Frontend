import React, { createContext, useContext, useState, useCallback } from "react";

const DownloadsContext = createContext();

export const useDownloads = () => {
  const context = useContext(DownloadsContext);
  if (!context) {
    throw new Error("useDownloads must be used within a DownloadsProvider");
  }
  return context;
};

export const DownloadsProvider = ({ children }) => {
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addDownload = useCallback((download) => {
    setDownloads((prev) => {
      // Check if download already exists to avoid duplicates
      const exists = prev.some(
        (d) => d.userId === download.userId && d.musicId === download.musicId
      );

      if (exists) {
        // Update existing download with current timestamp
        return prev.map((d) =>
          d.userId === download.userId && d.musicId === download.musicId
            ? { ...d, downloadedAt: new Date().toISOString() }
            : d
        );
      } else {
        // Add new download with current timestamp
        return [{ ...download, downloadedAt: new Date().toISOString() }, ...prev];
      }
    });
  }, []);

  const setDownloadsData = useCallback((data) => {
    setDownloads(Array.isArray(data) ? data : []);
  }, []);

  const setLoadingState = useCallback((isLoading) => {
    setLoading(isLoading);
  }, []);

  const setErrorState = useCallback((errorMessage) => {
    setError(errorMessage);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = {
    downloads,
    loading,
    error,
    addDownload,
    setDownloadsData,
    setLoadingState,
    setErrorState,
    clearError,
  };

  return (
    <DownloadsContext.Provider value={value}>
      {children}
    </DownloadsContext.Provider>
  );
};
