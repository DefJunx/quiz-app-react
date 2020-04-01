const defaultType = "";

export enum CLIENT_TYPES {
  HOST = "HOST",
  PLAYER = "PLAYER"
}

export default (state = defaultType, action: { type: string }) => {
  switch (action.type) {
    case "SET_HOST":
      return CLIENT_TYPES.HOST;
    case "SET_PLAYER":
      return CLIENT_TYPES.PLAYER;
    case "RESET_TYPE":
      return defaultType;
    default:
      return state;
  }
};
