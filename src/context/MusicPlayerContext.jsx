import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';

const MusicPlayerContext = createContext();

export const useMusicPlayer = () => {
  const context = useContext(MusicPlayerContext);
  if (!context) {
    throw new Error('useMusicPlayer must be used within a MusicPlayerProvider');
  }
  return context;
};

export const MusicPlayerProvider = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [playlist, setPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showPlayer, setShowPlayer] = useState(false);
  
  const audioRef = useRef(new Audio());
  const audio = audioRef.current;

  // Initialize audio element
  useEffect(() => {
    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration);
    });

    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime);
    });

    audio.addEventListener('ended', () => {
      // Auto-play next track if available
      if (playlist.length > 0) {
        const nextIndex = (currentIndex + 1) % playlist.length;
        setCurrentIndex(nextIndex);
        if (playlist[nextIndex]) {
          playTrack(playlist[nextIndex], true);
        }
      } else {
        // Reset if no playlist
        setIsPlaying(false);
        setCurrentTime(0);
      }
    });

    audio.addEventListener('error', (e) => {
      console.error('Audio error:', e);
      setIsPlaying(false);
    });

    // Set initial volume
    audio.volume = volume;

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [audio, playlist, currentIndex]);

  // Update volume when it changes
  useEffect(() => {
    audio.volume = volume;
  }, [volume, audio]);

  // Play a specific track
  const playTrack = useCallback((track, autoPlay = true) => {
    if (!track) {
      console.error('No track provided');
      return;
    }

    // Get audio URL from various possible properties
    const audioUrl = track.audioUrl || track.audio || track.musicUrl || track.url;
    
    if (!audioUrl) {
      console.error('No audio URL provided for track:', track);
      return;
    }

    setCurrentTrack(track);
    setShowPlayer(true);
    
    if (audio.src !== audioUrl) {
      audio.src = audioUrl;
      audio.load();
    }

    if (autoPlay) {
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch((error) => {
        console.error('Failed to play audio:', error);
        setIsPlaying(false);
      });
    }
  }, [audio]);

  // Play current track
  const play = useCallback(() => {
    if (currentTrack) {
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch((error) => {
        console.error('Failed to play audio:', error);
        setIsPlaying(false);
      });
    }
  }, [audio, currentTrack]);

  // Pause current track
  const pause = useCallback(() => {
    audio.pause();
    setIsPlaying(false);
  }, [audio]);

  // Toggle play/pause for current track
  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  // Toggle play/pause for a specific track
  const toggleTrackPlay = useCallback((track) => {
    if (currentTrack && currentTrack.id === track.id && isPlaying) {
      // Same track is playing, pause it
      pause();
    } else {
      // Different track or current track is paused, play the new track
      playTrack(track, true);
    }
  }, [currentTrack, isPlaying, pause, playTrack]);

  // Stop current track
  const stop = useCallback(() => {
    audio.pause();
    audio.currentTime = 0;
    setIsPlaying(false);
    setCurrentTime(0);
    setCurrentTrack(null);
    setShowPlayer(false);
  }, [audio]);

  // Seek to specific time
  const seek = useCallback((time) => {
    if (audio.duration) {
      audio.currentTime = Math.max(0, Math.min(time, audio.duration));
      setCurrentTime(audio.currentTime);
    }
  }, [audio]);

  // Set volume
  const setVolumeLevel = useCallback((newVolume) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolume(clampedVolume);
  }, []);

  // Toggle mute
  const toggleMute = useCallback(() => {
    setIsMuted(!isMuted);
    audio.muted = !isMuted;
  }, [isMuted, audio]);

  // Set playlist and play
  const setPlaylistAndPlay = useCallback((tracks, startIndex = 0) => {
    setPlaylist(tracks);
    setCurrentIndex(startIndex);
    
    if (tracks.length > 0 && tracks[startIndex]) {
      playTrack(tracks[startIndex], true);
    }
  }, [playTrack]);

  // Play next track
  const handleNext = useCallback(() => {
    if (playlist.length > 0) {
      const nextIndex = (currentIndex + 1) % playlist.length;
      setCurrentIndex(nextIndex);
      playTrack(playlist[nextIndex], true);
    }
  }, [playlist, currentIndex, playTrack]);

  // Play previous track
  const handlePrevious = useCallback(() => {
    if (playlist.length > 0) {
      const prevIndex = currentIndex === 0 ? playlist.length - 1 : currentIndex - 1;
      setCurrentIndex(prevIndex);
      playTrack(playlist[prevIndex], true);
    }
  }, [playlist, currentIndex, playTrack]);

  // Format time for display
  const formatTime = useCallback((time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  // Check if a specific track is currently playing
  const isTrackPlaying = useCallback((trackId) => {
    return currentTrack && currentTrack.id === trackId && isPlaying;
  }, [currentTrack, isPlaying]);

  const value = {
    // State
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    playlist,
    currentIndex,
    showPlayer,
    
    // Actions
    playTrack,
    play,
    pause,
    togglePlay,
    toggleTrackPlay,
    stop,
    seek,
    setVolumeLevel,
    toggleMute,
    setPlaylistAndPlay,
    handleNext,
    handlePrevious,
    setShowPlayer,
    
    // Utilities
    formatTime,
    isTrackPlaying
  };

  return (
    <MusicPlayerContext.Provider value={value}>
      {children}
    </MusicPlayerContext.Provider>
  );
};
