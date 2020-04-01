import React, { useState, ChangeEvent, FormEvent } from "react";
import { connect, ConnectedProps } from "react-redux";
import { Redirect } from "react-router-dom";

import { setRoom } from "../actions/game";
import { socket } from "../index";
import { History } from "history";

const mapStateToProps = (state: { type: string }) => ({
  type: state.type
});
const mapDispatchToProps = (dispatch: any) => ({
  setRoom: (room: string) => dispatch(setRoom(room))
});
const connector = connect(
  mapStateToProps,
  mapDispatchToProps
);
type JoinGamePageProps = ConnectedProps<typeof connector> & {
  history: History;
};

const JoinGamePage: React.FC<JoinGamePageProps> = props => {
  const [pageState, setPageState] = useState({
    room: "",
    name: "",
    error: ""
  });

  const onRoomChange = (e: ChangeEvent<HTMLInputElement>) => {
    const room = e.target.value;
    setPageState({ ...pageState, room });
  };

  const onNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setPageState({ ...pageState, name });
  };

  const submitForm = (e: FormEvent) => {
    e.preventDefault();

    if (pageState.room === "" || pageState.name === "") {
      setPageState({ ...pageState, error: "Please fill all required fields." });
      return;
    }

    const config = {
      name: pageState.name,
      room: pageState.room
    };

    socket.emit("joinRoom", config, (res: any) => {
      if (res.code === "success") {
        setPageState({ ...pageState, error: "" });
        props.setRoom(pageState.room);
        props.history.push("/lobby");
      } else {
        setPageState({ ...pageState, error: res.msg });
      }
    });
  };

  const { type } = props;

  return (
    <section className="section page page--join-game">
      {type === "" && <Redirect to="/" />}
      <div className="box">
        <h1 className="has-text-centered">Join Game</h1>
        <form onSubmit={submitForm}>
          {pageState.error && <p className="form__error">Error: {pageState.error}</p>}

          <div className="field">
            <label className="label">
              Room Name
              <span style={{ color: "red", marginLeft: "5px" }}>*</span>
            </label>
            <div className="control ">
              <input
                type="text"
                className="input"
                placeholder="Room Name"
                value={pageState.room}
                onChange={onRoomChange}
              />
            </div>
          </div>

          <div className="field">
            <label className="label">
              Username
              <span style={{ color: "red", marginLeft: "5px" }}>*</span>
            </label>
            <div className="control">
              <input
                type="text"
                className="input"
                placeholder="Username"
                value={pageState.name}
                onChange={onNameChange}
              />
            </div>
          </div>

          <div className="field is-grouped">
            <button type="submit" className="button is-primary">
              Continue
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default connector(JoinGamePage);
