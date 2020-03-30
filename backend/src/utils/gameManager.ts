import Game from "../models/game";
import Player from "../models/player";

export default class GameManager {
  games: Game[] = [];
  players: Player[] = [];

  addGame(host: string, room: string): Game {
    const game: Game = {
      host,
      room,
      active: false,
      currentQuestion: null,
      answerTimeout: null,
      playersThatCanStillAnswer: 0,
    };

    this.games.push(game);

    return game;
  }

  addPlayer(room: string, username: string, id: string): Player {
    const player = {
      username,
      id,
      room,
      score: 0,
    };

    this.players.push(player);

    return player;
  }

  removeGame(id: string): Game | undefined {
    const game = this.games.find((g) => g.host === id);

    if (game) {
      this.games = this.games.filter((game) => {
        return game.host !== id;
      });
    }

    return game;
  }

  removePlayer(socketID: string): Player | undefined {
    const player = this.players.find((p) => p.id === socketID);

    if (player) {
      this.players = this.players.filter((player) => {
        return player.id !== socketID;
      });
    }

    return player;
  }

  removeFromRoom(room: string): Player[] {
    const removedPlayers: Player[] = [];

    this.players = this.players.filter((player) => {
      if (player.room === room) {
        removedPlayers.push(player);
      } else {
        return player;
      }
    });

    return removedPlayers;
  }

  getFromRoom(room: string): Player[] {
    return (
      this.players.filter((player) => {
        return player.room === room;
      }) || []
    );
  }

  isHostOrPlayer(socketID: string): string {
    if (this.getGameByHost(socketID)) {
      return "HOST";
    } else if (this.getPlayerBySocket(socketID)) {
      return "PLAYER";
    } else return "NOTFOUND";
  }

  updateScore(socket: string, points: number): Player | undefined {
    const player = this.players.find((p) => p.id === socket);

    if (player) {
      player.score += points;
    }

    return player;
  }

  getGameByHost(hostID: string): Game | undefined {
    const game = this.games.find((game) => {
      return game.host === hostID;
    });

    return game;
  }

  getGameByRoom(roomName: string): Game | undefined {
    const game = this.games.find((game) => {
      return game.room === roomName;
    });

    return game;
  }

  getPlayerBySocket(socketID: string): Player | undefined {
    const player = this.players.find((player) => {
      return player.id === socketID;
    });

    return player;
  }

  checkUsername(room: string, username: string): boolean {
    const players = this.getFromRoom(room);
    let available = true;

    players.some((player) => {
      if (player.username === username) {
        available = false;
        return false;
      }

      return true;
    });

    return available;
  }

  checkRoomName(room: string): boolean {
    const game = this.getGameByRoom(room);

    return !game;
  }
}
