import { compose, createStore, applyMiddleware, combineReducers } from "redux";
import thunk from "redux-thunk";

import playersReducer from "../reducers/players";
import clientTypeReducer from "../reducers/clientType";
import gameReducer from "../reducers/game";

const composeEnchancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export default () => {
  const store = createStore(
    combineReducers({
      players: playersReducer,
      type: clientTypeReducer,
      game: gameReducer,
    }),
    composeEnchancers(applyMiddleware(thunk))
  );

  return store;
};
