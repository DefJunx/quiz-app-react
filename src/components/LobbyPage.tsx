import React from "react";
import { connect, ConnectedProps } from "react-redux";
import { Redirect } from "react-router-dom";
import { Player } from "../models/player";
import { Game } from "../models/game";
import { socket } from "..";
import { history } from "../routers/AppRouter";
import { CLIENT_TYPES } from "../reducers/clientType";
import { setStatus, setScoreboard } from "../actions/game";
import { GAME_STATUSES } from "../reducers/game";

const mapStateToProps = (state: { type: string; players: Player[]; game: Game }) => ({
  type: state.type,
  players: state.players,
  room: state.game.room
});
const mapDispatchToProps = (dispatch: any) => ({
  setStatus: (status: GAME_STATUSES) => dispatch(setStatus(status)),
  setScoreboard: (scoreboard: Player[]) => dispatch(setScoreboard(scoreboard))
});
const connector = connect(
  mapStateToProps,
  mapDispatchToProps
);
type LobbyPageProps = ConnectedProps<typeof connector>;

const LobbyPage: React.FC<LobbyPageProps> = props => {
  socket.on("gameStarted", () => {
    if (props.type === CLIENT_TYPES.PLAYER) {
      props.setStatus(GAME_STATUSES.ACTIVE);
      history.push("/play");
    }
  });

  const startGame = () => {
    socket.emit("startGame", undefined, (res: any) => {
      if (res.code === "success") {
        // Error Handling
        props.setScoreboard([...props.players]);
        props.setStatus(GAME_STATUSES.ACTIVE);
        history.push("/play");
      }
    });
  };

  return (
    <section className="section page page--lobby">
      {props.type === "" && <Redirect to="/" />}
      <div className="box">
        <h1 className="has-text-centered">Waiting for players to connect...</h1>
        {props.type === CLIENT_TYPES.HOST && (
          <button disabled={props.players.length < 2} onClick={startGame} type="button" className="button is-primary">
            Start Game
          </button>
        )}
        {props.type === CLIENT_TYPES.HOST && (
          <h2>
            Room Code: <strong>{props.room}</strong>
          </h2>
        )}

        {props.type === CLIENT_TYPES.HOST && (
          <>
            <h2>Connected Players:</h2>
            {props.players.length > 0 ? (
              props.players.map((player: Player) => <div key={player.name}>Name: {player.name}</div>)
            ) : (
              <h3>No players yet</h3>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default connector(LobbyPage);
