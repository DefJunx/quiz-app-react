import { Player } from "../models/player";

const defaultPlayersState: Player[] = [];

export interface PlayerAction {
  type: string;
  player: any;
  name: string;
  score: number;
  players: Player[];
}

export default (state = defaultPlayersState, action: PlayerAction) => {
  switch (action.type) {
    case "ADD_PLAYER":
      return [...state, action.player];
    case "REMOVE_PLAYER":
      return state.filter(player => player.name !== action.name);
    case "RESET_PLAYERS":
      return defaultPlayersState;
    case "SET_PLAYERS":
      return action.players;
    case "SET_SCORE":
      return state.map(player => {
        if (player.name === action.name) {
          return {
            ...player,
            score: action.score
          };
        }

        return player;
      });
    default:
      return state;
  }
};
