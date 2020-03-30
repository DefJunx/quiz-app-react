import React from "react";
import { Router, Switch, Route } from "react-router-dom";
import { createBrowserHistory } from "history";

import RenderWithHeader from "./RenderWithHeader";

import DashboardPage from "../components/DashboardPage";
import NotFoundPage from "../components/NotFoundPage";
import CreateGamePage from "../components/CreateGamePage";
import JoinGamePage from "../components/JoinGamePage";
import LobbyPage from "../components/LobbyPage";
import QuestionPage from "../components/QuestionPage";

export const history = createBrowserHistory();

const AppRouter = () => (
  <Router history={history}>
    <Switch>
      <Route exact path="/" component={DashboardPage} />
      <RenderWithHeader path="/create" history={history} component={CreateGamePage} />
      <RenderWithHeader path="/join" history={history} component={JoinGamePage} />
      <RenderWithHeader path="/lobby" history={history} component={LobbyPage} />
      <RenderWithHeader path="/play" history={history} component={QuestionPage} />
      <RenderWithHeader history={history} component={NotFoundPage} />
    </Switch>
  </Router>
);

export default AppRouter;
