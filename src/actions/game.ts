import { GAME_STATUSES } from "../reducers/game";

export const setRoom = (room: any) => ({
  type: "SET_ROOM",
  room
});

export const resetRoom = () => ({
  type: "RESET_ROOM"
});

export const setQuestion = (question: any) => ({
  type: "SET_QUESTION",
  question
});

export const setMessage = (message: string) => ({
  type: "SET_MESSAGE",
  message
});

export const setStatus = (status: GAME_STATUSES) => ({
  type: "SET_STATUS",
  status
});

export const resetGame = () => ({
  type: "RESET_GAME"
});

export const setScoreboard = (scoreboard: any) => ({
  type: "SET_SCOREBOARD",
  scoreboard
});
