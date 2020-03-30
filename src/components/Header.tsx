import React from "react";
import { connect, ConnectedProps } from "react-redux";

import { socket } from "../index";
import { resetPlayers } from "../actions/players";
import { resetGame } from "../actions/game";
import { resetType } from "../actions/clientType";
import { History } from "history";

const mapDispatchToProps = (dispatch: any) => ({
  resetPlayers: () => dispatch(resetPlayers()),
  resetType: () => dispatch(resetType()),
  resetGame: () => dispatch(resetGame()),
});
const connector = connect(undefined, mapDispatchToProps);
type HeaderProps = ConnectedProps<typeof connector> & {
  history: History;
};

const Header: React.FC<HeaderProps> = (props) => {
  const goToHome = () => {
    socket.disconnect();
    socket.connect();

    props.resetPlayers();
    props.resetType();
    props.resetGame();
    props.history.push("/");
  };

  return (
    <header className="header">
      <div className="header__content">
        <nav className="navbar">
          <div id="navbarMenu" className="navbar-menu">
            <div className="navbar-start">
              <div className="navbar-item">
                <button type="button" className="button is-text" onClick={goToHome}>
                  Home
                </button>
              </div>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default connector(Header);
