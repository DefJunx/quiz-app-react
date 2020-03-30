import React from "react";
import { connect, ConnectedProps } from "react-redux";

import { setHost, setPlayer } from "../actions/clientType";
import { History } from "history";

const mapDispatchToProps = (dispatch: any) => {
  return {
    setHost: () => dispatch(setHost()),
    setPlayer: () => dispatch(setPlayer()),
  };
};
const connector = connect(undefined, mapDispatchToProps);
type DashboardPageProps = ConnectedProps<typeof connector> & {
  history: History;
};

const DashboardPage: React.FC<DashboardPageProps> = (props) => {
  const startAsHost = () => {
    props.setHost();
    props.history.push("/create");
  };

  const startAsPlayer = () => {
    props.setPlayer();
    props.history.push("/join");
  };

  return (
    <section className="section page page--dashboard">
      <div className="box">
        <h1 className="has-text-centered">Trivia Quiz</h1>
        <div className="page__button-group">
          <button onClick={startAsHost} type="button" className="button is-primary">
            Create Game
          </button>
          <button onClick={startAsPlayer} type="button" className="button is-primary">
            Join Game
          </button>
        </div>
      </div>
    </section>
  );
};

export default connector(DashboardPage);
