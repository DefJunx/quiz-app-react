import React, { useState, FormEvent, ChangeEvent, MouseEvent, useEffect, useCallback } from "react";
import { connect, ConnectedProps } from "react-redux";

import { setStatus } from "../actions/game";
import { GAME_STATUSES } from "../reducers/game";
import { socket } from "..";
import Debug from "../utils/debug";

const mapStateToProps = (state: any) => ({
  type: state.type,
  status: state.game.status,
  room: state.game.room,
});
const mapDispatchToProps = (dispatch: any) => ({
  setStatus: (status: GAME_STATUSES) => dispatch(setStatus(status)),
});
const connector = connect(mapStateToProps, mapDispatchToProps);

type HostQuestionPageProps = ConnectedProps<typeof connector>;

interface Answer {
  answerText: string;
  isCorrectAnswer: boolean;
}

const HostQuestionPage: React.FC<HostQuestionPageProps> = (props) => {
  const defaultAnswer: Answer = {
    answerText: "",
    isCorrectAnswer: false,
  };
  const defaultPageState = {
    waitingPlayers: false,
    question: "",
    answers: [{ ...defaultAnswer, isCorrectAnswer: true }, defaultAnswer],
    error: "",
  };

  const [pageState, setPageState] = useState(defaultPageState);

  const resetPageState = useCallback(
    (payload?: any) => {
      setPageState({ ...defaultPageState });
    },
    [defaultPageState]
  );

  useEffect(() => {
    socket.on("proceedGame", resetPageState);

    return () => {
      socket.off("proceedGame");
    };
  }, []);
  useEffect(() => {
    socket.on("nooneAnswered", () => {
      alert("No player answered the question! send an easier one ;)");

      resetPageState();
    });

    return () => {
      socket.off("nooneAnswered");
    };
  }, []);

  const onQuestionChange = (e: ChangeEvent<HTMLInputElement>) => {
    const question = e.target.value;
    setPageState({
      ...pageState,
      question,
    });
  };
  const onAnswerChange = (e: ChangeEvent<HTMLInputElement>, answerIndex: number) => {
    const answers: Answer[] = pageState.answers.map((answer, idx) => {
      if (idx === answerIndex) {
        return { ...answer, answerText: e.target.value };
      }

      return answer;
    });

    setPageState({
      ...pageState,
      answers,
    });
  };

  const handleRadioChange = (e: ChangeEvent<HTMLInputElement>) => {
    const answers: Answer[] = pageState.answers.map((answer, idx) => {
      if (idx === +e.target.value) {
        return { ...answer, isCorrectAnswer: true };
      }

      return { ...answer, isCorrectAnswer: false };
    });

    setPageState({
      ...pageState,
      answers,
    });
  };

  const onAddAnswer = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    const answers = [...pageState.answers, defaultAnswer];
    setPageState({ ...pageState, answers });
  };

  const endGame = () => {
    socket.emit("gameEnded", { room: props.room }, (res: any) => {
      if (res.code === "success") {
        return;
      }

      Debug.Log("Error gameEnded emit");
    });
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();

    setPageState({
      ...pageState,
      error: "",
    });

    if (pageState.question === "") {
      setPageState({
        ...pageState,
        error: "Please enter a question.",
      });
      return;
    }

    if (pageState.answers.length < 2) {
      setPageState({
        ...pageState,
        error: "Please enter at least two answers.",
      });
      return;
    }

    const correctAnswers = pageState.answers.filter((answer) => answer.isCorrectAnswer === true);

    if (correctAnswers.length !== 1) {
      setPageState({
        ...pageState,
        error: "invalid number of correct answers.",
      });
      return;
    }

    socket.emit("sendQuestion", { questionText: pageState.question, answers: pageState.answers }, (res: any) => {
      if (res.code === "success") {
        setPageState({
          ...defaultPageState,
          waitingPlayers: true,
        });
        return;
      }

      setPageState({
        ...defaultPageState,
        error: "Error in sending question, please try again",
      });
    });
  };

  return (
    <>
      {pageState.waitingPlayers ? (
        <h2>Waiting for players to answer...</h2>
      ) : (
        <>
          <button
            style={{ marginBottom: "40px" }}
            className="button is-primary"
            type="button"
            onClick={(e) => endGame()}
          >
            End Game
          </button>
          <h2 className="has-text-centered">Ask a question!</h2>
          <form onSubmit={onSubmit}>
            {pageState.error !== "" && <p className="form__error">Error: {pageState.error}</p>}
            <div className="field">
              <label className="label">Question</label>
              <div className="control">
                <input type="text" className="input" value={pageState.question} onChange={onQuestionChange} />
              </div>
            </div>
            {pageState.answers.map((answer, idx) => {
              return (
                <div key={idx}>
                  <div className="field">
                    <label className="label">Answer {idx + 1}</label>
                    <div className="control">
                      <input
                        type="text"
                        className="input"
                        value={answer.answerText}
                        onChange={(e) => onAnswerChange(e, idx)}
                      />
                    </div>
                  </div>
                  {/* TODO: Change with radio button! */}
                  <div className="field">
                    <label className="radio">
                      <input
                        type="radio"
                        name="correctAnswer"
                        value={idx}
                        defaultChecked={idx === 0}
                        onChange={handleRadioChange}
                      />
                      Correct answer
                    </label>
                  </div>
                </div>
              );
            })}

            <div className="field is-grouped">
              <button
                disabled={pageState.answers.length === 4}
                className="button is-primary"
                type="button"
                onClick={onAddAnswer}
              >
                Add answer
              </button>
            </div>

            <div className="field is-grouped">
              <button className="button is-primary" type="submit">
                Send Question
              </button>
            </div>
          </form>
        </>
      )}
    </>
  );
};

export default connector(HostQuestionPage);
