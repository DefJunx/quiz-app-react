import React from "react";
import { Player } from "../models/player";

const Players: React.FC<{ players: Player[] }> = props => {
  const { players } = props;

  return (
    <div className="playerList">
      {players.length === 0
        ? "Give the above room code to let players join"
        : players.map(p => {
            return (
              <h3>
                {p.name} | {p.score}
              </h3>
            );
          })}
    </div>
  );
};

export default Players;
