import dotenv from "dotenv";
import path from "path";

import fastify from "fastify";
import fastifyStatic from "fastify-static";
import socketio from "socket.io";

import { isValidString } from "./utils/validate";
import GameManager from "./utils/gameManager";

dotenv.config();

const port = process.env.PORT || 30010;
const isDev = process.env.NODE_ENV === "development";
const app = fastify({
  logger: {
    prettyPrint: isDev,
    level: isDev ? "debug" : "info",
  },
});
const publicPath = process.env.PUBLIC_PATH || path.join(__dirname, "..", "..", "public");
const { server } = app;
const io = socketio(server);
const games = new GameManager();

app.log.debug("process.env", process.env);
app.log.debug("publicPath", publicPath);

io.on("connection", (socket) => {
  app.log.info(`${socket.id} connected!`);

  socket.on("msg", () => {
    socket.emit("new", new Date().toTimeString());
  });

  socket.on("createRoom", (config, callback) => {
    if (isValidString(config.room)) {
      if (games.checkRoomName(config.room)) {
        games.addGame(socket.id, config.room);
        socket.join(config.room);

        callback({ code: "success" });
      } else {
        callback({
          code: "ROOMERROR",
          msg: `Room name ${config.room} is taken. Please try another name.`,
        });
      }
    } else {
      callback({
        code: "ROOMERROR",
        msg: `Cannot use empty string for room name.`,
      });
    }
  });

  socket.on("joinRoom", (config, callback) => {
    if (isValidString(config.name) && isValidString(config.room)) {
      const g = games.getGameByRoom(config.room);
      if (g && g.active) {
        return callback({
          code: "NAMEERROR",
          msg: `Cannot join room ${config.name}. Game has already started.`,
        });
      }

      if (!games.checkRoomName(config.room)) {
        if (games.checkUsername(config.room, config.name)) {
          games.addPlayer(config.room, config.name, socket.id);
          socket.join(config.room);
          socket.emit("joinedRoom");
          const game = games.getGameByRoom(config.room);

          if (!game) {
            callback({ code: "INTERNALERROR" });
            return;
          }

          callback({ code: "success" });
          io.to(game.host).emit("PLAYER-CONNECTED", { name: config.name, colour: config.colour, score: 0, stroke: "" });
        } else {
          callback({
            code: "NAMEERROR",
            msg: `${config.name} is already being used in room: ${config.room}`,
          });
        }
      } else {
        callback({
          code: "NAMEERROR",
          msg: "Room does not exist!",
        });
      }
    } else {
      callback({
        code: "NAMEERROR",
        msg: `Please enter both the room name and username.`,
      });
    }
  });

  socket.on("startGame", (_, callback) => {
    const game = games.getGameByHost(socket.id);

    if (!game) {
      callback({ code: "INTERNALERROR" });
      return;
    }

    if (game.room) {
      const players = games.getFromRoom(game.room);

      if (players.length > 0) {
        game.active = true;
        players.forEach((p) => io.to(p.id).emit("gameStarted"));
        callback({ code: "success" });
      } else {
        callback({
          code: "STARTERROR",
          msg: "Not enough players to start the game.",
        });
      }
    } else {
      callback({ code: "INTERNALERROR" });
      // Add error handling!
    }
  });

  socket.on("sendQuestion", (payload, callback) => {
    const { questionText, answers } = payload;
    const game = games.getGameByHost(socket.id);

    if (!game) {
      callback({ code: "INTERNALERROR" });
      return;
    }

    const question = {
      ...payload,
      answers: answers.map((ans: any) => {
        return {
          ...ans,
          answerId: `${Math.round(Date.now())}-${Math.floor(Math.random() * 1000 + 1)}`,
        };
      }),
    };

    app.log.debug("Question: ", question);

    game.currentQuestion = question;
    game.playersThatCanStillAnswer = games.getFromRoom(game.room).length;

    const answersToSend = question.answers.map((ans: any) => {
      // eslint-disable-next-line no-unused-vars
      const { isCorrectAnswer, ...toReturn } = ans;
      return {
        ...toReturn,
      };
    });

    app.log.debug("Sending answers: ", answersToSend);

    io.to(game.room).emit("newQuestion", { questionText, answers: answersToSend });
    callback({ code: "success" });
  });

  socket.on("queueForAnswer", (payload, callback) => {
    const playerAnswering = games.getPlayerBySocket(socket.id);
    const game = games.getGameByRoom(payload.roomName);

    if (!game) {
      callback({ code: "INTERNALERROR" });
      return;
    }

    game.answerTimeout = setTimeout(() => {
      --game.playersThatCanStillAnswer;

      app.log.debug("playersThatCanStillAnswer:", game.playersThatCanStillAnswer);

      if (game.playersThatCanStillAnswer === 0) {
        io.to(game.room).emit("nooneAnswered");
        game.answerTimeout = null;
        return;
      }

      io.to(payload.roomName).emit("answerResult", {
        playerId: socket.id,
        status: "Time's up! you can't answer anymore.",
        success: false,
      });
    }, 10 * 1000); // ten seconds time

    socket.to(payload.roomName).emit("playerAnswering", { username: playerAnswering?.username });
    callback({ code: "success" });
  });

  socket.on("sendAnswer", (payload, callback) => {
    const game = games.getGameByRoom(payload.roomName);

    if (!game) {
      callback({ code: "INTERNALERROR" });
      return;
    }

    if (game.answerTimeout) {
      clearTimeout(game.answerTimeout);
      game.answerTimeout = null;
    }

    const isCorrectAnswer = game.currentQuestion.answers.find((answer: any) => answer.answerId === payload.answerId)
      ?.isCorrectAnswer;
    const playerName = games.getPlayerBySocket(socket.id)?.username;

    const answerResultPayload = {
      playerId: socket.id,
      playerName,
      status: "",
      success: false,
    };

    if (isCorrectAnswer) {
      setTimeout(() => {
        io.to(game.host).emit("updateScoreboard", { playerName });
      }, 5 * 1000);
      answerResultPayload.success = true;
    } else {
      answerResultPayload.status = "Wrong answer!";
    }

    io.to(payload.roomName).emit("answerResult", answerResultPayload);
  });

  socket.on("scoreboardUpdated", (_, callback) => {
    const game = games.getGameByHost(socket.id);

    if (!game) {
      callback({ code: "INTERNALERROR" });
      return;
    }

    io.to(game.room).emit("proceedGame");
    callback({
      code: "success",
    });
  });

  socket.on("disconnect", () => {
    app.log.info(socket.id, "disconnected");
    const type = games.isHostOrPlayer(socket.id);

    if (type === "HOST") {
      const game = games.removeGame(socket.id);

      if (!game) {
        socket.emit("INTERNALERROR");
        return;
      }

      const players = games.removeFromRoom(game.room);
      players.forEach((player) => {
        io.to(player.id).emit("HOST-DISCONNECT");
      });
    } else if (type === "PLAYER") {
      const player = games.removePlayer(socket.id);

      if (!player) {
        socket.emit("INTERNALERROR");
        return;
      }

      const game = games.getGameByRoom(player.room);
      const players = games.getFromRoom(player.room);

      if (!game) {
        socket.emit("INTERNALERROR");
        return;
      }

      if (game.active) {
        if (players.length > 0) {
          io.to(player.room).emit("PLAYER-DISCONNECT", { name: player.username, score: player.score });
        } else {
          games.removeGame(game.host);
          const hostSocket = io.sockets.connected[game.host];
          hostSocket.leave(game.room);
          io.to(game.host).emit("ALL-DISCONNECT");
          app.log.info(games.games, "    ", games.players);
        }
      } else {
        io.to(player.room).emit("PLAYER-DISCONNECT", { name: player.username, score: player.score });
      }
    }
  });
});

app.register(fastifyStatic, { root: publicPath, wildcard: false });
app.get("/*", (req, reply) => {
  reply.sendFile("index.html");
});
app.listen(+port, (err, address) => {
  if (err) throw err;

  app.log.info(`Running on ${address}`);
});
