import React from "react";
import { Route } from "react-router-dom";

import Header from "../components/Header";

interface RenderWithHeaderProps {
  path?: string;
  component: any;
  history: any;
}

const RenderWithHeader: React.FC<RenderWithHeaderProps> = props => {
  const { component, ...rest } = props;
  return (
    <Route
      {...rest}
      render={props => (
        <>
          <Header history={props.history} />
          {React.createElement(component, props)}
        </>
      )}
    />
  );
};

export default RenderWithHeader;
