import React, { useEffect, useCallback } from "react";
import { connect, ConnectedProps } from "react-redux";

import { setMessage, resetGame, setStatus, setScoreboard } from "../actions/game";
import { resetPlayers } from "../actions/players";
import { resetType } from "../actions/clientType";
import { History } from "history";
import { socket } from "..";
import { Redirect } from "react-router-dom";
import { Player } from "../models/player";
import { CLIENT_TYPES } from "../reducers/clientType";

import HostQuestionPage from "./HostQuestionPage";
import PlayerQuestionPage from "./PlayerQuestionPage";
import { GAME_STATUSES } from "../reducers/game";
import Debug from "../utils/debug";

const mapStateToProps = (state: any) => ({
  type: state.type,
  players: state.players,
  status: state.game.status,
  room: state.game.room,
  scoreboard: state.game.scoreboard,
});
const mapDispatchToProps = (dispatch: any) => ({
  setMessage: (msg: string) => dispatch(setMessage(msg)),
  setStatus: (status: GAME_STATUSES) => dispatch(setStatus(status)),
  setScoreboard: (scoreboard: any) => dispatch(setScoreboard(scoreboard)),
  resetPlayers: () => dispatch(resetPlayers()),
  resetType: () => dispatch(resetType()),
  resetGame: () => dispatch(resetGame()),
});
const connector = connect(mapStateToProps, mapDispatchToProps);

type QuestionPageProps = ConnectedProps<typeof connector> & {
  history: History;
};

const QuestionPage: React.FC<QuestionPageProps> = (props) => {
  const { scoreboard, setScoreboard, setStatus } = props;

  const gameEndCallback = useCallback(() => {
    setStatus(GAME_STATUSES.FINISHED);
  }, [setStatus]);
  const updateScoresCallback = useCallback(
    (payload) => {
      Debug.Log("updateScoresCallback payload.scores:", payload);
      setScoreboard(payload.scores);
    },
    [setScoreboard]
  );
  const updateScoreboardCallback = useCallback(
    (payload: any) => {
      const newScores: Player[] = [...scoreboard];
      const toUpdateIdx = newScores.findIndex((el) => el.name === payload.playerName);
      newScores[toUpdateIdx].score = newScores[toUpdateIdx].score + 1;

      Debug.Log("newScores:", newScores);

      setScoreboard(newScores);

      socket.emit("scoreboardUpdated", { scores: newScores }, (res: any) => {
        if (res.code === "success") {
          return;
        }

        Debug.Log("Errore scoreboardUpdated:", res);
      });
    },
    [scoreboard]
  );

  useEffect(() => {
    socket.on("gameEnd", gameEndCallback);

    return () => {
      socket.off("gameEnd");
    };
  }, []);
  useEffect(() => {
    socket.on("updateScores", updateScoresCallback);

    return () => {
      socket.off("updateScores");
    };
  }, []);
  useEffect(() => {
    socket.on("updateScoreboard", updateScoreboardCallback);

    return () => {
      socket.off("updateScoreboard");
    };
  }, []);

  const handleReset = () => {
    socket.disconnect();
    socket.connect();
    props.resetPlayers();
    props.resetType();
    props.resetGame();
    props.history.push("/");
  };
  const getWinner = () =>
    (props.scoreboard as Player[]).reduce((max: Player, player: Player) => (max.score > player.score ? max : player), {
      name: "",
      score: 0,
    }).name;

  return (
    <section className="section page page-question">
      {props.type === "" && <Redirect to="/" />}
      <div className="box">
        {props.status === "active" ? (
          <>
            <h1 className="has-text-centered">Game on</h1>
            {props.type === CLIENT_TYPES.HOST ? <HostQuestionPage /> : <PlayerQuestionPage />}
          </>
        ) : (
          <div className="scoreboard">
            <h1>The game has finished! The winner is: {getWinner()}</h1>
            <h2>
              <strong>The scores</strong>
            </h2>
            {props.scoreboard.map((player: Player) => {
              return (
                <div key={player.name}>
                  {player.name}: {player.score}
                </div>
              );
            })}

            <button onClick={handleReset} type="button" className="button is-primary">
              Start again
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default connector(QuestionPage);
