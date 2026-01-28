import { createContext, useContext, useState } from 'react';

const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
  const [isMuted, setIsMuted] = useState(false);

  // Esta función envuelve el play de cualquier sonido
  const playWithCheck = (playFn) => {
    if (!isMuted) {
      playFn();
    }
  };

  return (
    <AudioContext.Provider value={{ isMuted, setIsMuted, playWithCheck }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => useContext(AudioContext);