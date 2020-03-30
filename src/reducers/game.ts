export const defaultGame = {
  room: "",
  question: {},
  message: "",
  status: "",
  scoreboard: [],
};

export interface GameAction {
  type: string;
  room: string;
  question: object;
  message: string;
  status: string;
  scoreboard: [];
}

export enum GAME_STATUSES {
  ACTIVE = "active",
  FINISHED = "finished",
}

export default (state = defaultGame, action: GameAction) => {
  switch (action.type) {
    case "SET_ROOM":
      return {
        ...state,
        room: action.room,
      };
    case "RESET_ROOM":
      return {
        ...state,
        room: "",
      };
    case "SET_QUESTION":
      return {
        ...state,
        question: action.question,
      };
    case "SET_MESSAGE":
      return {
        ...state,
        message: action.message,
      };
    case "SET_STATUS":
      return {
        ...state,
        status: action.status,
      };
    case "SET_SCOREBOARD":
      return {
        ...state,
        scoreboard: action.scoreboard,
      };
    case "RESET_GAME":
      return defaultGame;
    default:
      return state;
  }
};
