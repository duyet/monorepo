import { useState, useEffect } from 'react';

export const useKeyPress = (targetKey: string, callback: () => void) => {
  const [keyPressed, setKeyPressed] = useState(false);

  const downHandler = ({ key }: KeyboardEvent) => {
    if (key === targetKey) {
      setKeyPressed(true);
      callback();
    }
  };

  const upHandler = ({ key }: KeyboardEvent) => {
    if (key === targetKey) setKeyPressed(false);
  };

  useEffect(() => {
    window.addEventListener('keydown', downHandler);
    window.addEventListener('keyup', upHandler);

    return () => {
      window.removeEventListener('keydown', downHandler);
      window.removeEventListener('keyup', upHandler);
    };
  });

  return keyPressed;
};

export default useKeyPress;
