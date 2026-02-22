import React from 'react';
import { useGameState } from './useGameState';
import MainMenu from './MainMenu';
import GameScreen from './GameScreen';

const Game: React.FC = () => {
  const state = useGameState();

  if (!state || state.screen === 'menu' || state.screen === 'create') {
    return <MainMenu />;
  }

  return <GameScreen />;
};

export default Game;
