import React from "react";
import { Link } from "react-router-dom";

import NotFoundImage from "../assets/img/404.png";

const NotFoundPage: React.FC = () => (
  <section className="section page page--not-found">
    <div className="box has-text-centered">
      <h1>Uh oh!</h1>
      <img style={{ margin: "2.5rem 0" }} src={NotFoundImage} alt="404 not found" />
      <h2>The page you&apos;re looking for could not be found.</h2>
      <div className="page__button-group">
        <Link className="button is-text" to="/">
          Home
        </Link>
      </div>
    </div>
  </section>
);

export default NotFoundPage;
