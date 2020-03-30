import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import io from "socket.io-client";

import configureStore from "./store/setup";

import AppRouter, { history } from "./routers/AppRouter";

import { addPlayer, removePlayer, setPlayers } from "./actions/players";
import { resetGame } from "./actions/game";
import { resetType } from "./actions/clientType";

import { Player } from "./models/player";

import "./styles/app.scss";

const store = configureStore();
export const socket = io();

socket.on("PLAYER-CONNECTED", (player: Player) => {
  store.dispatch(addPlayer(player));
});

socket.on("PLAYER-DISCONNECT", (player: Player) => {
  store.dispatch(removePlayer(player.name));
});

socket.on("ALL-DISCONNECT", () => {
  const state = store.getState();
  if (state.game.status !== "finished") {
    store.dispatch(resetGame());
    store.dispatch(setPlayers([]));
    store.dispatch(resetType());
    socket.disconnect();
    socket.connect();
    alert("All players disconnected. Taking you back to the home page."); // TODO: Refactor with panel
    history.push("/");
  }
});

socket.on("HOST-DISCONNECT", () => {
  const state = store.getState();
  if (state.game.status !== "finished") {
    store.dispatch(resetGame());
    store.dispatch(setPlayers([]));
    store.dispatch(resetType());
    socket.disconnect();
    socket.connect();
    alert("Host Disconnected. Taking you back to the home page."); // TODO: Refactor with panel
    history.push("/");
  }
});

const jsx = (
  <Provider store={store}>
    <AppRouter />
  </Provider>
);

ReactDOM.render(jsx, document.getElementById("root"));

export default jsx;
