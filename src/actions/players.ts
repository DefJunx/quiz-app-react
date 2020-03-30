import { Player } from "../models/player";

export const addPlayer = (player: Player) => ({
  type: "ADD_PLAYER",
  player,
});

export const removePlayer = (name: string) => ({
  type: "REMOVE_PLAYER",
  name,
});

export const resetPlayers = () => ({
  type: "RESET_PLAYERS",
});

export const setPlayers = (players: Player[]) => ({
  type: "SET_PLAYERS",
  players,
});

export const setScore = (name: string, score: number) => ({
  type: "SET_SCORE",
  name,
  score,
});
