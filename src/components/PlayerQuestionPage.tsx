import React, { useState, useEffect } from "react";
import { GAME_STATUSES } from "../reducers/game";
import { setStatus } from "../actions/game";
import { connect, ConnectedProps } from "react-redux";
import { socket } from "..";

const mapStateToProps = (state: any) => ({
  type: state.type,
  status: state.game.status,
  room: state.game.room
});
const mapDispatchToProps = (dispatch: any) => ({
  setStatus: (status: GAME_STATUSES) => dispatch(setStatus(status))
});
const connector = connect(
  mapStateToProps,
  mapDispatchToProps
);

type PlayerQuestionPageProps = ConnectedProps<typeof connector>;

interface PlayerAnswer {
  answerText: string;
  answerId: string;
}

const PlayerQuestionPage: React.FC<PlayerQuestionPageProps> = props => {
  const defaultPageState = {
    socketId: socket.id,
    canAnswer: true,
    hasQueuedForAnswering: false,
    questionText: "",
    answers: [] as PlayerAnswer[],
    error: "",
    usernameAnswering: "",
    failedAnswer: "",
    genericMessage: ""
  };

  const [pageState, setPageState] = useState({ ...defaultPageState });

  // TODO: Notificare che è finita la partita? Poveracci

  useEffect(
    () => {
      socket.on("proceedGame", () => {
        setPageState({ ...defaultPageState });
      });
    },
    [defaultPageState]
  );

  useEffect(
    () => {
      socket.on("nooneAnswered", () => {
        setPageState(state => ({
          ...state,
          usernameAnswering: "",
          failedAnswer: "Noone answered! New question coming soon",
          canAnswer: false
        }));

        setTimeout(() => {
          setPageState({ ...defaultPageState });
        }, 3 * 1000);
      });

      return () => {
        socket.off("nooneAnswered");
      };
    },
    [defaultPageState]
  );

  useEffect(
    () => {
      socket.on("newQuestion", (payload: { questionText: string; answers: PlayerAnswer[] }) => {
        setPageState({ ...defaultPageState });

        setPageState(state => ({
          ...state,
          questionText: payload.questionText,
          answers: payload.answers,
          canAnswer: true,
          hasQueuedForAnswering: false
        }));

        return () => {
          socket.off("newQuestion");
        };
      });
    },
    [defaultPageState]
  );

  useEffect(() => {
    socket.on("playerAnswering", (payload: any) => {
      setPageState(state => ({
        ...state,
        canAnswer: false,
        hasQueuedForAnswering: true,
        usernameAnswering: payload.username
      }));
    });

    return () => {
      socket.off("playerAnswering");
    };
  }, []);

  useEffect(
    () => {
      socket.on("answerResult", (payload: any) => {
        const { playerId, status, success } = payload;
        const isSamePlayer = pageState.socketId === playerId;

        if (pageState.failedAnswer !== "") {
          return;
        }

        setPageState(state => ({
          ...state,
          canAnswer: true,
          hasQueuedForAnswering: false,
          usernameAnswering: ""
        }));

        if (success) {
          setPageState(state => ({
            ...state,
            canAnswer: false
          }));

          if (isSamePlayer) {
            setPageState(state => ({
              ...state,
              genericMessage: "Your answer is correct! You got one point."
            }));
          } else {
            setPageState(state => ({
              ...state,
              genericMessage: `'${payload.playerName ||
                "Someone else"}' answered correctly! Better luck next question ;)`
            }));
          }
        } else {
          if (isSamePlayer) {
            setPageState(state => ({
              ...state,
              canAnswer: false,
              hasQueuedForAnswering: false,
              failedAnswer: status
            }));
          }
        }
      });

      return () => {
        socket.off("answerResult");
      };
    },
    [pageState.failedAnswer, pageState.socketId]
  );

  const onAnswerQueued = () => {
    socket.emit("queueForAnswer", { roomName: props.room }, (res: any) => {
      if (res.code === "success") {
        setPageState(state => ({
          ...state,
          hasQueuedForAnswering: true
        }));
        return;
      }

      setPageState(state => ({ ...state, error: "There was an error queueing up for an answer. Try again!" }));
    });
  };

  const onAnswerSelected = (answerId: string) => {
    socket.emit("sendAnswer", { answerId, roomName: props.room }, (res: any) => {
      if (res.code === "success") {
        setPageState(state => ({
          ...state,
          hasQueuedForAnswering: false,
          canAnswer: false
        }));
        return;
      }

      setPageState(state => ({ ...state, error: "There was an error queueing up for an answer. Try again!" }));
    });
  };

  return (
    <>
      {pageState.questionText !== "" ? (
        <>
          {(pageState.error !== "" || pageState.failedAnswer !== "") && (
            <p className="form__error">Error: {pageState.error || pageState.failedAnswer}</p>
          )}
          {pageState.usernameAnswering !== "" && <h2>Player {pageState.usernameAnswering} is trying his luck!</h2>}
          {pageState.genericMessage !== "" && <h2>{pageState.genericMessage}</h2>}
          <h2 className="question">{pageState.questionText}</h2>
          <div className="answersContainer">
            {pageState.answers.map((answer: PlayerAnswer) => (
              <div key={answer.answerId} className="field">
                <button
                  disabled={!pageState.hasQueuedForAnswering || !pageState.canAnswer}
                  onClick={() => onAnswerSelected(answer.answerId)}
                  className="button is-primary"
                >
                  {answer.answerText}
                </button>
              </div>
            ))}
          </div>
          <div className="field is-grouped">
            <button
              disabled={pageState.hasQueuedForAnswering || !pageState.canAnswer}
              className="button is-primary"
              type="button"
              onClick={onAnswerQueued}
              style={{ marginTop: "40px" }}
            >
              Answer!
            </button>
          </div>
        </>
      ) : (
        <h2 className="has-text-centered">Waiting for a question...</h2>
      )}
    </>
  );
};

export default connector(PlayerQuestionPage);
