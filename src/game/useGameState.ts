import { useState, useEffect, useSyncExternalStore } from 'react';
import { getState, subscribe } from './store';

export function useGameState() {
  return useSyncExternalStore(subscribe, getState, getState);
}
