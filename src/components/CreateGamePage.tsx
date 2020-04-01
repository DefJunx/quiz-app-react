import React, { useState, ChangeEvent, FormEvent } from "react";
import { connect, ConnectedProps } from "react-redux";
import { Redirect } from "react-router-dom";

import { socket } from "../index";
import { setRoom } from "../actions/game";
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
type CreateGamePageProps = ConnectedProps<typeof connector> & {
  history: History;
};

const CreateGamePage: React.FC<CreateGamePageProps> = props => {
  const [pageState, setPageState] = useState({
    room: "",
    error: "",
    background: ""
  });

  const onRoomChange = (e: ChangeEvent<HTMLInputElement>) => {
    const room = e.target.value;
    setPageState({
      ...pageState,
      room
    });
  };

  const submitForm = (e: FormEvent) => {
    e.preventDefault();

    if (pageState.room === "") {
      setPageState({ ...pageState, error: "Please enter all required fields" });
    }

    const config = {
      room: pageState.room
    };

    socket.emit("createRoom", config, (res: any) => {
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
    <section className="section page page--create-game">
      {type === "" && <Redirect to="/" />}
      <div className="box">
        <h1 className="has-text-centered">Create Game</h1>
        <form onSubmit={submitForm}>
          {pageState.error && <p className="form__error">Error: {pageState.error}</p>}
          <div className="field">
            <label className="label">
              Room Name
              <span style={{ color: "red", marginLeft: "5px" }}>*</span>
            </label>
            <div className="control">
              <input
                type="text"
                className="input"
                placeholder="Room Name"
                value={pageState.room}
                onChange={onRoomChange}
              />
            </div>
          </div>
          <div className="field is-grouped">
            <button className="button is-primary" type="submit">
              Continue
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default connector(CreateGamePage);
