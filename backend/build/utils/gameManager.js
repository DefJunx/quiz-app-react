"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class GameManager {
    constructor() {
        this.games = [];
        this.players = [];
    }
    addGame(host, room) {
        const game = {
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
    addPlayer(room, username, id) {
        const player = {
            username,
            id,
            room,
            score: 0,
        };
        this.players.push(player);
        return player;
    }
    removeGame(id) {
        const game = this.games.find((g) => g.host === id);
        if (game) {
            this.games = this.games.filter((game) => {
                return game.host !== id;
            });
        }
        return game;
    }
    removePlayer(socketID) {
        const player = this.players.find((p) => p.id === socketID);
        if (player) {
            this.players = this.players.filter((player) => {
                return player.id !== socketID;
            });
        }
        return player;
    }
    removeFromRoom(room) {
        const removedPlayers = [];
        this.players = this.players.filter((player) => {
            if (player.room === room) {
                removedPlayers.push(player);
            }
            else {
                return player;
            }
        });
        return removedPlayers;
    }
    getFromRoom(room) {
        return (this.players.filter((player) => {
            return player.room === room;
        }) || []);
    }
    isHostOrPlayer(socketID) {
        if (this.getGameByHost(socketID)) {
            return "HOST";
        }
        else if (this.getPlayerBySocket(socketID)) {
            return "PLAYER";
        }
        else
            return "NOTFOUND";
    }
    updateScore(socket, points) {
        const player = this.players.find((p) => p.id === socket);
        if (player) {
            player.score += points;
        }
        return player;
    }
    getGameByHost(hostID) {
        const game = this.games.find((game) => {
            return game.host === hostID;
        });
        return game;
    }
    getGameByRoom(roomName) {
        const game = this.games.find((game) => {
            return game.room === roomName;
        });
        return game;
    }
    getPlayerBySocket(socketID) {
        const player = this.players.find((player) => {
            return player.id === socketID;
        });
        return player;
    }
    checkUsername(room, username) {
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
    checkRoomName(room) {
        const game = this.getGameByRoom(room);
        return !game;
    }
}
exports.default = GameManager;
